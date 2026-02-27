# AI Agent 成本优化策略

## 1. 模型选择优化

### 模型成本对比

| 模型 | 输入($/1M) | 输出($/1M) | 适用场景 |
|------|------------|------------|----------|
| GPT-4o | $2.50 | $10.00 | 复杂推理 |
| GPT-4o-mini | $0.15 | $0.60 | 简单任务 |
| Claude-3.5 | $3.00 | $15.00 | 高质量写作 |
| Claude-3-Haiku | $0.25 | $1.25 | 快速响应 |

### 智能路由

```typescript
class ModelRouter {
  constructor() {
    this.routes = {
      simple: {
        model: 'gpt-4o-mini',
        maxTokens: 1000,
        conditions: (task) => task.complexity <= 3
      },
      medium: {
        model: 'gpt-4o',
        maxTokens: 4000,
        conditions: (task) => task.complexity > 3 && task.complexity <= 7
      },
      complex: {
        model: 'o1',
        maxTokens: 32000,
        conditions: (task) => task.complexity > 7
      }
    };
  }
  
  select(task: Task): RouteConfig {
    for (const route of Object.values(this.routes)) {
      if (route.conditions(task)) {
        return route;
      }
    }
    return this.routes.medium;
  }
}
```

## 2. Token 优化

### Prompt 压缩

```typescript
class PromptCompressor {
  compress(prompt: string): string {
    // 移除多余空白
    let compressed = prompt.replace(/\s+/g, ' ').trim();
    
    // 移除冗余说明
    compressed = this.removeRedundant(compressed);
    
    // 使用缩写
    compressed = this.abbreviate(compressed);
    
    return compressed;
  }
  
  private abbreviate(text: string): string {
    const abbrevs = {
      'please': '',
      'thank you': '',
      'could you': '',
      'I would like to': 'want to'
    };
    
    let result = text;
    for (const [full, abbr] of Object.entries(abbrevs)) {
      result = result.replace(new RegExp(full, 'gi'), abbr);
    }
    
    return result;
  }
}
```

### 响应截断

```typescript
class ResponseTruncator {
  truncate(response: string, maxTokens: number): string {
    const tokens = this.tokenize(response);
    
    if (tokens.length <= maxTokens) {
      return response;
    }
    
    // 保留开头和结尾
    const keepStart = Math.floor(maxTokens * 0.7);
    const keepEnd = maxTokens - keepStart;
    
    const startTokens = tokens.slice(0, keepStart);
    const endTokens = tokens.slice(-keepEnd);
    
    return this.detokenize([
      ...startTokens,
      '...[已截断]...',
      ...endTokens
    ]);
  }
}
```

## 3. 缓存策略

### 多级缓存

```typescript
class CostOptimizer {
  async getOrGenerate(
    key: string,
    generator: () => Promise<string>,
    options: CacheOptions
  ): Promise<string> {
    // L1: 内存缓存
    let cached = this.l1.get(key);
    if (cached) return cached;
    
    // L2: Redis
    cached = await this.l2.get(key);
    if (cached) {
      this.l1.set(key, cached);
      return cached;
    }
    
    // 生成
    const result = await generator();
    
    // 缓存
    await this.l2.set(key, result, { EX: options.ttl });
    this.l1.set(key, result);
    
    return result;
  }
}
```

---

*AI Agent 成本优化策略 v1.0*
