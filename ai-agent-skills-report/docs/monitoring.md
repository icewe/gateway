# AI Agent 监控与可观测性

## 指标收集

### 核心指标

```javascript
const metrics = {
  // 请求指标
  requests: {
    total: 0,
    success: 0,
    errors: 0,
    latency: []
  },
  
  // Token 消耗
  tokens: {
    input: 0,
    output: 0,
    total: 0,
    cost: 0
  },
  
  // 自定义指标
  custom: new Map()
};

// 记录请求
metrics.requests.total++;
metrics.tokens.input += response.usage.input_tokens;
metrics.tokens.output += response.usage.output_tokens;
```

### Prometheus 导出

```javascript
const prometheus = {
  format: (metrics) => {
    let output = '';
    for (const [key, value] of Object.entries(metrics)) {
      output += `agent_${key}{} ${value}\n`;
    }
    return output;
  }
};
```

## 日志管理

### 结构化日志

```javascript
const logger = {
  log: (level, message, meta = {}) => {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    };
    console.log(JSON.stringify(entry));
  },
  
  info: (msg, meta) => logger.log('info', msg, meta),
  error: (msg, meta) => logger.log('error', msg, meta),
  debug: (msg, meta) => logger.log('debug', msg, meta)
};
```

## 告警规则

```javascript
const alerts = {
  rules: [
    {
      name: 'high_error_rate',
      condition: metrics => metrics.errors / metrics.total > 0.1,
      severity: 'critical',
      action: 'notify_oncall'
    },
    {
      name: 'high_latency',
      condition: metrics => metrics.latency > 5000,
      severity: 'warning',
      action: 'notify_team'
    },
    {
      name: 'budget_exceeded',
      condition: metrics => metrics.cost > 100,
      severity: 'critical',
      action: 'pause_agent'
    }
  ]
};
```

---

*监控指南 v1.0*
