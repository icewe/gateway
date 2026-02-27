# AI Agent 系统设计模式

## 1. 责任链模式 (Chain of Responsibility)

```typescript
// Agent 处理链
class AgentChain {
  constructor() {
    this.handlers = [];
  }
  
  add(handler: AgentHandler) {
    this.handlers.push(handler);
    return this;
  }
  
  async handle(context: Context): Promise<Result> {
    for (const handler of this.handlers) {
      if (await handler.canHandle(context)) {
        return await handler.handle(context);
      }
    }
    
    throw new Error('No handler found');
  }
}

// 具体处理器
class IntentClassifier implements AgentHandler {
  async canHandle(context: Context): Promise<boolean> {
    return context.has('input');
  }
  
  async handle(context: Context): Promise<Result> {
    const input = context.get('input');
    const intent = await this.classify(input);
    context.set('intent', intent);
    
    return this.next(context);
  }
}
```

## 2. 策略模式 (Strategy)

```typescript
// 策略接口
interface ReasoningStrategy {
  reason(input: string, context: Context): Promise<ReasoningResult>;
}

// 具体策略
class CoTStrategy implements ReasoningStrategy {
  async reason(input, context) {
    // Chain of Thought
    const steps = [];
    let current = input;
    
    for (let i = 0; i < this.maxSteps; i++) {
      const step = await this.model.think(current);
      steps.push(step);
      
      if (step.isFinal) break;
      
      current = step.thought;
    }
    
    return { steps, result: steps[steps.length - 1] };
  }
}

class ReActStrategy implements ReasoningStrategy {
  async reason(input, context) {
    // Thought → Action → Observation
    let thought = input;
    
    for (let i = 0; i < this.maxIterations; i++) {
      // Think
      const action = await this.decideAction(thought);
      
      // Act
      const observation = await this.execute(action);
      
      // Observe
      thought = `Thought: ${action.thought}\nAction: ${action.name}\nObservation: ${observation}`;
    }
    
    return { thought };
  }
}

// 使用
class ReasoningAgent {
  setStrategy(strategy: ReasoningStrategy) {
    this.strategy = strategy;
  }
}
```

## 3. 观察者模式 (Observer)

```typescript
// 事件系统
class AgentEvents {
  private listeners: Map<string, Function[]> = new Map();
  
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  emit(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }
  
  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }
}

// 使用
const events = new AgentEvents();

events.on('tool_called', (tool) => {
  console.log(`Tool called: ${tool.name}`);
});

events.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});
```

## 4. 装饰器模式 (Decorator)

```typescript
// 基础 Agent
class BaseAgent {
  async process(input: string): Promise<string> {
    return await this.model.generate(input);
  }
}

// 装饰器
function withLogging(agent: BaseAgent): BaseAgent {
  const original = agent.process.bind(agent);
  
  agent.process = async (input) => {
    console.log(`Input: ${input}`);
    const start = Date.now();
    const result = await original(input);
    console.log(`Output: ${result} (${Date.now() - start}ms)`);
    return result;
  };
  
  return agent;
}

function withRetry(agent: BaseAgent, maxRetries = 3): BaseAgent {
  const original = agent.process.bind(agent);
  
  agent.process = async (input) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await original(input);
      } catch (err) {
        if (i === maxRetries - 1) throw err;
      }
    }
  };
  
  return agent;
}

// 使用
let agent = new BaseAgent();
agent = withLogging(agent);
agent = withRetry(agent, 5);
```

## 5. 工厂模式 (Factory)

```typescript
// Agent 工厂
class AgentFactory {
  private static agents: Map<string, AgentCreator> = new Map();
  
  static register(type: string, creator: AgentCreator) {
    this.agents.set(type, creator);
  }
  
  static create(type: string, config: Config): Agent {
    const creator = this.agents.get(type);
    if (!creator) {
      throw new Error(`Unknown agent type: ${type}`);
    }
    return creator.create(config);
  }
  
  static createChat(config): Agent {
    return new ChatAgent(config);
  }
  
  static createCode(config): Agent {
    return new CodeAgent(config);
  }
  
  static createResearch(config): Agent {
    return new ResearchAgent(config);
  }
}

// 注册
AgentFactory.register('chat', {
  create: (config) => new ChatAgent(config)
});
```

## 6. 适配器模式 (Adapter)

```typescript
// 统一接口
interface LLMAdapter {
  complete(prompt: string): Promise<string>;
  chat(messages: Message[]): Promise<string>;
}

// OpenAI 适配器
class OpenAIAdapter implements LLMAdapter {
  async complete(prompt) {
    const response = await this.client.completions.create({
      model: 'gpt-4',
      prompt
    });
    return response.choices[0].text;
  }
  
  async chat(messages) {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages
    });
    return response.choices[0].message.content;
  }
}

// Anthropic 适配器
class AnthropicAdapter implements LLMAdapter {
  async complete(prompt) {
    const response = await this.client.complete({
      model: 'claude-3-opus',
      prompt
    });
    return response.completion;
  }
  
  async chat(messages) {
    const response = await this.client.messages.create({
      model: 'claude-3-opus',
      messages
    });
    return response.content[0].text;
  }
}
```

## 7. 单例模式 (Singleton)

```typescript
class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, Agent> = new Map();
  
  private constructor() {}
  
  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }
  
  register(name: string, agent: Agent) {
    this.agents.set(name, agent);
  }
  
  get(name: string): Agent {
    return this.agents.get(name);
  }
}
```

---

*AI Agent 系统设计模式 v1.0*
