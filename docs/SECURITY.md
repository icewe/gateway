# x402 安全性深度分析

## 1. 支付安全

### 支付验证流程

```
Client                              Server
  │                                    │
  │────── POST /pay ──────────────────▶│
  │     { amount, to, signature }     │
  │                                    │
  │◀───── 200 OK ─────────────────────│
  │     { payment_id, status }        │
  │                                    │
  │────── GET /api ──────────────────▶│
  │     X402-Token: payment_id       │
  │                                    │
  │◀───── 200 OK ─────────────────────│
  │                                    │
```

### 防重放攻击

```typescript
class PaymentValidator {
  private usedNonces = new Set<string>();
  private nonceTTL = 3600000; // 1小时
  
  async validate(payment: Payment): Promise<boolean> {
    // 检查 nonce
    if (this.usedNonces.has(payment.nonce)) {
      throw new Error('Nonce already used');
    }
    
    // 检查时间戳
    if (Date.now() - payment.timestamp > this.nonceTTL) {
      throw new Error('Payment expired');
    }
    
    // 验证签名
    const valid = this.verifySignature(payment);
    if (!valid) {
      throw new Error('Invalid signature');
    }
    
    // 标记 nonce
    this.usedNonces.add(payment.nonce);
    this.scheduleCleanup(payment.nonce);
    
    return true;
  }
  
  private verifySignature(payment: Payment): boolean {
    const message = this.getSignMessage(payment);
    return this.verify(message, payment.signature, payment.payer);
  }
}
```

### 金额验证

```typescript
class AmountValidator {
  validate(amount: number, endpoint: string): ValidationResult {
    const config = this.getPriceConfig(endpoint);
    
    // 检查最小金额
    if (amount < config.minAmount) {
      return { valid: false, reason: `Minimum amount is ${config.minAmount}` };
    }
    
    // 检查最大金额
    if (amount > config.maxAmount) {
      return { valid: false, reason: `Maximum amount is ${config.maxAmount}` };
    }
    
    // 检查精度
    if (!this.isValidPrecision(amount)) {
      return { valid: false, reason: 'Invalid amount precision' };
    }
    
    return { valid: true };
  }
  
  private isValidPrecision(amount: number): boolean {
    // 最多支持 8 位小数
    const decimals = amount.toString().split('.')[1]?.length || 0;
    return decimals <= 8;
  }
}
```

## 2. 智能合约安全

### 常见漏洞防护

```solidity
// 重入攻击防护
function withdraw() external {
    uint256 balance = balances[msg.sender];
    require(balance > 0, "No balance");
    
    // 先更新状态
    balances[msg.sender] = 0;
    
    // 再转账 (CEI 模式)
    (bool success, ) = msg.sender.call{value: balance}("");
    require(success, "Transfer failed");
}

// 整数溢出防护
function addToBalance(uint256 amount) external {
    // 使用 SafeMath 或 Solidity 0.8+
    balances[msg.sender] += amount;
}
```

### 访问控制

```solidity
// 仅管理员可操作
modifier onlyAdmin() {
    require(admins[msg.sender], "Not admin");
    _;
}

// 价格更新
function updatePrice(string calldata endpoint, uint256 newPrice) 
    external onlyAdmin 
{
    prices[endpoint] = newPrice;
    emit PriceUpdated(endpoint, newPrice);
}
```

## 3. API 安全

### 请求验证

```typescript
class APIValidator {
  validateRequest(req: Request): ValidationResult {
    const errors = [];
    
    // 速率限制
    if (!this.checkRateLimit(req)) {
      errors.push('Rate limit exceeded');
    }
    
    // 签名验证
    if (!this.verifySignature(req)) {
      errors.push('Invalid signature');
    }
    
    // 参数验证
    if (!this.validateParams(req)) {
      errors.push('Invalid parameters');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  private checkRateLimit(req: Request): boolean {
    const key = this.getRateLimitKey(req);
    const count = this.rateLimits.get(key) || 0;
    
    if (count > this.maxRequests) {
      return false;
    }
    
    this.rateLimits.set(key, count + 1);
    return true;
  }
}
```

---

*x402 安全性深度分析 v1.0*
