// x402-payment-demo/client.js
// 客户端示例 - 自动完成 x402 支付

import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import 'dotenv/config';

// 配置
const API_URL = process.env.API_URL || "http://localhost:4021";

// 从环境变量加载私钥
const PRIVATE_KEY = process.env.EVM_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error("❌ 请设置 EVM_PRIVATE_KEY 环境变量");
  console.log("   示例: EVM_PRIVATE_KEY=0xyour_private_key node client.js");
  process.exit(1);
}

const signer = privateKeyToAccount(PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`);

console.log("📱 钱包地址:", signer.address);

// 创建 x402 客户端并注册 EVM 方案
const client = new x402Client();
client.register("eip155:*", new ExactEvmScheme(signer));

// 用 payment 处理包装 fetch
const fetchWithPayment = wrapFetchWithPayment(fetch, client);

// 测试函数
async function testWeather() {
  console.log("\n🌤️  请求天气数据...");
  try {
    const response = await fetchWithPayment(`${API_URL}/api/weather`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ 天气数据:", JSON.stringify(data, null, 2));
    } else {
      console.error("❌ 请求失败:", response.status, await response.text());
    }
  } catch (error) {
    console.error("❌ 错误:", error.message);
  }
}

async function testNews() {
  console.log("\n📰 请求新闻数据...");
  try {
    const response = await fetchWithPayment(`${API_URL}/api/news`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ 新闻数据:", JSON.stringify(data, null, 2));
    } else {
      console.error("❌ 请求失败:", response.status, await response.text());
    }
  } catch (error) {
    console.error("❌ 错误:", error.message);
  }
}

// 主函数
async function main() {
  console.log("🚀 x402 客户端测试\n");
  
  await testWeather();
  await testNews();
  
  console.log("\n✨ 测试完成");
}

main();
