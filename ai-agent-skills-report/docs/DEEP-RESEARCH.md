# AI Agent 能力扩展生态深度解析

## Skills vs MCP vs Tools

### 概念对比

| 类型 | 作用 | 示例 | 通信方式 |
|------|------|------|----------|
| **Skills** | 注入了特定领域的知识、经验和最佳实践 | React最佳实践、代码审查规则 | Prompt 注入 |
| **MCP** | 连接外部工具和数据源 | 文件系统、数据库、Github | JSON-RPC |
| **Tools** | Agent 可调用的函数 | 搜索、计算、API调用 | 函数调用 |

### 协同工作

```
┌─────────────────────────────────────────┐
│              AI Agent                    │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────────┐   ┌────────────────┐  │
│  │   Skills     │   │  MCP Clients   │  │
│  │  (知识/经验)  │   │  (工具/数据)   │  │
│  │              │   │                │  │
│  │ - best       │   │ - filesystem   │  │
│  │   practices  │   │ - github      │  │
│  │ - domain     │   │ - search      │  │
│  │   knowledge  │   │ - database     │  │
│  └──────────────┘   └────────────────┘  │
│                                          │
└─────────────────────────────────────────┘
```

## Skills 生态系统

### Skills.sh 架构

```javascript
// Skills 本质是一个 Prompt 包
{
  name: "react-best-practices",
  version: "1.0.0",
  description: "React 开发最佳实践",
  
  // 安装时注入到 System Prompt
  prompts: [
    {
      role: "system",
      content: `
        你是一位 React 专家。
        遵循以下最佳实践：
        1. 使用函数组件 + Hooks
        2. 组件拆分要细
        3. 使用 TypeScript
        ...
      `
    }
  ],
  
  // 可用的工具
  tools: ["code-analyzer", "file-generator"],
  
  // 配置
  config: {
    language: "zh-CN"
  }
}
```

### 热门 Skills 分析

#### TOP 10 Skills 分类

| 排名 | Skill | 类别 | 安装量 |
|------|-------|------|--------|
| 1 | find-skills | 工具类 | 337K |
| 2 | vercel-react-best-practices | 前端开发 | 171K |
| 3 | web-design-guidelines | 设计 | 131K |
| 4 | frontend-design | 前端开发 | 103K |
| 5-10 | Azure 系列 | 云服务 | 74K+ |

#### Skills 发展趋势

1. **专业化**: 垂直领域 Skills 增多
2. **组合化**: 多个 Skills 组合使用
3. **版本化**: 语义化版本管理
4. **社区化**: 开源 Skills 增多

## MCP 深度解析

### MCP 架构

```
┌─────────────────────────────────────────────────────┐
│                   MCP Host (Claude, etc.)           │
├─────────────────────────────────────────────────────┤
│                                                      │
│   ┌─────────────┐    ┌──────────────────────────┐   │
│   │   MCP       │◀──▶│   MCP Servers            │   │
│   │   Client   │    │   (本地或远程)            │   │
│   └─────────────┘    └──────────────────────────┘   │
│          │                     │                     │
│          ▼                     ▼                     │
│   ┌─────────────────────────────────────────────┐   │
│   │              Protocol Layer                  │   │
│   │   - initialize                              │   │
│   │   - tools/list, tools/call                  │   │
│   │   - resources/list, resources/read           │   │
│   │   - prompts/list, prompts/get                │   │
│   └─────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### MCP 协议详解

#### 1. 初始化

```json
// Client → Server
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {},
      "resources": {},
      "prompts": {}
    },
    "clientInfo": {
      "name": "claude",
      "version": "1.0"
    }
  }
}

// Server → Client
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {}
    },
    "serverInfo": {
      "name": "filesystem",
      "version": "1.0.0"
    }
  }
}
```

#### 2. 工具调用

```json
// Client → Server
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "read_file",
    "arguments": {
      "path": "/Users/test/readme.md"
    }
  }
}

// Server → Client
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "# Project Readme\n\n..."
      }
    ]
  }
}
```

### MCP 服务器生态

#### 官方服务器

| 服务器 | 功能 | 语言 |
|--------|------|------|
| filesystem | 文件操作 | TypeScript |
| fetch | 网页抓取 | TypeScript |
| git | Git 操作 | TypeScript |
| memory | 知识图谱 | TypeScript |
| everything | 全功能演示 | TypeScript |

#### 社区热门服务器

| 服务器 | 功能 | Stars |
|--------|------|-------|
| slack-mcp | Slack 集成 | 2K+ |
| github-mcp | GitHub API | 5K+ |
| brave-search | 搜索 | 3K+ |
| postgres-mcp | PostgreSQL | 4K+ |

### MCP 开发实战

#### 创建自定义 MCP 服务器

```typescript
import { Server } from '@modelcontextprotocol/typescript-sdk';
import { z } from 'zod';

const server = new Server({
  name: 'my-mcp-server',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
});

// 定义工具
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [{
      name: 'my_custom_tool',
      description: '自定义工具描述',
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
    }]
  };
});

// 处理工具调用
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'my_custom_tool') {
    // 执行业务逻辑
    const result = await myBusinessLogic(args);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result)
      }]
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

process.stdin.on('data', (data) => server.handleJsonMessage(data));
```

## AI Agent 平台对比

### 主流平台

| 平台 | 类型 | 优势 | 劣势 |
|------|------|------|------|
| **Claude Code** | CLI | 离线可用、生态好 | 功能相对单一 |
| **Cursor** | IDE | 深度代码集成 | 依赖 IDE |
| **Coze** | SaaS | 可视化、易用 | 数据安全 |
| **Dify** | 开源 | 私有部署 | 需要运维 |
| **OpenAI Agents** | SaaS | OpenAI 生态 | 定价高 |

### 选择建议

```
场景                    推荐
─────────────────────────────────────
个人开发者              Claude Code / Cursor
快速原型                Coze
企业内                 Dify (自托管)
需要 GPT 能力          OpenAI Agents
需要多模态             Anthropic + MCP
```

---

*深度解析 v1.0*
