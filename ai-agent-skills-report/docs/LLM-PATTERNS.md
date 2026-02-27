# LLM 应用架构模式

## 1. Router 模式

```typescript
// 输入路由
class LLMRouter {
  route(input: string): string {
    const intent = this.classify(input);
    
    switch(intent) {
      case 'code': return 'code-model';
      case 'chat': return 'chat-model';
      case 'reasoning': return 'o1-model';
      default: return 'default-model';
    }
  }
}
```

## 2. Ensemble 模式

```typescript
// 多模型投票
class Ensemble {
  async vote(prompt: string, models: string[]): Promise<string> {
    const responses = await Promise.all(
      models.map(m => this.call(m, prompt))
    );
    
    return this.majorityVote(responses);
  }
}
```

## 3. Cache-Augmented 模式

```typescript
// RAG + Cache
class CAC {
  async generate(prompt: string): Promise<string> {
    // 1. 查缓存
    const cached = await this.cache.get(prompt);
    if (cached) return cached;
    
    // 2. RAG
    const context = await this.rag.retrieve(prompt);
    const augmented = this.augment(prompt, context);
    
    // 3. 生成
    const result = await this.llm.generate(augmented);
    
    // 4. 缓存
    await this.cache.set(prompt, result);
    
    return result;
  }
}
```

---

*LLM 应用架构模式 v1.0*
