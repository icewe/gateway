# AI Agent 进阶架构模式

## 1. 反思架构 (Reflection Architecture)

```typescript
class ReflectiveAgent {
  constructor(config) {
    this.generator = new Generator();
    this.reflector = new Reflector();
    this.maxIterations = 3;
  }
  
  async execute(task) {
    let current = null;
    let iteration = 0;
    
    while (iteration < this.maxIterations) {
      // 生成
      current = await this.generator.generate(task, current);
      
      // 反思
      const reflection = await this.reflector.reflect(task, current);
      
      // 检查质量
      if (reflection.quality >= 0.9) {
        return current;
      }
      
      // 改进
      current = await this.generator.improve(current, reflection.feedback);
      iteration++;
    }
    
    return current;
  }
}

class Reflector {
  async reflect(task, output) {
    // 多维度评估
    const [accuracy, completeness, clarity] = await Promise.all([
      this.checkAccuracy(task, output),
      this.checkCompleteness(task, output),
      this.checkClarity(output)
    ]);
    
    return {
      quality: (accuracy + completeness + clarity) / 3,
      accuracy,
      completeness,
      clarity,
      feedback: this.generateFeedback({ accuracy, completeness, clarity })
    };
  }
  
  async checkAccuracy(task, output) {
    // 使用外部工具验证事实
    const facts = this.extractFacts(output);
    const verified = await Promise.all(
      facts.map(f => this.verifyFact(f))
    );
    return verified.filter(v => v).length / facts.length;
  }
}
```

## 2. 规划执行架构 (Plan-Execute)

```typescript
class PlanExecuteAgent {
  constructor(config) {
    this.planner = new Planner();
    this.executor = new Executor();
    this.replan = new RePlanner();
  }
  
  async execute(task) {
    // 规划阶段
    const plan = await this.planner.create(task);
    
    // 执行阶段
    let results = [];
    for (const step of plan.steps) {
      const result = await this.executor.execute(step);
      results.push(result);
      
      // 检查是否需要重新规划
      if (this.needsReplan(step, result)) {
        plan = await this.replan.replan(plan, results);
      }
    }
    
    // 整合结果
    return this.integrate(results);
  }
}

class Planner {
  async create(task) {
    // 分解任务
    const decomposition = await this.decompose(task);
    
    // 排序
    const ordered = this.order(decomposition);
    
    // 添加依赖
    const withDeps = this.addDependencies(ordered);
    
    return { steps: withDeps };
  }
  
  async decompose(task) {
    const prompt = `
      任务: ${task.description}
      
      请将任务分解为可执行的步骤。
      每个步骤应该:
      1. 有明确的输入输出
      2. 可以独立执行
      3. 有清晰的完成标准
      
      输出 JSON 格式:
      {
        "steps": [
          { "id": 1, "description": "...", "dependsOn": [] }
        ]
      }
    `;
    
    const response = await this.llm.complete(prompt);
    return JSON.parse(response.text).steps;
  }
}
```

## 3. 工具选择架构

```typescript
class ToolSelectingAgent {
  constructor(config) {
    this.tools = new ToolRegistry();
    this.selector = new ToolSelector();
  }
  
  async execute(task) {
    // 1. 理解任务
    const understanding = await this.understand(task);
    
    // 2. 选择工具
    const selectedTools = await this.selector.select(
      understanding,
      this.tools.list()
    );
    
    // 3. 排序工具
    const ordered = this.orderTools(selectedTools);
    
    // 4. 执行
    let context = task;
    for (const tool of ordered) {
      const result = await this.executeTool(tool, context);
      context = this.mergeContext(context, result);
    }
    
    // 5. 生成最终响应
    return await this.generate(context);
  }
}

class ToolSelector {
  async select(understanding, tools) {
    const prompt = `
      任务理解: ${JSON.stringify(understanding)}
      
      可用工具:
      ${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}
      
      选择最合适的工具并解释理由。
      输出 JSON:
      {
        "selected": ["tool1", "tool2"],
        "reasons": { "tool1": "理由" }
      }
    `;
    
    const response = await this.llm.complete(prompt);
    const result = JSON.parse(response.text);
    
    return result.selected.map(name => 
      tools.find(t => t.name === name)
    );
  }
}
```

## 4. 记忆架构

```typescript
class MemoryAgent {
  constructor(config) {
    this.shortTerm = new RingBuffer(config.shortTermSize);
    this.longTerm = new VectorStore();
    this.working = new WorkingMemory();
  }
  
  async execute(task) {
    // 1. 检索相关记忆
    const relevant = await this.longTerm.search(task, { topK: 5 });
    
    // 2. 加载到工作记忆
    this.working.load(relevant);
    
    // 3. 执行
    const result = await this.agent.execute(task, this.working);
    
    // 4. 保存到短期记忆
    this.shortTerm.push({
      task,
      result,
      timestamp: Date.now()
    });
    
    // 5. 定期固化到长期记忆
    if (this.shortTerm.isFull()) {
      await this.consolidate();
    }
    
    return result;
  }
  
  async consolidate() {
    // 选择重要记忆
    const important = this.shortTerm
      .toArray()
      .filter(m => m.importance > 0.7);
    
    // 嵌入并存储
    for (const memory of important) {
      const embedding = await this.embed(JSON.stringify(memory));
      await this.longTerm.add({
        embedding,
        content: memory,
        metadata: { timestamp: memory.timestamp }
      });
    }
    
    // 清空短期记忆
    this.shortTerm.clear();
  }
}
```

## 5. 多Agent协作

```typescript
class MultiAgentTeam {
  constructor(config) {
    this.coordinator = new CoordinatorAgent(config.coordinator);
    this.specialists = config.specialists.map(s => 
      new SpecialistAgent(s)
    );
  }
  
  async execute(task) {
    // 1. 协调者分析任务
    const decomposition = await this.coordinator.decompose(task);
    
    // 2. 分发给专业 Agent
    const assignments = this.assign(decomposition);
    
    // 3. 并行执行
    const results = await Promise.all(
      assignments.map(a => 
        this.specialists.find(s => s.type === a.type).execute(a.task)
      )
    );
    
    // 4. 协调者整合
    const integrated = await this.coordinator.integrate(
      decomposition,
      results
    );
    
    // 5. 审核（如需要）
    if (decomposition.needsReview) {
      return await this.coordinator.review(integrated);
    }
    
    return integrated;
  }
}
```

---

*AI Agent 进阶架构模式 v1.0*
