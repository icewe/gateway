# AI Agent 提示工程高级技巧

## 1. 结构化提示

### YAML 配置

```yaml
# agent_prompt.yaml
role: "AI编程助手"
expertise:
  - TypeScript
  - React
  - Node.js
  - 系统设计

constraints:
  - "优先使用类型安全方案"
  - "避免 any 类型"
  - "遵循 SOLID 原则"

response_format:
  code: "完整可运行代码"
  explanation: "简洁中文说明"
  caveats: "注意事项"

style:
  code: "modern-esm"
  comments: "中文"
```

### 代码实现

```typescript
class PromptBuilder {
  build(config: PromptConfig): string {
    return `
# 角色
${config.role}

# 专业领域
${config.expertise.map(e => `- ${e}`).join('\n')}

# 约束
${config.constraints.map(c => `- ${c}`).join('\n')}

# 输出格式
${config.response_format.code}
${config.response_format.explanation}
${config.response_format.caveats}

# 风格
代码风格: ${config.style.code}
注释语言: ${config.style.comments}
    `.trim();
  }
}
```

## 2. 思维链引导

### 基础 CoT

```
问题: 计算 24 * 17

思考过程:
1. 24 * 17 = 24 * (10 + 7)
2. 24 * 10 = 240
3. 24 * 7 = 168
4. 240 + 168 = 408

答案: 408
```

### 分步推理

```markdown
请按以下步骤思考:

1. 理解问题 - 用一句话描述问题本质
2. 分析条件 - 列出所有已知信息和限制
3. 设计方案 - 提出可能的解决方案
4. 评估方案 - 权衡各方案的优劣
5. 选择最优 - 给出最终建议
6. 验证结果 - 检查答案是否合理
```

## 3. 上下文管理

### 滑动窗口

```typescript
class ContextManager {
  private maxTokens: number;
  private messages: Message[] = [];
  
  add(message: Message) {
    this.messages.push(message);
    this.trim();
  }
  
  private trim() {
    while (this.getTokenCount() > this.maxTokens) {
      // 移除最旧的消息，但保留系统提示
      const removed = this.messages.shift();
      if (removed?.role === 'system') {
        this.messages.unshift(removed);
        this.messages.splice(1, 1);
      }
    }
  }
  
  getMessages() {
    return this.messages;
  }
}
```

### 重要性排序

```typescript
class PriorityContextManager {
  classifyImportance(message: Message): number {
    // 系统消息 - 最高
    if (message.role === 'system') return 100;
    
    // 工具结果 - 高
    if (message.role === 'tool') return 80;
    
    // 用户最后一条 - 高
    if (message.role === 'user' && this.isLast(message)) return 70;
    
    // 助手消息 - 中
    if (message.role === 'assistant') return 50;
    
    // 历史消息 - 低
    return 10;
  }
  
  selectMessages(maxTokens: number): Message[] {
    const scored = this.messages.map(m => ({
      message: m,
      score: this.classifyImportance(m)
    }));
    
    // 按重要性排序，优先保留
    scored.sort((a, b) => b.score - a.score);
    
    // 选择最重要的直到达到 token 限制
    // ...
  }
}
```

## 4. Few-Shot 学习

### 示例选择

```typescript
class FewShotSelector {
  async select(task: string, examples: Example[]): Promise<Example[]> {
    // 1. 嵌入任务
    const taskEmbedding = await this.embed(task);
    
    // 2. 计算相似度
    const scored = await Promise.map(async (ex) => ({
       .all(
      examples example: ex,
        similarity: await this.cosineSimilarity(
          taskEmbedding,
          await this.embed(ex.input)
        )
      }))
    );
    
    // 3. 选择最相似的
    scored.sort((a, b) => b.similarity - a.similarity);
    
    // 4. 返回 top-k
    return scored.slice(0, 5).map(s => s.example);
  }
}
```

### 示例格式

```markdown
示例1:
输入: 翻译 "Hello world" 到中文
输出: "你好世界"

示例2:
输入: 翻译 "Good morning" 到中文
输出: "早上好"

示例3:
输入: 翻译 "Thank you" 到中文
输出: "谢谢"
```

## 5. 角色扮演

### 多角色协作

```markdown
你是一个技术评审团队，包含以下角色:

1. 架构师 - 关注系统设计和可扩展性
2. 安全专家 - 关注潜在安全漏洞
3. 性能工程师 - 关注性能瓶颈
4. 代码审查员 - 关注代码质量和最佳实践

对于每个代码审查:
1. 架构师先给出评分和建议
2. 安全专家检查安全问题
3. 性能工程师分析性能影响
4. 代码审查员给出最终建议

最后综合各方意见给出总结。
```

## 6. 约束强化

### 硬约束

```
绝对禁止:
- 不要使用 eval()
- 不要使用 innerHTML
- 不要使用不安全的加密算法

必须遵守:
- 所有输入必须验证
- 错误必须处理
- 日志必须记录
```

### 软约束

```
优先:
- 使用 const 而不是 let
- 使用类型注解
- 添加 JSDoc 注释

避免:
- 深层嵌套 (>3层)
- 长函数 (>50行)
- 全局变量
```

---

*AI Agent 提示工程高级技巧 v1.0*
