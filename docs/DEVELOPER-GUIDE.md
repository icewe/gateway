# x402 开发者指南

## 快速开始

### 1. 安装 SDK

```bash
npm install @x402/sdk
# 或
go get github.com/x402/sdk-go
# 或
pip install x402-python
```

### 2. 创建支付

```javascript
import { X402 } from '@x402/sdk';

const x402 = new X402({
  wallet: '0x...', // 钱包私钥
  gateway: 'https://gateway.x402.org'
});

// 创建支付
const payment = await x402.createPayment({
  amount: 0.01, // USDC
  to: '0xRecipientAddress',
  description: 'API 调用'
});

console.log(payment.id); // payment_xxx
```

### 3. 发起请求

```javascript
// 带支付的 API 调用
const response = await x402.request('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

console.log(await response.json());
```

## 服务器端集成

### Express 中间件

```javascript
import { x402Middleware } from '@x402/sdk/express';

const app = express();

// 配置价格
const prices = {
  '/api/data': { amount: 0.001, currency: 'USDC' },
  '/api/premium': { amount: 0.01, currency: 'USDC' }
};

app.use(x402Middleware({
  facilitator: 'https://facilitator.x402.org',
  prices,
  getRecipient: (path) => '0xOwnerAddress'
}));

app.get('/api/data', (req, res) => {
  res.json({ data: 'example' });
});
```

### 价格策略

```javascript
// 动态定价
const dynamicPricing = {
  '/api/search': {
    basePrice: 0.001,
    perQuery: 0.0001,
    volumeDiscount: {
      1000: 0.9,
      10000: 0.7,
      100000: 0.5
    }
  }
};

// 按时段定价
const timeBasedPricing = {
  '/api/analysis': {
    peak: { hours: [9, 10, 11, 14, 15, 16], price: 0.02 },
    offPeak: { price: 0.01 }
  }
};
```

## 支付验证

### 1. 前置验证

```javascript
// 在处理请求前验证
app.use(async (req, res, next) => {
  const token = req.headers['x402-token'];
  
  if (!token) {
    return res.status(402).json({
      error: 'Payment Required'
    });
  }
  
  try {
    const verified = await x402.verify(token);
    if (!verified) {
      return res.status(402).json({
        error: 'Invalid payment'
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### 2. 后置验证

```javascript
// 处理后验证并扣款
app.post('/api/process', async (req, res) => {
  const token = req.headers['x402-token'];
  
  // 处理请求
  const result = await processRequest(req.body);
  
  // 计算费用
  const fee = calculateFee(result);
  
  // 扣款
  await x402.charge(token, fee);
  
  res.json(result);
});
```

## 最佳实践

### 1. 错误处理

```javascript
try {
  const response = await x402.request(url, options);
  
  if (response.status === 402) {
    // 处理支付错误
    const { amount, payUrl } = await response.json();
    // 引导用户支付
    return { needsPayment: true, amount, payUrl };
  }
  
  return await response.json();
} catch (error) {
  if (error.code === 'INSUFFICIENT_BALANCE') {
    // 余额不足
    return { error: 'Balance insufficient' };
  }
  throw error;
}
```

### 2. 重试机制

```javascript
async function requestWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await x402.request(url, options);
      
      if (response.status === 402) {
        // 需要支付，稍后重试
        await sleep(1000 * (i + 1));
        continue;
      }
      
      return response;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
    }
  }
}
```

### 3. 缓存策略

```javascript
// 缓存支付 token
const paymentCache = new Map();

async function getCachedPayment(endpoint) {
  const cached = paymentCache.get(endpoint);
  
  if (cached && cached.expiresAt > Date.now()) {
    return cached;
  }
  
  const payment = await x402.createPayment({
    amount: getPrice(endpoint),
    to: getRecipient(endpoint)
  });
  
  paymentCache.set(endpoint, payment);
  
  return payment;
}
```

---

*x402 开发者指南 v1.0*
