# x402 生态应用案例

## 案例 1: AI API 市场

### 场景
构建一个 AI API 市场，开发者可以按需购买各种 AI 能力。

### 架构

```
┌─────────────────────────────────────────────────────────┐
│                    AI API Market                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Provider A ──▶ API ──▶ x402 ──▶ Payment               │
│      │                                    │             │
│      ▼                                    ▼             │
│  定价: $0.001/次                  收益: 90%             │
│                                                          │
│  Provider B ──▶ API ──▶ x402 ──▶ Payment               │
│      │                                    │             │
│      ▼                                    ▼             │
│  定价: $0.005/次                  收益: 85%             │
│                                                          │
│  Consumer ──▶ 搜索 ──▶ 选择 ──▶ 支付 ──▶ 使用           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 实现

```typescript
// Provider 端
class AIProvider {
  async registerEndpoint(config) {
    const endpoint = {
      name: config.name,
      description: config.description,
      capabilities: {
        inputTypes: config.inputTypes,
        outputTypes: config.outputTypes,
        maxTokens: config.maxTokens
      },
      pricing: {
        price: config.price, // 每1000次调用
        unit: 'per_1k_calls',
        minPurchase: 100
      }
    };
    
    return await this.registry.register(endpoint);
  }
  
  // x402 中间件
  middleware() {
    return async (req, res, next) => {
      const { endpoint, action } = req.params;
      
      if (action === 'call') {
        // 检查支付
        const payment = req.headers['x402-token'];
        
        if (!payment) {
          // 返回 402
          const price = await this.getPrice(endpoint);
          return res.status(402).json({
            error: 'Payment Required',
            amount: price,
            payUrl: `${this.gateway}/pay?endpoint=${endpoint}`
          });
        }
        
        // 验证支付
        const valid = await this.payment.verify(payment);
        if (!valid) {
          return res.status(402).json({ error: 'Invalid payment' });
        }
        
        // 记录用量
        await this.usage.record(endpoint, req.user.id);
      }
      
      next();
    };
  }
}

// Consumer 端
class APIConsumer {
  async callAPI(endpoint, params) {
    const response = await this.client.post(
      `https://market.ai/api/${endpoint}/call`,
      params
    );
    
    if (response.status === 402) {
      // 需要支付
      const { amount, payUrl } = response.data;
      
      // 创建支付
      await this.payment.create({
        amount,
        to: response.headers['x402-recipient']
      });
      
      // 重试
      return this.callAPI(endpoint, params);
    }
    
    return response.data;
  }
}
```

## 案例 2: 数据市场

### 场景
提供按需购买的数据查询服务。

### 数据类型

| 类型 | 示例 | 价格 |
|------|------|------|
| 实时数据 | 天气、股价 | $0.01/次 |
| 历史数据 | 历史价格 | $0.001/条 |
| 分析数据 | 趋势报告 | $0.10/次 |
| AI 洞察 | 分析结果 | $0.05/次 |

### 实现

```typescript
class DataMarketplace {
  // 数据源注册
  async registerDataSource(source) {
    const pricing = {
      realtime: 0.01,
      historical: 0.001,
      analytics: 0.10,
      insights: 0.05
    };
    
    return await this.sources.create({
      ...source,
      pricing,
      x402: {
        enabled: true,
        token: this.config.paymentToken
      }
    });
  }
  
  // 查询接口
  async query(req) {
    const { type, params } = req.body;
    const price = this.getPrice(type);
    
    // x402 支付检查
    const payment = req.headers['x402-token'];
    if (!payment) {
      return res.status(402).json({
        type: 'payment_required',
        amount: price,
        currency: 'USDC'
      });
    }
    
    // 获取数据
    const data = await this.getData(type, params);
    
    return { data, price };
  }
}
```

## 案例 3: Agent 服务市场

### 场景
提供付费的 AI Agent 服务。

### 服务类型

```
┌─────────────────────────────────────────┐
│          Agent Service Types              │
├─────────────────────────────────────────┤
│                                          │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  Code Review│  │  QA Testing │      │
│  │  $0.10/次   │  │  $0.20/次   │      │
│  └─────────────┘  └─────────────┘      │
│                                          │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  Translation│  │  Writing   │      │
│  │  $0.01/词   │  │  $0.05/段  │      │
│  └─────────────┘  └─────────────┘      │
│                                          │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  Research   │  │  Analysis  │      │
│  │  $0.50/主题  │  │  $1.00/次  │      │
│  └─────────────┘  └─────────────┘      │
│                                          │
└─────────────────────────────────────────┘
```

### 实现

```typescript
class AgentService {
  // 注册 Agent 服务
  async registerAgent(agent) {
    return await this.services.create({
      name: agent.name,
      description: agent.description,
      capabilities: agent.capabilities,
      pricing: {
        model: agent.pricingModel, // per_call, per_token, per_minute
        price: agent.price
      },
      x402Config: {
        recipient: this.config.wallet,
        token: 'USDC'
      }
    });
  }
  
  // 执行服务
  async executeService(serviceId, input) {
    const service = await this.services.get(serviceId);
    
    // 计算价格
    const price = this.calculatePrice(service, input);
    
    // 检查支付
    const payment = await this.payment.verify(
      input.headers['x402-token'],
      price
    );
    
    if (!payment.valid) {
      throw new Error('Payment required');
    }
    
    // 执行
    const result = await service.execute(input);
    
    // 记录用于结算
    await this.settlement.record({
      serviceId,
      input,
      output: result,
      price
    });
    
    return result;
  }
}
```

---

*x402 生态应用案例 v1.0*
