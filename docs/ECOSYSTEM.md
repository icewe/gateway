# x402 技术生态系统

## 1. 核心组件

### Facilitator

```typescript
interface IFacilitator {
  // 支付创建
  createPayment(request: PaymentRequest): Promise<Payment>;
  
  // 支付验证
  verifyPayment(paymentId: string): Promise<VerificationResult>;
  
  // 支付结算
  settlePayment(paymentId: string): Promise<Settlement>;
}
```

### Wallet

```typescript
interface IWallet {
  // 签名交易
  signTransaction(tx: Transaction): Promise<string>;
  
  // 发送交易
  sendTransaction(tx: SignedTransaction): Promise<string>;
  
  // 余额查询
  getBalance(token: string): Promise<BigNumber>;
}
```

## 2. 集成模式

### Server-Side

```typescript
// Express 中间件
app.use(x402Middleware({
  facilitator: 'https://facilitator.x402.org',
  prices: {
    '/api/data': 0.001
  }
}));
```

### Client-Side

```typescript
// 自动处理 402
const client = new X402Client({
  wallet: walletInstance,
  autoHandle402: true
});
```

## 3. 监控

```typescript
class PaymentMonitor {
  async track(paymentId: string): Promise<void> {
    const status = await this.facilitator.getStatus(paymentId);
    
    this.metrics.record({
      paymentId,
      status: status.state,
      duration: Date.now() - status.createdAt
    });
  }
}
```

---

*x402 技术生态系统 v1.0*
