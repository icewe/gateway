# AI Agent 测试完全指南

## 测试策略

```
┌─────────────────────────────────────────────────────────────┐
│                   Test Pyramid                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                        ┌─────┐                             │
│                       / E2E \                            │
│                      └───────┘                           │
│                   ┌───────────┐                          │
│                  / Integration \                        │
│                 └─────────────┘                        │
│               ┌───────────────┐                        │
│              /    Unit       \                        │
│             └─────────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 单元测试

### 1. Agent 核心逻辑测试

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 测试 Agent 推理逻辑
describe('Agent Reasoning', () => {
  let agent: ReasoningAgent;
  
  beforeEach(() => {
    agent = new ReasoningAgent({
      model: mockModel,
      maxIterations: 5
    });
  });
  
  // 测试任务分解
  it('should decompose complex task', async () => {
    const task = '分析用户行为并生成报告';
    
    const steps = await agent.decompose(task);
    
    expect(steps).toHaveLength(3);
    expect(steps[0].type).toBe('analysis');
    expect(steps[1].type).toBe('processing');
    expect(steps[2].type).toBe('report');
  });
  
  // 测试推理路径选择
  it('should select correct reasoning path', async () => {
    const task = { 
      type: 'math', 
      difficulty: 'hard',
      requiresProof: true 
    };
    
    const path = agent.selectReasoningPath(task);
    
    expect(path).toBe('chain_of_thought');
  });
  
  // 测试上下文管理
  it('should manage context window', async () => {
    const messages = Array(100).fill({ content: 'x'.repeat(1000) });
    
    const trimmed = agent.manageContext(messages, { maxTokens: 8000 });
    
    expect(trimmed.length).toBeLessThan(messages.length);
    expect(trimmed[0]).toBe(messages[0]); // 保留最新
  });
});
```

### 2. 工具调用测试

```typescript
describe('Tool Execution', () => {
  let toolExecutor: ToolExecutor;
  let mockTools: Map<string, MockTool>;
  
  beforeEach(() => {
    mockTools = new Map([
      ['search', { execute: vi.fn().mockResolvedValue({ results: [] }) }],
      ['calculator', { execute: vi.fn().mockResolvedValue(42) }]
    ]);
    
    toolExecutor = new ToolExecutor({ tools: mockTools });
  });
  
  // 测试工具选择
  it('should select appropriate tool', async () => {
    const task = { action: 'search', query: 'AI news' };
    
    const tool = toolExecutor.selectTool(task);
    
    expect(tool.name).toBe('search');
  });
  
  // 测试工具执行
  it('should execute tool and return result', async () => {
    const task = { 
      tool: 'search', 
      params: { query: 'test' } 
    };
    
    const result = await toolExecutor.execute(task);
    
    expect(mockTools.get('search').execute).toHaveBeenCalledWith({ query: 'test' });
    expect(result).toEqual({ results: [] });
  });
  
  // 测试工具错误处理
  it('should handle tool errors gracefully', async () => {
    mockTools.get('search').execute.mockRejectedValue(new Error('Network error'));
    
    const task = { tool: 'search', params: {} };
    
    await expect(toolExecutor.execute(task)).rejects.toThrow('Network error');
  });
});
```

## 集成测试

### 1. API 端点测试

```typescript
import request from 'supertest';

describe('Agent API', () => {
  const app = createApp();
  
  // 测试健康检查
  it('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
  
  // 测试 Agent 请求
  it('POST /agent/execute should process request', async () => {
    const response = await request(app)
      .post('/agent/execute')
      .send({
        task: '分析这段文字的情感',
        text: '这个产品太棒了！'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.result).toBeDefined();
    expect(response.body.result.sentiment).toBeDefined();
  });
  
  // 测试认证
  it('should reject unauthorized requests', async () => {
    const response = await request(app)
      .post('/agent/execute')
      .send({ task: 'do something' });
    
    expect(response.status).toBe(401);
  });
  
  // 测试速率限制
  it('should rate limit excessive requests', async () => {
    // 发送超过限制的请求
    for (let i = 0; i < 110; i++) {
      await request(app).post('/agent/execute').send({ task: 'test' });
    }
    
    const response = await request(app)
      .post('/agent/execute')
      .send({ task: 'test' });
    
    expect(response.status).toBe(429);
  });
});
```

