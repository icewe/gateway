# x402 实战：构建付费天气 API

## 项目概述

本教程将手把手教你构建一个基于 x402 的付费天气 API。

## 步骤 1: 项目初始化

```bash
mkdir weather-api-x402
cd weather-api-x402
npm init -y
npm install express @x402/express @x402/core @x402/evm viem dotenv
```

## 步骤 2: 编写服务端

创建 `server.js`:

```javascript
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const app = express();

// 收款地址
const RECEIVER = process.env.RECEIVER || "0xYourAddress";

// Facilitator
const facilitator = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator"
});

const resourceServer = new x402ResourceServer(facilitator)
  .register("eip155:84532", new ExactEvmScheme());

// 配置付费端点
app.use(paymentMiddleware({
  "GET /api/weather": {
    accepts: [{
      scheme: "exact",
      price: "$0.01",  // 每次查询 $0.01
      network: "eip155:84532",
      payTo: RECEIVER
    }],
    description: "Weather data",
    mimeType: "application/json"
  }
}, resourceServer));

// 天气端点
app.get("/api/weather", (req, res) => {
  res.json({
    location: "Beijing",
    temp: 22,
    condition: "Sunny",
    timestamp: Date.now()
  });
});

app.listen(4021, () => console.log("Weather API running on :4021"));
```

## 步骤 3: 编写客户端

创建 `client.js`:

```javascript
import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import 'dotenv/config';

const signer = privateKeyToAccount(process.env.PRIVATE_KEY);
const client = new x402Client();
client.register("eip155:*", new ExactEvmScheme(signer));

const fetchPay = wrapFetchWithPayment(fetch, client);

// 测试
async function main() {
  const res = await fetchPay("http://localhost:4021/api/weather");
  const data = await res.json();
  console.log(data);
}

main();
```

## 步骤 4: 运行

```bash
# 终端1: 启动服务端
RECEIVER=0xYourAddress npm run server

# 终端2: 运行客户端
PRIVATE_KEY=0xYourPrivateKey node client.js
```

## 步骤 5: 测试网准备

1. 安装 MetaMask
2. 切换到 Base Sepolia
3. 从水龙头获取测试 ETH: https://coinbase.com/faucet
4. 兑换 USDC 到测试网

## 常见问题

### Q: 支付失败？
A: 检查私钥、余额、网络是否正确

### Q: 402 错误？
A: 这是正常的！表示需要支付重试

### Q: 如何提现？
A: 将 Base Sepolia USDC 兑换为主网 USDC
