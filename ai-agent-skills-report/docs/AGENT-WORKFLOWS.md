# AI Agent 工作流模式

## 1. ReAct 模式

```
Thought: 需要搜索信息
Action: search
Observation: 结果显示...
Thought: 需要计算
Action: calculator
Observation: 计算结果
Final Answer: 基于以上信息回答
```

```typescript
class ReActAgent {
  async think(input) {
    const steps = [];
    let current = input;
    
    for (let i = 0; i < this.maxIterations; i++) {
      // 思考
      const thought = await this.model.think(current);
      steps.push({ thought });
      
      // 决定行动
      if (thought.action) {
        // 执行
        const obs = await this.execute(thought.action);
        steps.push({ observation: obs });
        
        current = { ...current, observation: obs };
      } else {
        // 结束
        return { answer: thought.answer, steps };
      }
    }
    
    return { answer: 'Max iterations', steps };
  }
}
```

## 2. Tool Use 模式

```
User: 查询北京天气

1. 工具选择: weather
2. 参数生成: { city: "北京" }
3. 执行调用
4. 结果解析
5. 生成回复
```

```typescript
class ToolUseAgent {
  async process(input) {
    // 1. 提取意图
    const intent = await this.extractIntent(input);
    
    // 2. 选择工具
    const tool = this.selectTool(intent);
    
    // 3. 生成参数
    const params = await this.generateParams(tool, input);
    
    // 4. 执行
    const result = await this.executeTool(tool, params);
    
    // 5. 生成回复
    return await this.generateResponse(result);
  }
}
```

## 3. Planning 模式

```
Goal: 写一篇研究报告

Plan:
1. 搜索相关资料
2. 整理信息
3. 大纲制定
4. 撰写内容
5. 审核修改

Execution:
→ Search → 
→ Analyze → 
→ Outline → 
→ Write → 
→ Review
```

```typescript
class PlanningAgent {
  async plan(goal) {
    // 分解任务
    const tasks = await this.decompose(goal);
    
    // 排序
    const ordered = this.orderTasks(tasks);
    
    // 执行
    const results = [];
    for (const task of ordered) {
      const result = await this.executeTask(task);
      results.push(result);
    }
    
    // 整合
    return this.integrate(results);
  }
}
```

## 4. Reflection 模式

```
生成初始回答
    ↓
自我反思: 是否有遗漏?
    ↓
改进回答
    ↓
再次反思
    ↓
最终输出
```

```typescript
class ReflectionAgent {
  async generate(input) {
    // 初始生成
    let answer = await this.model.generate(input);
    
    // 反思循环
    for (let i = 0; i < this.maxReflections; i++) {
      // 反思
      const reflection = await this.reflect(answer, input);
      
      if (reflection.isGood) {
        break;
      }
      
      // 改进
      answer = await this.improve(answer, reflection.feedback);
    }
    
    return answer;
  }
  
  async reflect(answer, input) {
    const prompt = `
      Input: ${input}
      Answer: ${answer}
      
      反思:
      1. 回答是否完整?
      2. 是否有错误?
      3. 可以如何改进?
    `;
    
    return await this.model.generate(prompt);
  }
}
```

## 5. Multi-Agent 模式

```
┌─────────────────────────────────────┐
│         Coordinator Agent            │
│  (分解任务, 分发给子 Agent)           │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
┌───────┐  ┌───────┐  ┌───────┐
│Search │  │Write  │  │Review │
│ Agent │  │ Agent │  │ Agent │
└───┬───┘  └───┬───┘  └───┬───┘
    │          │          │
    └──────────┼──────────┘
               ▼
        ┌─────────────┐
        │  整合结果   │
        └─────────────┘
```

```typescript
class MultiAgentSystem {
  constructor() {
    this.agents = {
      coordinator: new CoordinatorAgent(),
      search: new SearchAgent(),
      writer: new WriterAgent(),
      reviewer: new ReviewerAgent()
    };
  }
  
  async execute(task) {
    // 协调者分解任务
    const subtasks = await this.agents.coordinator.decompose(task);
    
    // 并行执行
    const results = await Promise.all(
      subtasks.map(st => this.dispatch(st))
    );
    
    // 整合结果
    return await this.agents.coordinator.integrate(results);
  }
  
  async dispatch(task) {
    const agent = this.selectAgent(task.type);
    return await agent.execute(task);
  }
}
```

---

*AI Agent 工作流模式 v1.0*
