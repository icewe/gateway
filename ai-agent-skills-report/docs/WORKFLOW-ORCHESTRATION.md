# Agent 工作流编排实战

## 1. 任务队列

```typescript
class TaskQueue {
  private queue: Task[] = [];
  private processing = false;
  
  async enqueue(task: Task): Promise<void> {
    this.queue.push(task);
    
    if (!this.processing) {
      this.process();
    }
  }
  
  private async process() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      await this.execute(task);
    }
    
    this.processing = false;
  }
  
  private async execute(task: Task): Promise<void> {
    const agent = this.getAgent(task.type);
    
    try {
      const result = await agent.execute(task.input);
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    }
  }
}
```

## 2. 状态机

```typescript
class WorkflowStateMachine {
  private states: Map<string, State> = new Map();
  private transitions: Map<string, Transition[]> = new Map();
  
  addState(name: string, handlers?: StateHandlers): void {
    this.states.set(name, {
      name,
      handlers
    });
  }
  
  addTransition(from: string, to: string, condition?: () => boolean): void {
    if (!this.transitions.has(from)) {
      this.transitions.set(from, []);
    }
    
    this.transitions.get(from).push({ to, condition });
  }
  
  async transition(state: string): Promise<void> {
    const transitions = this.transitions.get(state) || [];
    
    for (const t of transitions) {
      if (!t.condition || t.condition()) {
        await this.enterState(t.to);
        return;
      }
    }
    
    throw new Error(`No valid transition from ${state}`);
  }
}
```

## 3. 并发控制

```typescript
class ConcurrencyController {
  private running = 0;
  private queue: (() => Promise<void>)[] = [];
  
  constructor(private maxConcurrent: number) {}
  
  async run<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const wrapped = async () => {
        try {
          resolve(await fn());
        } catch (e) {
          reject(e);
        } finally {
          this.running--;
          this.next();
        }
      };
      
      if (this.running >= this.maxConcurrent) {
        this.queue.push(wrapped);
      } else {
        this.running++;
        wrapped();
      }
    });
  }
  
  private next(): void {
    if (this.queue.length > 0) {
      const fn = this.queue.shift();
      this.running++;
      fn();
    }
  }
}
```

---

*Agent 工作流编排实战 v1.0*
