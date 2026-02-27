# MCP A2A 协议对比

## A2A 协议概述

A2A (Agent-to-Agent) 是 Anthropic 提出的 Agent 通信协议。

### 与 MCP 对比

| 特性 | MCP | A2A |
|------|-----|-----|
| **设计目标** | Agent→工具 | Agent↔Agent |
| **传输** | JSON-RPC 2.0 | HTTP + SSE |
| **发现** | 静态注册 | 动态发现 |
| **状态** | 无状态 | 有状态会话 |
| **场景** | 工具调用 | 多 Agent 协作 |

### A2A 消息格式

```json
{
  "jsonrpc": "2.0",
  "id": "unique-id",
  "method": "agents/send",
  "params": {
    "agentId": "agent-123",
    "message": {
      "role": "user",
      "parts": [
        { "type": "text", "text": "Hello" },
        { "type": "file", "file": {"uri": "..."} }
      ]
    },
    "stream": true
  }
}
```

### 核心方法

```typescript
interface A2AMethods {
  // 发现 Agent
  'agents/list': () => Promise<Agent[]>;
  
  // 发送消息
  'agents/send': (params: {
    agentId: string;
    message: Message;
    stream?: boolean;
  }) => Promise<Message | Stream>;
  
  // 获取任务状态
  'tasks/get': (params: { taskId: string }) => Promise<Task>;
  
  // 取消任务
  'tasks/cancel': (params: { taskId: string }) => Promise<void>;
}
```

---

*MCP A2A 协议对比 v1.0*
