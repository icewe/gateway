# MCP Server 开发实战

## 项目结构

```
mcp-my-server/
├── src/
│   ├── index.ts          # 入口
│   ├── server.ts         # MCP Server
│   ├── tools/           # 工具定义
│   │   ├── search.ts
│   │   ├── database.ts
│   │   └── ...
│   ├── resources/        # 资源定义
│   │   └── ...
│   └── prompts/          # 提示模板
│       └── ...
├── package.json
└── tsconfig.json
```

## 基础实现

### 1. Server 主体

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

class MyMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'my-mcp-server',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        }
      }
    );
    
    this.setupHandlers();
  }
  
  setupHandlers() {
    // 工具列表
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search',
            description: '搜索文档',
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
          },
          {
            name: 'get_document',
            description: '获取文档内容',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: '文档 ID'
                }
              },
              required: ['id']
            }
          }
        ]
      };
    });
    
    // 工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        switch (name) {
          case 'search':
            return await this.handleSearch(args);
          case 'get_document':
            return await this.handleGetDocument(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
    
    // 资源列表
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'config://app',
            name: 'app_config',
            description: '应用配置',
            mimeType: 'application/json'
          }
        ]
      };
    });
    
    // 资源读取
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      if (uri === 'config://app') {
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(this.config)
            }
          ]
        };
      }
      
      throw new Error(`Unknown resource: ${uri}`);
    });
  }
  
  async handleSearch(args: { query: string; limit?: number }) {
    const results = await this.searchService.search(args.query, args.limit || 10);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2)
        }
      ]
    };
  }
  
  async handleGetDocument(args: { id: string }) {
    const doc = await this.documentService.get(args.id);
    
    return {
      content: [
        {
          type: 'text',
          text: doc.content
        }
      ]
    };
  }
  
  start() {
    // stdio 传输
    const transport = new StdioServerTransport();
    this.server.connect(transport);
  }
}
```

### 2. 搜索工具实现

```typescript
// src/tools/search.ts
import { z } from 'zod';

export const SearchSchema = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(100).default(10),
  filters: z.object({
    author: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional()
  }).optional()
});

export type SearchParams = z.infer<typeof SearchSchema>;

export async function search(params: SearchParams) {
  const { query, limit, filters } = params;
  
  // 构建查询
  const searchQuery = {
    q: query,
    limit,
    ...filters
  };
  
  // 执行搜索
  const results = await fetch('https://api.search.example.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_KEY}`
    },
    body: JSON.stringify(searchQuery)
  });
  
  const data = await results.json();
  
  // 格式化结果
  return {
    total: data.total,
    results: data.hits.map(hit => ({
      id: hit.id,
      title: hit.title,
      snippet: hit.snippet,
      score: hit.score
    }))
  };
}
```

### 3. 数据库工具

```typescript
// src/tools/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const DatabaseSchemas = {
  query: z.object({
    sql: z.string().describe('SQL 查询语句')
  }),
  
  execute: z.object({
    sql: z.string().describe('SQL 执行语句')
  }),
  
  list_tables: z.object({})
};

export async function executeQuery(sql: string) {
  const result = await pool.query(sql);
  
  return {
    columns: result.fields.map(f => f.name),
    rows: result.rows,
    rowCount: result.rowCount
  };
}

export async function executeStatement(sql: string) {
  const result = await pool.query(sql);
  
  return {
    affectedRows: result.rowCount,
    lastInsertId: result.insertId
  };
}

export async function listTables() {
  const result = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `);
  
  return {
    tables: result.rows.map(r => r.table_name)
  };
}
```

## TypeScript 工具包

### 类型定义

```typescript
// @modelcontextprotocol/sdk/types.js

export interface Tool {
  name: string;
  description: string;
  inputSchema: JSONSchema7;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface Resource {
  uri: string;
  name?: string;
  description?: string;
  mimeType?: string;
}

export interface TextResourceContents {
  uri: string;
  mimeType: string;
  text: string;
}
```

---

*MCP Server 开发实战 v1.0*
