# MCP 服务器开发实战

## MCP 服务器架构

```
┌─────────────────────────────────────────┐
│              MCP Host                     │
│  (Claude, Cursor, OpenAI, etc.)        │
├─────────────────────────────────────────┤
│                                          │
│   ┌──────────┐    ┌───────────────┐    │
│   │  Client  │◄───│ Protocol     │    │
│   └──────────┘    └───────┬───────┘    │
│                            │             │
│                            ▼             │
│                    ┌───────────────┐     │
│                    │  Your Server  │    │
│                    └───────────────┘     │
│                            │             │
│                            ▼             │
│                    ┌───────────────┐     │
│                    │ Business Logic│    │
│                    └───────────────┘     │
│                                          │
└─────────────────────────────────────────┘
```

## TypeScript MCP 服务器

### 1. 项目初始化

```bash
mkdir my-mcp-server
cd my-mcp-server
pnpm init
pnpm add @modelcontextprotocol/typescript-sdk zod
```

### 2. 完整服务器实现

```typescript
// src/index.ts
import { Server } from '@modelcontextprotocol/typescript-sdk';
import { z } from 'zod';

// 服务器配置
const SERVER_NAME = 'my-mcp-server';
const SERVER_VERSION = '1.0.0';

// 创建服务器
const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {}
    }
  }
);

// ====== 工具处理 ======

// 列出可用工具
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'my_tool',
        description: '我的自定义工具',
        inputSchema: {
          type: 'object',
          properties: {
            param1: {
              type: 'string',
              description: '参数1描述'
            },
            param2: {
              type: 'number',
              description: '参数2描述'
            }
          },
          required: ['param1']
        }
      },
      {
        name: 'search_data',
        description: '搜索数据',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '搜索关键词'
            },
            limit: {
              type: 'number',
              description: '返回结果数量',
              default: 10
            }
          },
          required: ['query']
        }
      }
    ]
  };
});

// 处理工具调用
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'my_tool':
        return await handleMyTool(args);
        
      case 'search_data':
        return await handleSearchData(args);
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
});

// ====== 业务逻辑 ======

async function handleMyTool(args: unknown) {
  const params = z.object({
    param1: z.string(),
    param2: z.number().optional()
  }).parse(args);
  
  // 执行业务逻辑
  const result = {
    message: `处理: ${params.param1}`,
    timestamp: new Date().toISOString(),
    data: {
      processed: true,
      value: params.param2 || 0
    }
  };
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }
    ]
  };
}

async function handleSearchData(args: unknown) {
  const params = z.object({
    query: z.string(),
    limit: z.number().default(10)
  }).parse(args);
  
  // 模拟搜索
  const results = [
    { id: 1, title: `Result 1 for ${params.query}`, score: 0.95 },
    { id: 2, title: `Result 2 for ${params.query}`, score: 0.85 },
    { id: 3, title: `Result 3 for ${params.query}`, score: 0.75 }
  ].slice(0, params.limit);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ results, count: results.length }, null, 2)
      }
    ]
  };
}

// ====== 资源处理 ======

server.setRequestHandler('resources/list', async () => {
  return {
    resources: [
      {
        uri: 'my://data/config',
        name: 'Configuration',
        description: '服务器配置',
        mimeType: 'application/json'
      },
      {
        uri: 'my://data/status',
        name: 'Status',
        description: '服务器状态',
        mimeType: 'application/json'
      }
    ]
  };
});

server.setRequestHandler('resources/read', async (request) => {
  const { uri } = request.params;
  
  switch (uri) {
    case 'my://data/config':
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            server: SERVER_NAME,
            version: SERVER_VERSION,
            capabilities: ['tools', 'resources']
          })
        }]
      };
      
    case 'my://data/status':
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            pid: process.pid
          })
        }]
      };
      
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
});

// ====== 启动服务器 ======

// 标准输入输出模式
process.stdin.on('data', (data) => {
  server.handleJsonMessage(data);
});

console.error(`${SERVER_NAME} v${SERVER_VERSION} started`);
```

### 3. package.json

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "my-mcp": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc && node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/typescript-sdk": "^0.5.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0"
  }
}
```

## Python MCP 服务器

```python
# server.py
from mcp.server import Server
from mcp.types import Tool, TextContent
import asyncio

# 创建服务器
app = Server("my-mcp-server")

# 列出工具
@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="calculate",
            description="执行数学计算",
            inputSchema={
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "数学表达式"
                    }
                },
                "required": ["expression"]
            }
        )
    ]

# 调用工具
@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "calculate":
        result = eval(arguments["expression"])
        return [TextContent(type="text", text=str(result))]
    
    raise ValueError(f"Unknown tool: {name}")

# 运行
if __name__ == "__main__":
    import sys
    from mcp.server.stdio import stdio_server
    
    asyncio.run(stdio_server.run(app))
```

## MCP 客户端使用

```typescript
// 客户端调用 MCP 服务器
import { Client } from '@modelcontextprotocol/typescript-sdk';

const client = new Client({
  name: 'my-client',
  version: '1.0.0'
}, {
  capabilities: {}
});

// 连接到服务器
await client.connect({
  transport: 'stdio',
  command: 'node',
  args: ['./dist/index.js']
});

// 调用工具
const result = await client.callTool({
  name: 'my_tool',
  arguments: { param1: 'value1', param2: 123 }
});

console.log(result);
```

---

*MCP 开发实战 v1.0*
