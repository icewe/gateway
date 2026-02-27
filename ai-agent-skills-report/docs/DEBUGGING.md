# AI Agent 调试与排错指南

## 1. 日志系统设计

```typescript
// 分层日志
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class AgentLogger {
  private context: Map<string, any> = new Map();
  
  setContext(key: string, value: any) {
    this.context.set(key, value);
  }
  
  debug(message: string, meta?: object) {
    this.log(LogLevel.DEBUG, message, meta);
  }
  
  info(message: string, meta?: object) {
    this.log(LogLevel.INFO, message, meta);
  }
  
  error(message: string, error?: Error, meta?: object) {
    this.log(LogLevel.ERROR, message, { error: error?.stack, ...meta });
  }
  
  private log(level: LogLevel, message: string, meta?: object) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      context: Object.fromEntries(this.context),
      ...meta
    };
    
    // 输出到不同目标
    if (level >= LogLevel.ERROR) {
      console.error(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }
}

// 使用
const logger = new AgentLogger();
logger.setContext('sessionId', 'sess-123');
logger.setContext('agent', 'my-agent');

logger.info('Processing request', { input: 'test' });
```

## 2. 请求追踪

```typescript
// 分布式追踪
class RequestTracer {
  private activeSpans = new Map<string, Span>();
  
  startSpan(name: string, parent?: string): Span {
    const span: Span = {
      id: this.generateId(),
      name,
      parentId: parent,
      startTime: Date.now(),
      events: [],
      attributes: {}
    };
    
    this.activeSpans.set(span.id, span);
    return span;
  }
  
  addEvent(spanId: string, name: string, attributes?: object) {
    const span = this.activeSpans.get(spanId);
    if (!span) return;
    
    span.events.push({
      name,
      timestamp: Date.now(),
      attributes
    });
  }
  
  setAttribute(spanId: string, key: string, value: any) {
    const span = this.activeSpans.get(spanId);
    if (!span) return;
    
    span.attributes[key] = value;
  }
  
  endSpan(spanId: string) {
    const span = this.activeSpans.get(spanId);
    if (!span) return;
    
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    
    // 导出
    this.export(span);
    this.activeSpans.delete(spanId);
  }
  
  private export(span: Span) {
    // 发送到追踪系统
    fetch('http://tracing:9411/api/v1/spans', {
      method: 'POST',
      body: JSON.stringify(span)
    });
  }
}
```

## 3. 常见问题排查

### 问题 1: 模型响应超时

```typescript
// 超时处理
class TimeoutHandler {
  async withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    errorMessage: string
  ): Promise<T> {
    let timeoutId;
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(errorMessage));
      }, ms);
    });
    
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// 重试机制
class RetryHandler {
  async withRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxRetries: number;
      delayMs: number;
      backoff?: number;
    }
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i <= options.maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (i < options.maxRetries) {
          const delay = options.delayMs * Math.pow(options.backoff || 1, i);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }
    
    throw lastError;
  }
}
```

### 问题 2: 工具执行失败

```typescript
// 工具错误分类
class ToolErrorClassifier {
  classify(error: Error): ToolError {
    if (error.message.includes('timeout')) {
      return { type: 'timeout', retryable: true };
    }
    
    if (error.message.includes('not found')) {
      return { type: 'not_found', retryable: false };
    }
    
    if (error.message.includes('permission')) {
      return { type: 'permission', retryable: false };
    }
    
    if (error.message.includes('rate limit')) {
      return { type: 'rate_limit', retryable: true, retryAfter: 60 };
    }
    
    return { type: 'unknown', retryable: false };
  }
}

// 错误恢复
class ToolErrorRecovery {
  async recover(
    toolName: string,
    error: ToolError,
    context: ExecutionContext
  ): Promise<RecoveryAction> {
    switch (error.type) {
      case 'timeout':
        return { action: 'retry', delay: 1000 };
        
      case 'rate_limit':
        return { action: 'wait', delay: error.retryAfter * 1000 };
        
      case 'not_found':
        // 尝试替代工具
        const alternative = await this.findAlternative(toolName);
        return alternative 
          ? { action: 'use_alternative', tool: alternative }
          : { action: 'fail' };
          
      case 'permission':
        return { action: 'request_permission' };
        
      default:
        return { action: 'fail' };
    }
  }
}
```

### 问题 3: 上下文溢出

```typescript
// 上下文压缩
class ContextCompressor {
  compress(messages: Message[], maxTokens: number): Message[] {
    let currentTokens = this.countTokens(messages);
    
    if (currentTokens <= maxTokens) {
      return messages;
    }
    
    const compressed: Message[] = [];
    
    // 保留系统消息
    const systemMsg = messages.find(m => m.role === 'system');
    if (systemMsg) {
      compressed.push(systemMsg);
      currentTokens -= this.countTokens([systemMsg]);
    }
    
    // 保留最新的
    const recent = messages.filter(m => m.role !== 'system').slice(-10);
    
    // 摘要旧消息
    const old = messages.filter(m => 
      m.role !== 'system' && !recent.includes(m)
    );
    
    if (old.length > 0) {
      const summary = await this.summarize(old);
      const summaryMsg: Message = {
        role: 'system',
        content: `[历史对话摘要]\n${summary}`
      };
      compressed.push(summaryMsg);
      currentTokens += this.countTokens([summaryMsg]);
    }
    
    // 添加最近的
    compressed.push(...recent);
    
    return compressed;
  }
  
  private async summarize(messages: Message[]): Promise<string> {
    // 使用模型生成摘要
    const text = messages.map(m => m.content).join('\n');
    return `...${text.slice(0, 1000)}...`;
  }
}
```

---

*AI Agent 调试与排错指南 v1.0*
