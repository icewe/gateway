# AI Agent 故障排查指南

## 常见问题与解决方案

### Skills 问题

#### 1. Skill 安装失败

**症状**: `npx skills add` 报错

**解决**:
```bash
# 清除缓存
npm cache clean --force

# 使用全局安装
npx -y skills add <owner/repo>

# 检查网络
ping github.com
```

#### 2. Skill 不生效

**症状**: Agent 无法使用 Skill

**解决**:
```bash
# 列出已安装
npx skills list

# 重新安装
npx skills remove <skill>
npx skills add <skill>
```

#### 3. Skill 版本过旧

**解决**:
```bash
npx skills update
# 或
npx skills add <skill>@latest
```

### MCP 问题

#### 1. MCP 服务器连接失败

**症状**: `Error: MCP server not responding`

**解决**:
```bash
# 检查服务器状态
ps aux | grep mcp

# 重启服务器
npx @modelcontextprotocol/server-filesystem /path &
```

#### 2. 权限错误

**症状**: `Permission denied`

**解决**:
```javascript
// 检查配置
const config = {
  permissions: {
    filesystem: {
      allowedPaths: ["/allowed/path"]
    }
  }
};
```

#### 3. 超时问题

**解决**:
```javascript
const mcpClient = new MCPClient({
  timeout: 60000, // 60秒
  retries: 3
});
```

### Agent 问题

#### 1. 响应质量下降

**解决**:
- 增加上下文
- 调整 temperature
- 使用更好的模型

#### 2. Token 超出限制

**解决**:
- 压缩历史记录
- 拆分任务
- 使用摘要

#### 3. 费用超支

**解决**:
- 设置预算限制
- 使用小模型
- 启用缓存

### 网络问题

#### 1. API 请求失败

**解决**:
```javascript
const retry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(1000 * Math.pow(2, i));
    }
  }
};
```

#### 2. 超时

**解决**:
```javascript
const withTimeout = (promise, ms) => 
  Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
```

## 调试技巧

### 1. 详细日志

```javascript
const debug = {
  level: 'verbose',
  log: (msg, data) => {
    if (debug.level === 'verbose') {
      console.log(`[DEBUG] ${msg}`, data);
    }
  }
};
```

### 2. 分步执行

```javascript
// 不要
await agent.execute(complexTask);

// 改为
const steps = decomposeTask(complexTask);
for (const step of steps) {
  await agent.execute(step);
}
```

### 3. 检查点

```javascript
const checkpoint = async (name, fn) => {
  console.log(`[CHECKPOINT] ${name}...`);
  const result = await fn();
  console.log(`[CHECKPOINT] ${name} ✓`);
  return result;
};
```

## 监控与告警

### 关键指标

```javascript
const metrics = {
  responseTime: 0,
  errorRate: 0,
  tokenUsage: 0,
  cost: 0
};

setInterval(() => {
  // 发送指标到监控服务
  sendMetrics(metrics);
}, 60000);
```

### 告警规则

```javascript
const alerts = [
  { metric: 'errorRate', threshold: 0.1, action: 'notify' },
  { metric: 'cost', threshold: 100, action: 'pause' },
  { metric: 'responseTime', threshold: 30000, action: 'optimize' }
];
```

---

*故障排查 v1.0*
