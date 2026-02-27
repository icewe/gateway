# MCP 协议深度解析

## 协议规范

### 消息格式

```json
// JSON-RPC 2.0 格式
{
  "jsonrpc": "2.0",
  "id": "唯一标识符",
  "method": "方法名",
  "params": { 
    // 方法参数
  }
}
```

### 核心方法

| 方法 | 方向 | 描述 |
|------|------|------|
| initialize | Client→Server | 初始化连接 |
| initialized | Server→Client | 初始化确认 |
| tools/list | Client→Server | 列出可用工具 |
| tools/call | Client→Server | 调用工具 |
| resources/list | Client→Server | 列出资源 |
| resources/read | Client→Server | 读取资源 |
| prompts/list | Client→Server | 列出提示模板 |
| prompts/get | Client→Server | 获取提示 |

### 初始化流程

```
Client                              Server
  │                                    │
  │──── initialize (请求) ────────────▶│
  │  {                                  │
  │    protocolVersion: "2024-11-05",   │
  │    capabilities: {                 │
  │      tools: {},                     │
  │      resources: {},                │
  │      prompts: {}                    │
  │    },                               │
  │    clientInfo: {                    │
  │      name: "claude",               │
  │      version: "1.0"                 │
  │    }                                │
  │  }                                  │
  │                                    │
  │◀─── initialize (响应) ─────────────│
  │  {                                  │
  │    protocolVersion: "2024-11-05",  │
  │    capabilities: {                 │
  │      tools: {}                      │
  │    },                               │
  │    serverInfo: {                    │
  │      name: "filesystem",           │
  │      version: "1.0.0"              │
  │    }                                │
  │  }                                  │
  │                                    │
  │──── initialized (通知) ────────────▶│
  │                                    │
```

## 能力协商

### Capabilities 结构

```typescript
interface ServerCapabilities {
  // 工具能力
  tools?: {
    // 是否支持列表
    listChanged?: boolean;
  };
  
  // 资源能力
  resources?: {
    // 是否支持订阅
    subscribe?: boolean;
    // 是否支持变更通知
    listChanged?: boolean;
  };
  
  // 提示能力
  prompts?: {
    // 是否支持变更通知
    listChanged?: boolean;
  };
  
  // 日志能力
  logging?: {
    // 支持的日志级别
    supportedLevels?: string[];
  };
}

interface ClientCapabilities {
  // 工具回调
  tools?: {
    // 是否支持 toolCall 通知
    toolCallNotifications?: boolean;
  };
  
  // 资源订阅
  resources?: {
    // 是否支持订阅
    subscribe?: boolean;
  };
}
```

## 工具定义

### Tool 结构

```typescript
interface Tool {
  // 工具名称 (必需)
  name: string;
  
  // 工具描述 (必需)
  description: string;
  
  // 输入参数模式 (JSON Schema)
  inputSchema: {
    type: "object";
    properties?: {
      [key: string]: {
        type: "string" | "number" | "boolean" | "array" | "object";
        description?: string;
        enum?: any[];
        default?: any;
        minimum?: number;
        maximum?: number;
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        items?: object;
        properties?: object;
        required?: string[];
      };
    };
    required?: string[];
    additionalProperties?: boolean;
  };
}
```

### 工具调用示例

```json
// 请求
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "tools/call",
  "params": {
    "name": "filesystem_read_file",
    "arguments": {
      "path": "/Users/test/readme.md"
    }
  }
}

// 响应
{
  "jsonrpc": "2.0",
  "id": "1",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "# My Project\n\nThis is..."
      },
      {
        "type": "resource",
        "resource": {
          "uri": "file:///Users/test/readme.md",
          "mimeType": "text/markdown"
        }
      }
    ],
    "isError": false
  }
}
```

## 资源系统

### Resource 结构

```typescript
interface Resource {
  // 资源 URI (必需)
  uri: string;
  
  // 资源名称
  name?: string;
  
  // 资源描述
  description?: string;
  
  // MIME 类型
  mimeType?: string;
  
  // 资源是否可执行
  executable?: boolean;
}
```

### 资源读取

```json
// 请求
{
  "jsonrpc": "2.0",
  "id": "2",
  "method": "resources/read",
  "params": {
    "uri": "file:///config/app.json"
  }
}

// 响应
{
  "jsonrpc": "2.0",
  "id": "2",
  "result": {
    "contents": [
      {
        "uri": "file:///config/app.json",
        "mimeType": "application/json",
        "text": "eyJhcHAiOi..."
      }
    ]
  }
}
```

## 提示模板

### Prompt 结构

```typescript
interface Prompt {
  // 提示名称
  name: string;
  
  // 提示描述
  description: string;
  
  // 参数定义
  arguments?: {
    name: string;
    description?: string;
    required: boolean;
  }[];
  
  // 消息模板
  messages: {
    role: "user" | "assistant" | "system";
    content: {
      type: "text";
      text: string;
    } | {
      type: "resource";
      resource: {
        uri: string;
        mimeType: string;
      };
    } | {
      type: "tool_use";
      id: string;
      name: string;
      input: object;
    } | {
      type: "tool_result";
      tool_use_id: string;
      content: string;
      is_error?: boolean;
    }[];
  }[];
}
```

---

*MCP 协议详解 v1.0*
