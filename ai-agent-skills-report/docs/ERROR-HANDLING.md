# Agent 异常处理

## 1. 错误分类

```typescript
enum ErrorType {
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  AUTH = 'auth',
  VALIDATION = 'validation',
  TOOL = 'tool',
  UNKNOWN = 'unknown'
}

class ErrorClassifier {
  classify(error: Error): ErrorType {
    if (error.message.includes('timeout')) return ErrorType.TIMEOUT;
    if (error.message.includes('rate limit')) return ErrorType.RATE_LIMIT;
    if (error.message.includes('auth')) return ErrorType.AUTH;
    if (error.message.includes('validation')) return ErrorType.VALIDATION;
    if (error.message.includes('tool')) return ErrorType.TOOL;
    return ErrorType.UNKNOWN;
  }
}
```

## 2. 重试策略

```typescript
class RetryStrategy {
  shouldRetry(error: Error, attempt: number): boolean {
    const type = this.classifier.classify(error);
    
    return type === ErrorType.TIMEOUT || 
           type === ErrorType.RATE_LIMIT;
  }
  
  getDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  }
}
```

## 3. 降级处理

```typescript
class FallbackHandler {
  async handle(error: Error, context: Context): Promise<string> {
    const type = this.classifier.classify(error);
    
    switch(type) {
      case ErrorType.TOOL:
        return this.useFallbackTool(context);
      case ErrorType.MODEL:
        return this.useSmallerModel(context);
      default:
        return this.returnErrorMessage(error);
    }
  }
}
```

---

*Agent 异常处理 v1.0*
