# x402 支付协议 - 开发者快速参考

## 快速安装

```bash
# 服务端
npm install @x402/express @x402/core @x402/evm

# 客户端  
npm install @x402/fetch @x402/evm viem
```

## 最小示例

### 服务端 (5行代码)

```javascript
import express from "express";
import { paymentMiddleware } from "@x402/express";

const app = express();
app.use(paymentMiddleware({
  "GET /api/data": { accepts: [{ scheme: "exact", price: "$0.001", network: "eip155:84532", payTo: "0x..." }] }
}));
app.get("/api/data", (_, res) => res.json({ hello: "world" }));
app.listen(4021);
```

### 客户端 (3行代码)

```javascript
import { wrapFetchWithPayment } from "@x402/fetch";
const fetchPay = wrapFetchWithPayment(fetch, client);
const data = await (await fetchPay("http://localhost:4021/api/data")).json();
```

## 配置参数

| 参数 | 说明 | 示例 |
|------|------|------|
| scheme | 支付方案 | "exact" |
| price | 价格 | "$0.001" |
| network | 网络 | "eip155:84532" |
| payTo | 收款地址 | "0x..." |

## 网络 ID

| 网络 | Mainnet | Testnet |
|------|---------|---------|
| Base | 8453 | 84532 |
| Ethereum | 1 | 11155111 |

## 命令行

```bash
# 启动测试网
npx serve .

# 检查余额
cast balance 0x... --rpc-url https://sepolia.base.org
```
