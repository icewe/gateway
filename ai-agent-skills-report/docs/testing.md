# AI Agent 测试策略

## 单元测试

```javascript
// 测试 Agent 响应
describe('Agent', () => {
  it('should respond to greeting', async () => {
    const response = await agent.chat('你好');
    expect(response).toContain('你好');
  });
  
  it('should handle errors gracefully', async () => {
    const response = await agent.chat('invalid request');
    expect(response.error).toBeDefined();
  });
});
```

## 集成测试

```javascript
// 测试 MCP 集成
describe('MCP Integration', () => {
  it('should connect to filesystem', async () => {
    const result = await mcp.filesystem.list('/tmp');
    expect(result).toBeDefined();
  });
  
  it('should handle connection errors', async () => {
    await expect(
      mcp.filesystem.list('/nonexistent')
    ).rejects.toThrow();
  });
});
```

## E2E 测试

```javascript
// 完整流程测试
const testFlow = async () => {
  // 1. 登录
  const session = await login('user@test.com', 'password');
  expect(session.token).toBeDefined();
  
  // 2. 创建 Agent
  const agent = await createAgent(session, { name: 'TestBot' });
  expect(agent.id).toBeDefined();
  
  // 3. 对话
  const response = await chat(agent.id, '你好');
  expect(response.message).toBeDefined();
};
```

## 性能测试

```javascript
// 负载测试
const loadTest = async (concurrent = 100) => {
  const requests = Array(concurrent).fill().map(() => 
    agent.chat('测试消息')
  );
  
  const results = await Promise.allSettled(requests);
  const succeeded = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');
  
  return {
    total: concurrent,
    succeeded: succeeded.length,
    failed: failed.length,
    latency: avg(results.map(r => r.latency))
  };
};
```

---

*测试策略 v1.0*
