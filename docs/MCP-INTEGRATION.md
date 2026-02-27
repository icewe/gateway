# x402 与 MCP 集成实战

## 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                  x402 + MCP 集成架构                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐               │
│  │  User  │───▶│  MCP    │───▶│  x402   │               │
│  │ Agent  │    │ Server  │    │Payment  │               │
│  └─────────┘    └────┬────┘    └────┬────┘               │
│                      │               │                       │
│                      ▼               ▼                       │
│               ┌───────────┐    ┌───────────┐               │
│               │  Tools   │    │  Payment  │               │
│               │ Registry │    │  Gateway  │               │
│               └───────────┘    └───────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 实现方案

### 1. MCP Server 集成 x402

```typescript
import { MCPServer } from '@modelcontextprotocol/server';
import { X402Payment } from '@x402/sdk';

class PaidMCPServer {
  constructor(config) {
    this.mcp = new MCPServer({
      name: 'paid-data-service',
      version: '1.0.0'
    });
    
    this.payment = new X402Payment({
      facilitator: config.facilitator,
      token: config.token
    });
    
    this.registerPaidTools();
  }
  
  registerPaidTools() {
    // 注册付费工具
    this.mcp.registerTool({
      name: 'premium_search',
      description: '高级搜索服务',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'number', default: 10 }
        }
      },
      x402: {
        price: 0.01, // 每次调用 $0.01
        unit: 'per_call'
      },
      handler: async (params) => {
        // 检查支付
        await this.payment.verify(params);
        
        // 执行搜索
        return await this.searchService.query(params);
      }
    });
    
    // 注册免费工具
    this.mcp.registerTool({
      name: 'basic_search',
      description: '基础搜索服务',
      inputSchema: { /* ... */ },
      handler: async (params) => {
        return await this.searchService.queryBasic(params);
      }
    });
  }
  
  async handleToolCall(toolName, params, payment) {
    const tool = this.mcp.getTool(toolName);
    
    // 检查是否需要支付
    if (tool.x402 && tool.x402.price > 0) {
      // 验证支付
      const verified = await this.payment.verify({
        ...params,
        amount: tool.x402.price,
        payer: payment.payer
      });
      
      if (!verified) {
        throw new Error('Payment required');
      }
    }
    
    // 执行
    return await tool.handler(params);
  }
}
```

### 2. 支付中间件

```typescript
class X402Middleware {
  constructor(server) {
    this.server = server;
  }
  
  async handleRequest(req, res) {
    // 检查是否有 402 支付头
    const paymentHeader = req.headers['x402-payment'];
    
    if (paymentHeader) {
      // 解析支付信息
      const payment = this.parsePaymentHeader(paymentHeader);
      
      // 验证支付
      const verified = await this.verifyPayment(payment);
      
      if (!verified) {
        // 返回 402 需支付
        return this.send402Response(res, payment);
      }
    }
    
    // 继续处理请求
    return await this.server.handle(req, res);
  }
  
  parsePaymentHeader(header) {
    // 解析支付头
    const parts = header.split(' ');
    return {
      scheme: parts[0],
      data: parts[1]
    };
  }
  
  async verifyPayment(payment) {
    // 调用 facilitator 验证
    const result = await fetch(`${this.facilitator}/verify`, {
      method: 'POST',
      body: JSON.stringify(payment)
    });
    
    return result.ok;
  }
  
  send402Response(res, required) {
    res.status(402);
    res.set('X402-Required', JSON.stringify(required));
    res.json({
      error: 'Payment Required',
      amount: required.amount,
      currency: required.currency,
      payUrl: required.payUrl
    });
  }
}
```

### 3. 客户端集成

```typescript
import { X402Client } from '@x402/sdk';

class MCPClientWithPayment {
  constructor(config) {
    this.mcp = new MCPClient(config);
    this.x402 = new X402Client({
      wallet: config.wallet,
      token: config.token
    });
  }
  
  async callTool(toolName, params) {
    // 获取工具信息
    const toolInfo = await this.mcp.getToolInfo(toolName);
    
    // 检查是否需要支付
    if (toolInfo.x402 && toolInfo.x402.price > 0) {
      // 创建支付
      const payment = await this.x402.createPayment({
        amount: toolInfo.x402.price,
        to: toolInfo.x402.recipient,
        description: `Call ${toolName}`
      });
      
      // 如果支付失败或需要完成
      if (payment.status === 'pending') {
        // 完成支付
        await this.x402.completePayment(payment);
      }
      
      // 带上支付凭证调用
      return await this.mcp.callTool(toolName, params, {
        payment: payment.id
      });
    }
    
    // 免费工具直接调用
    return await this.mcp.callTool(toolName, params);
  }
}
```

---

*x402 与 MCP 集成实战 v1.0*
