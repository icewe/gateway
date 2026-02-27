# x402 开发者实战指南

## 项目搭建

### 1. 环境准备

```bash
# 安装 Node.js 20+
node --version  # v20+

# 安装 pnpm (推荐)
npm install -g pnpm

# 创建项目
mkdir x402-api-demo
cd x402-api-demo
pnpm init
```

### 2. 安装依赖

```bash
# Express + x402
pnpm add express @x402/express @x402/core @x402/evm

# 钱包
pnpm add viem dotenv
```

### 3. 完整服务端实现

```javascript
// server/index.js
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const app = express();
const PORT = process.env.PORT || 4021;

// ===== 配置 =====
const config = {
  // 收款钱包
  receiver: {
    evm: process.env.EVM_RECEIVER || "0x742d35Cc6634C0532925a3b844Bc9e7595f1234",
    svm: process.env.SVM_RECEIVER || "YourSolanaAddress"
  },
  
  // Facilitator (测试网)
  facilitator: {
    url: "https://x402.org/facilitator"
  },
  
  // 价格配置 (美元)
  prices: {
    "/api/weather": "$0.001",
    "/api/news": "$0.005",
    "/api/analytics": "$0.01",
    "/api/premium": "$0.05"
  }
};

// ===== 初始化 x402 =====
const facilitatorClient = new HTTPFacilitatorClient(config.facilitator);

const resourceServer = new x402ResourceServer(facilitatorClient)
  .register("eip155:84532", new ExactEvmScheme())
  .register("solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", new ExactSvmScheme());

// ===== 配置付费端点 =====
const paymentConfig = {
  "GET /api/weather": {
    accepts: [
      {
        scheme: "exact",
        price: config.prices["/api/weather"],
        network: "eip155:84532",
        payTo: config.receiver.evm
      },
      {
        scheme: "exact", 
        price: config.prices["/api/weather"],
        network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
        payTo: config.receiver.svm
      }
    ],
    description: "实时天气数据",
    mimeType: "application/json"
  },
  
  "GET /api/news": {
    accepts: [
      {
        scheme: "exact",
        price: config.prices["/api/news"],
        network: "eip155:84532",
        payTo: config.receiver.evm
      }
    ],
    description: "AI 新闻简报",
    mimeType: "application/json"
  },
  
  "GET /api/analytics": {
    accepts: [
      {
        scheme: "exact",
        price: config.prices["/api/analytics"],
        network: "eip155:84532",
        payTo: config.receiver.evm
      }
    ],
    description: "高级分析数据",
    mimeType: "application/json"
  }
};

// ===== 中间件 =====
app.use(paymentMiddleware(paymentConfig, resourceServer));

// ===== API 端点 =====
app.get("/api/weather", (req, res) => {
  res.json({
    success: true,
    data: {
      location: "Beijing",
      temperature: 22,
      condition: "Sunny",
      humidity: 45,
      wind: 12,
      updatedAt: new Date().toISOString()
    }
  });
});

app.get("/api/news", (req, res) => {
  res.json({
    success: true,
    data: {
      headlines: [
        "AI Agent 取得重大突破",
        "x402 支付协议获得广泛采用",
        "Claude 3.5 发布"
      ],
      count: 3,
      updatedAt: new Date().toISOString()
    }
  });
});

app.get("/api/analytics", (req, res) => {
  res.json({
    success: true,
    data: {
      users: 12500,
      revenue: 45678.90,
      growth: 23.5,
      updatedAt: new Date().toISOString()
    }
  });
});

// 健康检查
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    x402: "enabled",
    prices: config.prices
  });
});

// ===== 启动 =====
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   x402 API Server Running            ║
╠═══════════════════════════════════════╣
║  Port: ${PORT}                          ║
║  Prices:                              ║
║   - /api/weather: ${config.prices["/api/weather"]}           ║
║   - /api/news: ${config.prices["/api/news"]}             ║
║   - /api/analytics: ${config.prices["/api/analytics"]}          ║
╚═══════════════════════════════════════╝
  `);
});
```

### 4. 完整客户端实现

```javascript
// client/index.js
import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import 'dotenv/config';

// ===== 配置 =====
const config = {
  apiBaseUrl: process.env.API_URL || "http://localhost:4021",
  evmPrivateKey: process.env.EVM_PRIVATE_KEY
};

// ===== 初始化钱包 =====
const wallet = privateKeyToAccount(
  config.evmPrivateKey.startsWith('0x') 
    ? config.evmPrivateKey 
    : `0x${config.evmPrivateKey}`
);

console.log("📱 Wallet Address:", wallet.address);

// ===== 初始化 x402 客户端 =====
const x402 = new x402Client();

// 注册 EVM 方案
x402.register("eip155:*", new ExactEvmScheme(wallet));

// 注册 Solana 方案 (可选)
import { ExactSvmScheme } from "@x402/svm/exact/client";
// x402.register("solana:*", new ExactSvmScheme(solanaWallet));

// ===== 包装 fetch =====
const fetchWithPayment = wrapFetchWithPayment(fetch, x402);

// ===== API 调用函数 =====
async function callAPI(endpoint) {
  console.log(`\n📡 Calling ${endpoint}...`);
  
  try {
    const response = await fetchWithPayment(`${config.apiBaseUrl}${endpoint}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Success:", JSON.stringify(data, null, 2));
      return data;
    } else if (response.status === 402) {
      console.log("❌ Payment Required - 需要支付才能访问此端点");
      const wwwAuth = response.headers.get("WWW-Authenticate");
      console.log("   Payment Info:", wwwAuth);
      return null;
    } else {
      console.log("❌ Error:", response.status, await response.text());
      return null;
    }
  } catch (error) {
    console.log("❌ Exception:", error.message);
    return null;
  }
}

// ===== 主程序 =====
async function main() {
  console.log("\n🧪 x402 Payment Client Test\n");
  
  // 测试各个端点
  await callAPI("/api/weather");
  await callAPI("/api/news");
  await callAPI("/api/analytics");
  
  console.log("\n✨ Test Complete");
}

main().catch(console.error);
```

### 5. 环境变量配置

```bash
# .env
# 你的私钥 (注意安全!)
EVM_PRIVATE_KEY=0xyour_private_key_here_without_0x_prefix

# 收款地址 (可选，如果和私钥对应钱包相同)
EVM_RECEIVER=0xYourReceiverAddress

# API 地址
API_URL=http://localhost:4021
PORT=4021
```

### 6. 运行

```bash
# 终端1: 启动服务端
pnpm run server

# 终端2: 运行客户端
pnpm run client
```

## 常见问题解决

### 问题 1: 支付失败

```javascript
// 调试支付
const debugPayment = async (paymentInfo) => {
  console.log("Payment Info:", paymentInfo);
  
  // 检查余额
  const balance = await provider.getBalance(wallet.address);
  console.log("Wallet Balance:", balance);
  
  // 检查授权
  const allowance = await usdc.allowance(wallet.address, facilitatorAddress);
  console.log("USDC Allowance:", allowance);
};
```

### 问题 2: 402 响应但未带支付信息

```javascript
// 检查 WWW-Authenticate header
const checkAuthHeader = (response) => {
  const authHeader = response.headers.get("WWW-Authenticate");
  if (!authHeader) {
    console.log("⚠️ No WWW-Authenticate header!");
    console.log("Response:", await response.text());
  }
  return authHeader;
};
```

---

*实战指南 v1.0*
