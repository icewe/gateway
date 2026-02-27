# x402 支付协议深度解析

## 架构概览

```
┌─────────┐    402     ┌─────────┐   /verify   ┌──────────────┐
│  Client  │ ─────────▶ │ Server  │ ─────────▶ │ Facilitator  │
│ (Buyer) │ ◀───────── │ (Seller)│ ◀───────── │              │
└─────────┘   + Payment └─────────┘   /settle  └──────────────┘
```

## 核心流程详解

### 1. 支付请求阶段

```
Client                    Server
  │                         │
  │──── GET /api/data ────▶│
  │◀─── 402 Payment Required ───│
  │      WWW-Authenticate: x402 │
  │                         │
```

### 2. Payment Header 格式

```http
WWW-Authenticate: x402 
  scheme="exact",
  network="eip155:84532",
  price="$0.001",
  pay-to="0x742d35Cc6634C0532925a3b844Bc9e7595f1234",
  description="API Access",
  expires-in=3600
```

### 3. 支付凭证构建

```javascript
const buildPaymentHeader = (params) => {
  const { scheme, network, price, payTo, description } = params;
  
  // 构建 x402 支付凭证
  const credentials = {
    scheme,
    network,
    price,
    pay_to: payTo,
    description,
    nonce: crypto.randomUUID(),
    timestamp: Math.floor(Date.now() / 1000)
  };
  
  return `x402 ${Buffer.from(JSON.stringify(credentials)).toString('base64')}`;
};
```

### 4. 完整支付流程实现

```javascript
class X402Client {
  constructor(wallet, network = 'eip155:84532') {
    this.wallet = wallet;
    this.network = network;
  }
  
  async request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Accept': 'application/json'
      }
    });
    
    // 402 需要支付
    if (response.status === 402) {
      const paymentInfo = this.parseWwwAuthenticate(
        response.headers.get('WWW-Authenticate')
      );
      
      // 执行支付
      await this.pay(paymentInfo);
      
      // 带支付凭证重试
      return this.request(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': await this.getPaymentHeader(paymentInfo)
        }
      });
    }
    
    return response;
  }
  
  parseWwwAuthenticate(header) {
    // 解析 x402 header
    const match = header.match(/x402\s+(.+)/);
    return JSON.parse(Buffer.from(match[1], 'base64').toString());
  }
  
  async pay(paymentInfo) {
    // 构建支付交易
    const tx = await this.buildPaymentTransaction(paymentInfo);
    
    // 签名并发送
    const signedTx = await this.wallet.signTransaction(tx);
    const txHash = await this.provider.sendTransaction(signedTx);
    
    // 等待确认
    await txHash.wait();
    
    return txHash;
  }
}
```

## 支持的网络

| 网络 | Chain ID | 状态 | 特点 |
|------|----------|------|------|
| Base Sepolia | 84532 | ✅ 测试网 | 低费用 |
| Base Mainnet | 8453 | ✅ 主网 | 稳定 |
| Ethereum Sepolia | 11155111 | ✅ 测试网 | 高安全性 |
| Ethereum Mainnet | 1 | ✅ 主网 | 高流动性 |

## 支付方案 (Schemes)

### Exact Scheme（精确金额）

```javascript
{
  scheme: "exact",
  price: "$0.001",
  network: "eip155:84532",
  payTo: "0x..."
}
```

### 未来支持

- 订阅方案 (subscription)
- 竞价方案 (auction)
- 荷兰拍 (dutch auction)

---

*深度解析 v1.0*
