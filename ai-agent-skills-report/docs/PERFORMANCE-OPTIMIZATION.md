# AI Agent 性能优化完全指南

## 性能架构

```
┌─────────────────────────────────────────────────────────────┐
│                   Performance Layers                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Caching │  │ Batching │  │Parallel  │  │Optimizing│   │
│  │   Layer  │  │  Layer   │  │Execution │  │  Model  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 智能缓存

### 1. 多级缓存策略

```typescript
class MultiLevelCache {
  constructor() {
    // L1: 内存缓存 (热数据)
    this.l1 = new Map();
    
    // L2: Redis 缓存 (温数据)
    this.l2 = null; // Redis client
    
    // L3: 数据库缓存 (冷数据)
    this.l3 = null; // Database client
  }
  
  async get(key) {
    // L1 检查
    if (this.l1.has(key)) {
      return { data: this.l1.get(key), level: 'L1' };
    }
    
    // L2 检查
    if (this.l2) {
      const l2Data = await this.l2.get(key);
      if (l2Data) {
        // 回填 L1
        this.l1.set(key, l2Data);
        return { data: l2Data, level: 'L2' };
      }
    }
    
    // L3 检查
    if (this.l3) {
      const l3Data = await this.l3.findOne({ key });
      if (l3Data) {
        await this.l2.set(key, l3Data.value, { EX: 3600 });
        this.l1.set(key, l3Data.value);
        return { data: l3Data.value, level: 'L3' };
      }
    }
    
    return null;
  }
  
  async set(key, value, options = {}) {
    const { ttlL1 = 60, ttlL2 = 3600, ttlL3 = 86400 } = options;
    
    // 设置到所有级别
    this.l1.set(key, value);
    
    if (this.l2) {
      await this.l2.set(key, value, { EX: ttlL2 });
    }
    
    if (this.l3) {
      await this.l3.create({ key, value, expiresAt: Date.now() + ttlL3 * 1000 });
    }
  }
}
```

### 2. Embedding 缓存

```typescript
class EmbeddingCache {
  constructor(vectorStore) {
    this.vectorStore = vectorStore;
    this.cache = new Map();
    this.cacheSize = 10000;
  }
  
  async embed(text) {
    // 生成缓存 key
    const cacheKey = this.generateKey(text);
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // 生成 embedding
    const embedding = await this.llm.embed(text);
    
    // 添加到缓存
    if (this.cache.size >= this.cacheSize) {
      // LRU 淘汰
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(cacheKey, embedding);
    
    return embedding;
  }
  
  generateKey(text) {
    // 标准化文本
    const normalized = text.toLowerCase().trim();
    
    // 简单 hash (生产环境用更好的)
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return hash.toString(36);
  }
}
```

## 请求批处理

### 1. 批量 Embedding

```typescript
class BatchEmbedding {
  constructor(batchSize = 100, delayMs = 100) {
    this.batchSize = batchSize;
    this.delayMs = delayMs;
    this.queue = [];
    this.processing = null;
  }
  
  async add(text) {
    return new Promise((resolve, reject) => {
      this.queue.push({ text, resolve, reject });
      
      // 触发处理
      this.process();
    });
  }
  
  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    // 等待积累更多或立即处理
    await Promise.race([
      this.waitForBatch(),
      this.waitDelay()
    ]);
    
    // 提取批次
    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      // 批量调用
      const embeddings = await this.llm.embedBatch(batch.map(b => b.text));
      
      // 返回结果
      batch.forEach((item, i) => {
        item.resolve(embeddings[i]);
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
    
    this.processing = false;
    
    // 继续处理
    this.process();
  }
  
  waitForBatch() {
    return new Promise(resolve => {
      const check = () => {
        if (this.queue.length >= this.batchSize) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }
  
  waitDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delayMs));
  }
}
```

### 2. 数据库批量操作

```typescript
class BatchDB {
  constructor(db, batchSize = 100) {
    this.db = db;
    this.batchSize = batchSize;
    this.pending = [];
  }
  
