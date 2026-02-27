# x402 企业级应用架构

## 大规模部署架构

```
                              ┌─────────────────┐
                              │   Load Balancer  │
                              └────────┬────────┘
                                       │
         ┌──────────────────────────────┼──────────────────────────────┐
         │                              │                              │
         ▼                              ▼                              ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   API Server 1  │       │   API Server 2  │       │   API Server N  │
│  (x402 Enabled) │       │  (x402 Enabled) │       │  (x402 Enabled) │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                         ┌─────────┴─────────┐
                         │  Redis Cluster   │
                         │  (Session Cache) │
                         └─────────┬─────────┘
                                   │
                         ┌─────────┴─────────┐
                         │  Database        │
                         │ (PostgreSQL)     │
                         └─────────────────┘
```

## 高可用设计

### 1. 多 Facilitator 冗余

```javascript
class X402HighAvailability {
  constructor() {
    this.facilitators = [
      'https://facilitator-1.x402.org',
      'https://facilitator-2.x402.org',
      'https://backup.x402.org'
    ];
    this.currentIndex = 0;
  }
  
  async verify(payment) {
    const errors = [];
    
    // 并行验证所有 facilitator
    const results = await Promise.allSettled(
      this.facilitators.map(f => this.verifyWith(f, payment))
    );
    
    // 至少一个成功
    const success = results.find(r => r.status === 'fulfilled');
    if (!success) {
      throw new Error('All facilitators failed');
    }
    
    return success.value;
  }
  
  async getFacilitator() {
    // 轮询选择
    const f = this.facilitators[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.facilitators.length;
    return f;
  }
}
```

### 2. 支付缓存

```javascript
class PaymentCache {
  constructor(redis) {
    this.redis = redis;
    this.ttl = 3600; // 1小时
  }
  
  async get(key) {
    const cached = await this.redis.get(`payment:${key}`);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(key, value) {
    await this.redis.setex(
      `payment:${key}`,
      this.ttl,
      JSON.stringify(value)
    );
  }
  
  // 生成缓存 key
  generateKey(payment) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(payment))
      .digest('hex')
      .slice(0, 16);
  }
}
```

### 3. 异步支付确认

```javascript
class AsyncPaymentProcessor {
  constructor(queue, db) {
    this.queue = queue;
    this.db = db;
  }
  
  // 立即响应，稍后确认
  async processImmediate(payment) {
    // 1. 生成临时凭证
    const tempToken = this.generateToken();
    
    // 2. 记录待确认
    await this.db.pendingPayments.create({
      token: tempToken,
      payment,
      expiresAt: Date.now() + 300000 // 5分钟
    });
    
    // 3. 发送异步确认任务
    await this.queue.publish('payment.verify', {
      token: tempToken,
      payment
    });
    
    return { success: true, token: tempToken };
  }
  
  // 验证支付
  async verify(token) {
    const pending = await this.db.pendingPayments.findOne({ token });
    
    if (!pending) {
      return { verified: false, reason: 'not_found' };
    }
    
    if (pending.expiresAt < Date.now()) {
      return { verified: false, reason: 'expired' };
    }
    
    // 调用 facilitator 验证
    const result = await this.callFacilitator(pending.payment);
    
    if (result.valid) {
      await this.db.pendingPayments.delete({ token });
      return { verified: true };
    }
    
    return { verified: false, reason: 'invalid' };
  }
}
```

## 费率管理

### 动态定价引擎

```javascript
class DynamicPricing {
  constructor(config) {
    this.basePrices = config.basePrices;
    this.rules = config.rules;
  }
  
  calculatePrice(endpoint, context) {
    let price = this.basePrices[endpoint];
    
    // 应用定价规则
    for (const rule of this.rules) {
      if (rule.match(context)) {
        price = rule.apply(price);
      }
    }
    
    return price;
  }
  
  // 规则示例
  static rules = [
    // 峰值时段加价
    {
      match: (ctx) => ctx.isPeakHour,
      apply: (price) => price * 1.5
    },
    
    // 量大从优
    {
      match: (ctx) => ctx.volume > 10000,
      apply: (price) => price * 0.8
    },
    
    // 新用户优惠
    {
      match: (ctx) => ctx.isNewUser,
      apply: (price) => price * 0.5
    },
    
    // 企业用户
    {
      match: (ctx) => ctx.tier === 'enterprise',
      apply: (price) => price * 0.7
    }
  ];
}
```

### 使用示例

```javascript
const pricing = new DynamicPricing({
  basePrices: {
    '/api/weather': 0.001,
    '/api/analytics': 0.01,
    '/api/premium': 0.05
  },
  rules: DynamicPricing.rules
});

// 计算价格
const price = pricing.calculatePrice('/api/analytics', {
  isPeakHour: true,
  volume: 50000,
  isNewUser: false,
  tier: 'enterprise'
});

console.log(price); // 0.01 * 1.5 * 0.8 = 0.012
```

## 退款处理

### 自动退款流程

```javascript
class RefundProcessor {
  constructor(blockchain, db, notifier) {
    this.blockchain = blockchain;
    this.db = db;
    this.notifier = notifier;
  }
  
  async processRefund(request) {
    const transaction = await this.db.transactions.findOne({
      id: request.transactionId
    });
    
    // 验证退款条件
    const refundable = this.checkRefundable(transaction);
    if (!refundable.allowed) {
      return { success: false, reason: refundable.reason };
    }
    
    // 执行退款
    const txHash = await this.blockchain.refund({
      to: transaction.payer,
      amount: transaction.amount,
      reason: request.reason
    });
    
    // 记录并通知
    await this.db.refunds.create({
      transactionId: transaction.id,
      txHash,
      amount: transaction.amount,
      reason: request.reason
    });
    
    await this.notifier.notify(transaction.userId, {
      type: 'refund',
      amount: transaction.amount,
      txHash
    });
    
    return { success: true, txHash };
  }
  
  checkRefundable(transaction) {
    const hoursSincePayment = 
      (Date.now() - transaction.timestamp) / (1000 * 60 * 60);
    
    // 24小时内可无条件退款
    if (hoursSincePayment <= 24) {
      return { allowed: true };
    }
    
    // 7天内需要审核
    if (hoursSincePayment <= 168) {
      return { 
        allowed: true, 
        requiresApproval: true 
      };
    }
    
    return { allowed: false, reason: 'refund_period_expired' };
  }
}
```

## 合规与审计

### 交易记录

```javascript
class AuditLogger {
  constructor(db) {
    this.db = db;
  }
  
  async log(event) {
    await this.db.auditLogs.create({
      timestamp: new Date(),
      eventType: event.type,
      userId: event.userId,
      transactionId: event.transactionId,
      amount: event.amount,
      status: event.status,
      metadata: event.metadata,
      ip: event.ip,
      userAgent: event.userAgent
    });
  }
  
  // 查询审计日志
  async query(filters) {
    return await this.db.auditLogs.find(filters, {
      orderBy: { timestamp: 'desc' },
      limit: 1000
    });
  }
  
  // 生成合规报告
  async generateReport(startDate, endDate) {
    const transactions = await this.db.transactions.find({
      timestamp: { $gte: startDate, $lte: endDate }
    });
    
    return {
      period: { start: startDate, end: endDate },
      totalTransactions: transactions.length,
      totalVolume: transactions.reduce((sum, t) => sum + t.amount, 0),
      byStatus: this.groupBy(transactions, 'status'),
      byEndpoint: this.groupBy(transactions, 'endpoint')
    };
  }
}
```

---

*企业级架构 v1.0*
