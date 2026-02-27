# OpenClaw Skills 深度定制

## 1. 自定义触发器

```typescript
// 触发器类型
type TriggerType = 'keyword' | 'regex' | 'context' | 'time' | 'event';

// 触发器接口
interface Trigger {
  type: TriggerType;
  condition: any;
  priority?: number;
}

// 关键词触发
class KeywordTrigger implements Trigger {
  type = 'keyword' as const;
  
  constructor(
    public keywords: string[],
    public options: { caseSensitive?: boolean; exact?: boolean } = {}
  ) {}
  
  match(input: string): boolean {
    const text = this.options.caseSensitive ? input : input.toLowerCase();
    
    for (const keyword of this.keywords) {
      const kw = this.options.caseSensitive ? keyword : keyword.toLowerCase();
      
      if (this.options.exact) {
        if (text === kw) return true;
      } else {
        if (text.includes(kw)) return true;
      }
    }
    
    return false;
  }
}

// 正则触发
class RegexTrigger implements Trigger {
  type = 'regex' as const;
  
  constructor(public pattern: RegExp) {}
  
  match(input: string): boolean {
    return this.pattern.test(input);
  }
}

// 上下文触发
class ContextTrigger implements Trigger {
  type = 'context' as const;
  
  constructor(
    public check: (context: ExecutionContext) => boolean
  ) {}
  
  match(input: string, context: ExecutionContext): boolean {
    return this.check(context);
  }
}
```

## 2. Skill 加载器

```typescript
class SkillLoader {
  private skills = new Map<string, Skill>();
  private triggers = new Map<Trigger, string[]>();
  
  async loadSkill(path: string): Promise<void> {
    // 读取 SKILL.md
    const content = await fs.readFile(`${path}/SKILL.md`, 'utf-8');
    
    // 解析 YAML 头
    const { metadata, instructions } = this.parse(content);
    
    // 构建 Skill
    const skill: Skill = {
      name: metadata.name,
      description: metadata.description,
      instructions,
      triggers: this.buildTriggers(metadata),
      tools: await this.loadTools(path),
      config: metadata.config || {}
    };
    
    // 注册
    this.skills.set(skill.name, skill);
    
    // 索引触发器
    for (const trigger of skill.triggers) {
      if (!this.triggers.has(trigger)) {
        this.triggers.set(trigger, []);
      }
      this.triggers.get(trigger).push(skill.name);
    }
  }
  
  // 匹配 Skill
  match(input: string, context: ExecutionContext): Skill[] {
    const matched = new Set<string>();
    
    for (const [trigger, skillNames] of this.triggers) {
      if (trigger.match(input, context)) {
        skillNames.forEach(name => matched.add(name));
      }
    }
    
    return Array.from(matched).map(name => this.skills.get(name));
  }
}
```

## 3. 工具注册

```typescript
// 工具定义
interface ToolDefinition {
  name: string;
  description: string;
  parameters: JSONSchema7;
  handler: ToolHandler;
}

// 注册工具
class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();
  
  register(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }
  
  async execute(
    name: string, 
    params: Record<string, any>,
    context: ExecutionContext
  ): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    
    // 验证参数
    this.validateParams(tool.parameters, params);
    
    // 执行
    return await tool.handler(params, context);
  }
  
  // 获取所有工具
  list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }
}
```

## 4. 记忆系统

```typescript
class MemoryManager {
  private shortTerm: RingBuffer<MemoryEntry>;
  private longTerm: VectorStore;
  
  constructor(config: MemoryConfig) {
    this.shortTerm = new RingBuffer(config.shortTermSize);
    this.longTerm = new VectorStore(config.vectorDb);
  }
  
  async add(entry: MemoryEntry): Promise<void> {
    // 添加到短期记忆
    this.shortTerm.push(entry);
    
    // 检查是否需要固化
    if (this.shortTerm.isFull()) {
      await this.consolidate();
    }
  }
  
  async search(query: string, options: SearchOptions = {}): Promise<MemoryEntry[]> {
    // 搜索长期记忆
    const longTermResults = await this.longTerm.search(query, {
      limit: options.limit || 5
    });
    
    // 合并短期记忆
    const shortTermResults = this.shortTerm
      .toArray()
      .filter(e => this.relevance(e, query) > 0.5)
      .slice(0, options.limit || 5);
    
    // 排序返回
    return [...longTermResults, ...shortTermResults]
      .sort((a, b) => b.relevance - a.relevance);
  }
  
  private async consolidate(): Promise<void> {
    // 选择重要记忆
    const important = this.shortTerm
      .toArray()
      .filter(e => e.importance > 0.7);
    
    // 嵌入并存储
    for (const entry of important) {
      const embedding = await this.embed(JSON.stringify(entry));
      await this.longTerm.add({ embedding, entry });
    }
    
    // 清空
    this.shortTerm.clear();
  }
}
```

## 5. 执行上下文

```typescript
interface ExecutionContext {
  // 输入
  input: string;
  
  // 会话
  session: {
    id: string;
    userId: string;
    history: Message[];
  };
  
  // 环境
  env: {
    platform: string;
    capabilities: string[];
    time: Date;
  };
  
  // 元数据
  metadata: Record<string, any>;
  
  // 工具
  tools: ToolRegistry;
  
  // 记忆
  memory: MemoryManager;
}

class ExecutionContextBuilder {
  private context: Partial<ExecutionContext> = {};
  
  setInput(input: string): this {
    this.context.input = input;
    return this;
  }
  
  setSession(session: ExecutionContext['session']): this {
    this.context.session = session;
    return this;
  }
  
  setPlatform(platform: string): this {
    this.context.env = {
      platform,
      capabilities: [],
      time: new Date()
    };
    return this;
  }
  
  build(): ExecutionContext {
    return {
      input: this.context.input,
      session: this.context.session,
      env: this.context.env,
      metadata: {},
      tools: this.context.tools,
      memory: this.context.memory
    };
  }
}
```

---

*OpenClaw Skills 深度定制 v1.0*