  async create(model, data) {
    return new Promise((resolve, reject) => {
      this.pending.push({ model, data, op: 'create', resolve, reject });
      
      if (this.pending.length >= this.batchSize) {
        this.flush();
      }
    });
  }
  
  async flush() {
    if (this.pending.length === 0) return;
    
    const batch = [...this.pending];
    this.pending = [];
    
    try {
      // 分组 by model
      const groups = this.groupBy(batch, 'model');
      
      for (const [model, items] of Object.entries(groups)) {
        const values = items.map(i => i.data);
        await this.db[model].createMany(values);
      }
      
      batch.forEach(item => item.resolve());
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }
  
  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const value = item[key];
      (groups[value] = groups[value] || []).push(item);
      return groups;
    }, {});
  }
}
```

## 并发优化

### 1. 并发请求控制

```typescript
class ConcurrencyController {
  constructor(maxConcurrent = 10) {
    this.maxConcurrent = maxConcurrent;
    this.running = 0;
    this.queue = [];
  }
  
  async execute(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift();
      
      this.running++;
      
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        this.running--;
        this.process();
      }
    }
  }
}
```

### 2. 速率限制

```typescript
class RateLimiter {
  constructor(requestsPerSecond) {
    this.rate = requestsPerSecond;
    this.tokens = requestsPerSecond;
    this.lastRefill = Date.now();
    
    setInterval(() => this.refill(), 1000);
  }
  
  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.rate, this.tokens + elapsed * this.rate);
    this.lastRefill = now;
  }
  
  async acquire(tokens = 1) {
    while (this.tokens < tokens) {
      await new Promise(resolve => setTimeout(resolve, 100));
      this.refill();
    }
    
    this.tokens -= tokens;
  }
}
```

## 模型选择优化

### 1. 智能路由

```typescript
class ModelRouter {
  constructor() {
    this.routes = {
      // 简单任务 → 快/便宜模型
      simple: {
        model: 'gpt-4o-mini',
        maxTokens: 1000,
        conditions: (task) => {
          return task.complexity < 3 || task.type === 'classification';
        }
      },
      
      // 中等任务 → 中等模型
      medium: {
        model: 'gpt-4o',
        maxTokens: 4000,
        conditions: (task) => {
          return task.complexity >= 3 && task.complexity < 7;
        }
      },
      
      // 复杂任务 → 最强模型
      complex: {
        model: 'o1',
        maxTokens: 32000,
        conditions: (task) => {
          return task.complexity >= 7 || task.type === 'reasoning';
        }
      }
    };
  }
  
  select(task) {
    for (const [name, config] of Object.entries(this.routes)) {
      if (config.conditions(task)) {
        return config;
      }
    }
    
    // 默认
    return this.routes.medium;
  }
  
  // 成本估算
  estimateCost(task) {
    const route = this.select(task);
    const inputCost = this.modelPrices[route.model].input;
    const outputCost = this.modelPrices[route.model].output;
    
    return {
      model: route.model,
      estimatedInput: (task.inputTokens / 1000) * inputCost,
      estimatedOutput: (route.maxTokens / 1000) * outputCost
    };
  }
}
```

### 2. Cache-Augmented Generation

```typescript
class CacheAugmentedGeneration {
  constructor(llm, cache) {
    this.llm = llm;
    this.cache = cache;
  }
  
  async generate(prompt) {
    // 1. 从缓存构建增强 prompt
    const relevant = await this.cache.findRelevant(prompt, { topK: 5 });
    
    // 2. 构建增强 prompt
    const augmentedPrompt = this.buildAugmentedPrompt(prompt, relevant);
    
    // 3. 生成
    const result = await this.llm.generate(augmentedPrompt);
    
    // 4. 可选：缓存结果
    if (result.shouldCache) {
      await this.cache.store(prompt, result);
    }
    
    return result;
  }
  
  buildAugmentedPrompt(prompt, relevant) {
    const context = relevant
      .map(r => `[Context ${r.id}]: ${r.content}`)
      .join('\n\n');
    
    return `
相关背景信息：
${context}

用户问题：${prompt}

请基于以上背景信息回答用户问题。
    `.trim();
  }
}
```

---

*性能优化指南 v1.0*
