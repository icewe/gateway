# OpenClaw Agent 架构深度解析

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenClaw Architecture                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Gateway                             │    │
│  │   ┌─────────┐  ┌─────────┐  ┌─────────┐          │    │
│  │   │  HTTP   │  │  WebSocket│  │  Cron  │          │    │
│  │   │ Server  │  │          │  │        │          │    │
│  │   └────┬────┘  └────┬────┘  └────┬────┘          │    │
│  │        │            │            │                  │    │
│  │        └────────────┼────────────┘                  │    │
│  │                     ▼                               │    │
│  │            ┌───────────────┐                       │    │
│  │            │  Agent Engine  │                       │    │
│  │            └───────┬───────┘                       │    │
│  └────────────────────┼───────────────────────────────┘    │
│                       │                                      │
│  ┌────────────────────┼───────────────────────────────┐    │
│  │                    ▼                                │    │
│  │            ┌───────────────┐                      │    │
│  │            │  Skills System │                      │    │
│  │            └───────┬───────┘                      │    │
│  │                    │                                │    │
│  │   ┌───────────────┼───────────────┐               │    │
│  │   ▼               ▼               ▼               │    │
│  │ ┌─────┐      ┌─────────┐      ┌──────┐           │    │
│  │ │MCP  │      │ Tools   │      │Memory│           │    │
│  │ │     │      │         │      │      │           │    │
│  │ └─────┘      └─────────┘      └──────┘           │    │
│  │                                                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 核心组件

### 1. Gateway

```typescript
class Gateway {
  constructor(config) {
    this.server = new HTTPServer(config.port);
    this.sessions = new SessionManager();
    this.plugins = new PluginManager();
    this.cron = new CronScheduler();
  }
  
  async start() {
    // 加载插件
    await this.plugins.loadAll();
    
    // 启动 HTTP 服务器
    await this.server.start();
    
    // 启动 Cron
    await this.cron.start();
  }
  
  // 处理消息
  async handleMessage(message, channel) {
    // 路由到对应 session
    const session = await this.sessions.getOrCreate(channel);
    
    // 发送到 agent
    return await session.process(message);
  }
}
```

### 2. Session 管理

```typescript
class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.maxSessions = 1000;
  }
  
  async getOrCreate(channel) {
    const key = this.getKey(channel);
    
    if (!this.sessions.has(key)) {
      // 创建新 session
      const session = new AgentSession({
        channel,
        model: this.selectModel(channel),
        skills: await this.loadSkills(channel)
      });
      
      this.sessions.set(key, session);
    }
    
    return this.sessions.get(key);
  }
  
  selectModel(channel) {
    // 根据 channel 选择模型
    return 'minimax/MiniMax-M2.5';
  }
  
  async loadSkills(channel) {
    // 加载 channel 对应的 skills
    return await SkillsRegistry.getForChannel(channel);
  }
}
```

### 3. Agent Engine

```typescript
class AgentEngine {
  constructor(config) {
    this.model = new ModelClient(config.model);
    this.tools = new ToolRegistry();
    this.memory = new MemoryManager();
    this.skills = new SkillLoader();
  }
  
  async process(input, context) {
    // 1. 加载上下文
    const contextMessages = await this.memory.getContext(context);
    
    // 2. 加载 skills
    const skillInstructions = await this.skills.getInstructions(context);
    
    // 3. 构建 prompt
    const prompt = this.buildPrompt(input, contextMessages, skillInstructions);
    
    // 4. 调用模型
    const response = await this.model.complete(prompt);
    
    // 5. 执行工具调用
    const toolResults = await this.executeTools(response.toolCalls);
    
    // 6. 再次调用模型（如果需要）
    if (toolResults.length > 0) {
      const finalResponse = await this.model.complete([
        ...prompt,
        response,
        ...toolResults
      ]);
      
      return finalResponse;
    }
    
    return response;
  }
  
  buildPrompt(input, context, skills) {
    return [
      ...context,
      { role: 'system', content: skills.join('\n\n') },
      { role: 'user', content: input }
    ];
  }
}
```

## Skills 系统

### 1. Skill 定义

```typescript
interface Skill {
  name: string;
  description: string;
  
  // 触发条件
  trigger?: {
    keywords?: string[];
    patterns?: RegExp[];
    platforms?: string[];
  };
  
  // 指令
  instructions: string;
  
  // 工具
  tools?: Tool[];
  
  // 示例
  examples?: Example[];
}
```

### 2. Skill 加载

```typescript
class SkillLoader {
  constructor() {
    this.skills = new Map();
  }
  
  async load(skillPath: string) {
    // 读取 SKILL.md
    const content = await fs.readFile(`${skillPath}/SKILL.md`, 'utf-8');
    
    // 解析
    const skill = this.parse(content);
    
    // 加载工具
    if (skill.tools) {
      for (const tool of skill.tools) {
        await this.loadTool(skillPath, tool);
      }
    }
    
    // 注册
    this.skills.set(skill.name, skill);
    
    return skill;
  }
  
  async getInstructions(context) {
    const relevant = [];
    
    for (const skill of this.skills.values()) {
      if (this.matchesTrigger(skill, context)) {
        relevant.push(skill.instructions);
      }
    }
    
    return relevant;
  }
  
  matchesTrigger(skill, context) {
    if (!skill.trigger) return true;
    
    const { keywords, patterns } = skill.trigger;
    const text = context.input.toLowerCase();
    
    if (keywords && keywords.some(k => text.includes(k))) {
      return true;
    }
    
    if (patterns && patterns.some(p => p.test(text))) {
      return true;
    }
    
    return false;
  }
}
```

## MCP 集成

### 1. MCP Server 注册

```typescript
class MCPRegistry {
  constructor() {
    this.servers = new Map();
  }
  
  async register(config) {
    // 启动 MCP server
    const server = new MCPServer({
      command: config.command,
      args: config.args,
      env: config.env
    });
    
    await server.start();
    
    this.servers.set(config.name, server);
    
    return server;
  }
  
  async callTool(serverName, toolName, params) {
    const server = this.servers.get(serverName);
    if (!server) {
      throw new Error(`MCP server ${serverName} not found`);
    }
    
    return await server.callTool(toolName, params);
  }
}
```

### 2. 工具桥接

```typescript
class ToolBridge {
  constructor(mcpRegistry) {
    this.mcp = mcpRegistry;
    this.localTools = new Map();
  }
  
  // 暴露给 Agent
  async executeTool(name, params) {
    // 本地工具
    if (this.localTools.has(name)) {
      return await this.localTools.get(name)(params);
    }
    
    // MCP 工具
    const [server, tool] = name.split(':');
    return await this.mcp.callTool(server, tool, params);
  }
}
```

---

*OpenClaw 架构深度解析 v1.0*
