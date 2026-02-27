# x402 技术标准详解

## 协议头

### 402 Payment Required

```
HTTP/1.1 402 Payment Required
X402-Version: 2024-11
X402-Payment: {
  "scheme": "erc20",
  "token": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "amount": "1000000",
  "recipient": "0x1234567890123456789012345678901234567890",
  "deadline": 1699999999,
  "data": "0x..."
}
X402-Pay-Url: https://pay.example.com/pay?token=xxx
Content-Type: application/json
```

### 支付流程

```
Client                              Server
  │                                    │
  │────── GET /api/data ──────────────▶│
  │                                    │
  │◀─── 402 Payment Required ─────────│
  │     X402-Payment: {...}           │
  │                                    │
  │────── POST /pay {...} ────────────▶│
  │                                    │
  │◀─── 200 OK { token } ─────────────│
  │                                    │
  │────── GET /api/data ──────────────▶│
  │     X402-Token: {token}            │
  │                                    │
  │◀─── 200 OK {data} ────────────────│
  │                                    │
```

## 支付方案

### ERC-20 代币支付

```solidity
interface IX402Payment {
    function pay(
        address token,
        uint256 amount,
        bytes calldata data
    ) external returns (bytes32 paymentId);
    
    function verify(
        bytes32 paymentId,
        address payer
    ) external view returns (bool);
}
```

### 信用卡支付

```typescript
interface CreditCardPayment {
  scheme: 'card';
  card: {
    token: string; // Stripe token
  };
  amount: number;
  currency: 'USD';
}
```

### 加密货币支付

```typescript
interface CryptoPayment {
  scheme: 'crypto';
  network: 'ethereum' | 'bitcoin' | 'solana';
  to: string;
  amount: string;
  txHash?: string;
}
```

## 验证机制

### 1. 前置验证

```
用户请求 → 验证支付头 → 有有效token → 处理请求
              ↓
         无token/无效
              ↓
         返回402
```

### 2. 后置验证

```
用户请求 → 处理请求 → 记录用量 → 定期结算
                        │
                        ▼
                   批量扣款
```

### 3. 异步验证

```
用户请求 → 预授权 → 处理请求 → 异步确认 → 结算
```

---

*x402 技术标准详解 v1.0*
