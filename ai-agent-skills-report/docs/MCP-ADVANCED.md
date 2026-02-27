# MCP 协议进阶实践

## 1. 传输层实现

### Stdio 传输

```typescript
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

class CustomStdioTransport extends StdioServerTransport {
  constructor() {
    super();
    this.setupMessageHandling();
  }
  
  private setupMessageHandling() {
    process.stdin.setEncoding('utf-8');
    
    let buffer = '';
    
    process.stdin.on('data', (chunk) => {
      buffer += chunk;
      
      // 解析 JSON-RPC 消息
      const messages = this.parseMessages(buffer);
      buffer = messages.remaining;
      
      for (const message of messages.parsed) {
        this.handleMessage(message);
      }
    });
  }
  
  private parseMessages(buffer: string) {
    const messages = [];
    let start = 0;
    
    while (start < buffer.length) {
      try {
        const obj = JSON.parse(buffer.slice(start));
        messages.push(obj);
        start = buffer.length;
      } catch {
        // 不完整，继续等待
        break;
      }
    }
    
    return { parsed: messages, remaining: buffer.slice(start) };
  }
}
```

### HTTP 传输

```typescript
import { Server } from 'http';

class HTTPServerTransport {
  constructor(server: Server, path: string = '/mcp') {
    this.server = server;
    this.path = path;
    this.pendingRequests = new Map();
  }
  
  start() {
    this.server.on('request', (req, res) => {
      if (req.url === this.path) {
        this.handleRequest(req, res);
      }
    });
  }
  
  async handleRequest(req, res) {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        const message = JSON.parse(body);
        const response = await this.send(message);
        res.json(response);
      });
    } else if (req.method === 'GET') {
      // 返回能力
      res.json(this.server.getCapabilities());
    }
  }
  
  async send(message: JSONRPCMessage): Promise<JSONRPCMessage> {
    return new Promise((resolve) => {
      const id = message.id;
      this.pendingRequests.set(id, resolve);
      
      // 超时处理
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          resolve({ 
            jsonrpc: '2.0', 
            id, 
            error: { code: -32000, message: 'Timeout' } 
          });
        }
      }, 30000);
    });
  }
}
```

## 2. 资源订阅

```typescript
class ResourceSubscription {
  private subscriptions = new Map<string, Set<string>>();
  private resourceValues = new Map<string, any>();
  
  // 订阅资源
  async subscribe(resourceUri: string, clientId: string) {
    if (!this.subscriptions.has(resourceUri)) {
      this.subscriptions.set(resourceUri, new Set());
      this.startMonitoring(resourceUri);
    }
    
    this.subscriptions.get(resourceUri).add(clientId);
  }
  
  // 取消订阅
  unsubscribe(resourceUri: string, clientId: string) {
    const subs = this.subscriptions.get(resourceUri);
    if (subs) {
      subs.delete(clientId);
      
      if (subs.size === 0) {
        this.stopMonitoring(resourceUri);
        this.subscriptions.delete(resourceUri);
      }
    }
  }
  
  // 监控变化
  private startMonitoring(resourceUri: string) {
    const interval = setInterval(async () => {
      const newValue = await this.fetchResource(resourceUri);
      const oldValue = this.resourceValues.get(resourceUri);
      
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        this.resourceValues.set(resourceUri, newValue);
        this.notifySubscribers(resourceUri, newValue);
      }
    }, 1000);
    
    this.resourceValues.set(resourceUri, await this.fetchResource(resourceUri));
  }
  
  // 通知订阅者
  private notifySubscribers(resourceUri: string, value: any) {
    const subs = this.subscriptions.get(resourceUri);
    if (!subs) return;
    
    for (const clientId of subs) {
      this.sendNotification(clientId, {
        method: 'resources/updated',
        params: { uri: resourceUri, value }
      });
    }
  }
}
```

## 3. 进度通知

```typescript
class ProgressReporter {
  private activeProgress = new Map<string, ProgressInfo>();
  
  // 创建进度
  createProgress(token: string, progress: ProgressInfo) {
    this.activeProgress.set(token, {
      ...progress,
      startedAt: Date.now()
    });
  }
  
  // 更新进度
  async updateProgress(token: string, update: Partial<ProgressInfo>) {
    const progress = this.activeProgress.get(token);
    if (!progress) return;
    
    Object.assign(progress, update);
    
    // 发送通知
    await this.send({
      jsonrpc: '2.0',
      method: 'notifications/progress',
      params: {
        token,
        progress: {
          progress: progress.current / progress.total,
          current: progress.current,
          total: progress.total,
          message: progress.message
        }
      }
    });
    
    // 检查完成
    if (progress.current >= progress.total) {
      this.activeProgress.delete(token);
    }
  }
}

// 使用示例
const reporter = new ProgressReporter();

async function longRunningTask() {
  const token = 'task-1';
  
  reporter.createProgress(token, {
    current: 0,
    total: 100,
    message: 'Processing...'
  });
  
  for (let i = 0; i < 100; i++) {
    await doWork(i);
    await reporter.updateProgress(token, {
      current: i + 1,
      message: `Processing ${i + 1}/100`
    });
  }
}
```

## 4. 错误处理

```typescript
// MCP 错误代码
const ErrorCodes = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
  
  // 应用级错误
  PaymentRequired: -32001,
  RateLimited: -32002,
  ResourceNotFound: -32003,
  ToolExecutionFailed: -32004
};

class MCPError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'MCPError';
  }
  
  toJSONRPC() {
    return {
      jsonrpc: '2.0',
      error: {
        code: this.code,
        message: this.message,
        data: this.data
      }
    };
  }
}

// 错误处理中间件
function errorHandler(error: Error) {
  if (error instanceof MCPError) {
    return error.toJSONRPC();
  }
  
  // 未知错误
  return {
    jsonrpc: '2.0',
    error: {
      code: ErrorCodes.InternalError,
      message: 'Internal error',
      data: error.message
    }
  };
}
```

## 5. 工具调用优化

### 批量调用

```typescript
class BatchToolExecutor {
  private queue = [];
  private processing = false;
  
  async execute(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    // 按工具分组
    const grouped = this.groupBy(toolCalls, 'name');
    
    // 并行执行不同工具
    const results = await Promise.all(
      Object.entries(grouped).map(([toolName, calls]) =>
        this.executeToolBatch(toolName, calls as ToolCall[])
      )
    );
    
    // 扁平化结果
    return results.flat();
  }
  
  private async executeToolBatch(
    toolName: string, 
    calls: ToolCall[]
  ): Promise<ToolResult[]> {
    const tool = this.getTool(toolName);
    
    if (!tool.supportsBatch) {
      // 串行执行
      return Promise.all(calls.map(call => this.executeOne(tool, call)));
    }
    
    // 批量执行
    return await tool.executeBatch(calls);
  }
  
  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const value = item[key] as string;
      (groups[value] = groups[value] || []).push(item);
      return groups;
    }, {});
  }
}
```

---

*MCP 协议进阶实践 v1.0*