### 2. MCP 集成测试

```typescript
describe('MCP Integration', () => {
  let mcpClient: MCPClient;
  let mcpServer: MCPTestServer;
  
  beforeAll(async () => {
    mcpServer = new MCPTestServer();
    await mcpServer.start();
    
    mcpClient = new MCPClient({
      transport: 'stdio',
      command: 'node',
      args: [mcpServer.path]
    });
    
    await mcpClient.connect();
  });
  
  afterAll(async () => {
    await mcpClient.disconnect();
    await mcpServer.stop();
  });
  
  // 测试工具列表
  it('should list available tools', async () => {
    const tools = await mcpClient.listTools();
    
    expect(tools).toContain('filesystem');
    expect(tools).toContain('search');
  });
  
  // 测试工具调用
  it('should call tool and get result', async () => {
    const result = await mcpClient.callTool('search', {
      query: 'AI'
    });
    
    expect(result).toHaveProperty('results');
  });
  
  // 测试资源访问
  it('should read resource', async () => {
    const content = await mcpClient.readResource('file:///test.txt');
    
    expect(content).toBeDefined();
  });
});
```

## E2E 测试

### 1. 完整用户流程

```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete Agent Flow', () => {
  test('should complete analysis task', async ({ page }) => {
    // 1. 登录
    await page.goto('/login');
    await page.fill('[name=email]', 'user@test.com');
    await page.fill('[name=password]', 'password');
    await page.click('[type=submit]');
    
    // 2. 创建任务
    await page.click('[data-testid=new-task]');
    await page.fill('[data-testid=task-input]', '分析本月销售数据');
    await page.click('[data-testid=submit]');
    
    // 3. 等待处理
    await expect(page.locator('[data-testid=status]'))
      .toContainText('处理中', { timeout: 10000 });
    
    // 4. 验证完成
    await expect(page.locator('[data-testid=status]'))
      .toContainText('完成', { timeout: 60000 });
    
    // 5. 检查结果
    await expect(page.locator('[data-testid=result]'))
      .toBeVisible();
  });
});
```

### 2. 并发测试

```typescript
import { test, expect } from '@playwright/test';

test.describe('Concurrent Requests', () => {
  test('should handle multiple simultaneous requests', async ({ browser }) => {
    const context = await browser.newContext();
    const pages = await Promise.all(
      Array(10).fill().map(() => context.newPage())
    );
    
    // 并发发送请求
    const requests = pages.map((page, i) => 
      page.goto(`/agent/execute?task=${i}`)
    );
    
    const responses = await Promise.all(requests);
    
    // 验证所有请求成功
    const successCount = responses.filter(r => r.ok()).length;
    expect(successCount).toBe(10);
  });
});
```

## 性能测试

### 1. 负载测试

```typescript
import k6 from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // 2分钟内增加到100用户
    { duration: '5m', target: 100 },  // 保持100用户
    { duration: '2m', target: 0 },   // 降到0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95%请求<500ms
    http_req_failed: ['rate<0.01'],    // 失败率<1%
  }
};

export default function() {
  const response = http.post('https://api.example.com/agent/execute', 
    JSON.stringify({ task: '分析数据' }),
    {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${__ENV.TOKEN}`
      }
    }
  );
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500
  });
}
```

### 2. 压力测试

```typescript
describe('Stress Testing', () => {
  it('should handle burst requests', async () => {
    const burstSize = 1000;
    const startTime = Date.now();
    
    // 突发请求
    const promises = Array(burstSize).fill().map((_, i) =>
      agent.execute({ task: `task-${i}` })
    );
    
    const results = await Promise.allSettled(promises);
    
    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    // 验证
    expect(successCount).toBeGreaterThan(burstSize * 0.95); // >95% 成功
    expect(duration).toBeLessThan(30000); // 30秒内完成
  });
});
```

---

*测试完全指南 v1.0*
