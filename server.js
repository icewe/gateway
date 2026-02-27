// x402-payment-demo/server.js
// 服务端示例 - 接收 x402 支付

import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { ExactSvmScheme } from "@x402/svm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const app = express();
const PORT = process.env.PORT || 4021;

// 替换为你自己的钱包地址 (测试网)
const EVM_ADDRESS = process.env.EVM_ADDRESS || "0xYourEvmAddress";
const SVM_ADDRESS = process.env.SVM_ADDRESS || "YourSolanaAddress";

// 创建 facilitator 客户端 (测试网)
const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator"
});

const resourceServer = new x402ResourceServer(facilitatorClient)
  .register("eip155:84532", new ExactEvmScheme())      // Base Sepolia
  .register("solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1", new ExactSvmScheme());

app.use(
  paymentMiddleware(
    {
      "GET /api/weather": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.001",
            network: "eip155:84532",
            payTo: EVM_ADDRESS,
          },
          {
            scheme: "exact",
            price: "$0.001",
            network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
            payTo: SVM_ADDRESS,
          },
        ],
        description: "Weather data API",
        mimeType: "application/json",
      },
      "GET /api/news": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.005",
            network: "eip155:84532",
            payTo: EVM_ADDRESS,
          },
        ],
        description: "AI News data",
        mimeType: "application/json",
      },
    },
    resourceServer
  )
);

// 天气 API
app.get("/api/weather", (req, res) => {
  res.json({
    success: true,
    data: {
      location: "Beijing",
      temperature: 22,
      weather: "Sunny",
      humidity: 45,
      timestamp: new Date().toISOString()
    }
  });
});

// 新闻 API
app.get("/api/news", (req, res) => {
  res.json({
    success: true,
    data: {
      headlines: [
        "AI Agent 取得重大突破",
        "x402 支付协议获得广泛采用",
        "MCP 成为行业新标准"
      ],
      timestamp: new Date().toISOString()
    }
  });
});

// 健康检查
app.get("/health", (req, res) => {
  res.json({ status: "ok", x402: "enabled" });
});

app.listen(PORT, () => {
  console.log(`�_server running on http://localhost:${PORT}`);
  console.log(`📋 x402 payment enabled endpoints:`);
  console.log(`   - GET /api/weather ($0.001)`);
  console.log(`   - GET /api/news ($0.005)`);
});
