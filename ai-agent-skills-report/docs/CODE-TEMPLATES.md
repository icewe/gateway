# AI Agent 代码模板

## Agent基础

```typescript
class SimpleAgent {
  constructor(private model: LLM) {}
  
  async process(input: string): Promise<string> {
    const response = await this.model.complete(input);
    return response.text;
  }
}
```

## 工具Agent

```typescript
class ToolAgent {
  constructor(
    private model: LLM,
    private tools: Map<string, Tool>
  ) {}
  
  async process(input: string): Promise<string> {
    const plan = await this.model.plan(input, this.tools);
    return await this.execute(plan);
  }
}
```

## RAG Agent

```typescript
class RAGAgent {
  constructor(
    private model: LLM,
    private retriever: Retriever
  ) {}
  
  async process(input: string): Promise<string> {
    const docs = await this.retriever.retrieve(input);
    const prompt = this.buildPrompt(input, docs);
    return await this.model.complete(prompt);
  }
}
```

---

*AI Agent 代码模板 v1.0*
