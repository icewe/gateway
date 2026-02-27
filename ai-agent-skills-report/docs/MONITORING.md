# AI Agent 监控与可观测性完全指南

## 监控架构

```
┌─────────────────────────────────────────────────────────────┐
│                  Observability Stack                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐                  │
│  │ Metrics │   │  Logs   │   │ Traces  │                  │
│  │Prometheus│  │   ELK   │   │ Jaeger  │                  │
│  └────┬────┘   └────┬────┘   └────┬────┘                  │
│       │             │             │                         │
│       └─────────────┼─────────────┘                         │
│                     ▼                                       │
│              ┌─────────────┐                               │
│              │  Dashboard  │                               │
│              │  Grafana    │                               │
│              └─────────────┘                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 核心指标

### 1. Agent 特定指标

```typescript
class AgentMetrics {
  constructor(registry) {
    this.registry = registry;
    
    // 请求指标
    this.requestsTotal = new Counter({
      name: 'agent_requests_total',
      help: 'Total number of agent requests',
      labelNames: ['agent', 'status', 'type']
    });
    
    this.requestDuration = new Histogram({
      name: 'agent_request_duration_seconds',
      help: 'Request duration in seconds',
      labelNames: ['agent', 'operation'],
      buckets: [0.1, 0.5, 1, 2, 5, 10, 30]
    });
    
    // Token 消耗
    this.tokensUsed = new Counter({
      name: 'agent_tokens_used_total',
      help: 'Total tokens used',
      labelNames: ['agent', 'model', 'type'], // type: input/output
      buckets: [100, 500, 1000, 5000, 10000]
    });
    
    // 工具使用
    this.toolCalls = new Counter({
      name: 'agent_tool_calls_total',
      help: 'Total tool calls',
      labelNames: ['agent', 'tool', 'status']
    });
    
    // 错误
    this.errors = new Counter({
      name: 'agent_errors_total',
      help: 'Total errors',
      labelNames: ['agent', 'error_type', 'severity']
    });
    
    // 活跃会话
    this.activeSessions = new Gauge({
      name: 'agent_active_sessions',
      help: 'Number of active sessions'
    });
  }
  
  // 记录请求
  recordRequest(agent, type, status, duration) {
    this.requestsTotal.inc({ agent, type, status });
    this.requestDuration.observe({ agent, operation: type }, duration);
  }
  
  // 记录 token
  recordTokens(agent, model, type, count) {
    this.tokensUsed.inc({ agent, model, type }, count);
  }
  
  // 记录工具调用
  recordToolCall(agent, tool, status) {
    this.toolCalls.inc({ agent, tool, status });
  }
  
  // 记录错误
  recordError(agent, errorType, severity) {
    this.errors.inc({ agent, errorType, severity });
  }
}
```

### 2. 业务指标

```typescript
class BusinessMetrics {
  constructor() {
    // 任务完成率
    this.taskCompletionRate = new Gauge({
      name: 'agent_task_completion_rate',
      help: 'Task completion rate',
      labelNames: ['agent', 'task_type']
    });
    
    // 用户满意度
    this.userSatisfaction = new Histogram({
      name: 'agent_user_satisfaction',
      help: 'User satisfaction score',
      labelNames: ['agent'],
      buckets: [1, 2, 3, 4, 5]
    });
    
    // 成本
    this.costPerRequest = new Histogram({
      name: 'agent_cost_per_request',
      help: 'Cost per request in USD',
      labelNames: ['agent', 'task_type'],
      buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1]
    });
    
    // 响应质量分数
    this.qualityScore = new Gauge({
      name: 'agent_quality_score',
      help: 'Response quality score',
      labelNames: ['agent', 'dimension'] // accuracy, relevance, helpfulness
    });
  }
  
  // 记录任务完成
  recordTaskCompletion(agent, taskType, success) {
    // 使用 Gauge 的 set 方法需要追踪完成数
    // 这里简化处理
    this.taskCompletionRate.set({ agent, taskType }, success ? 1 : 0);
  }
  
  // 记录用户评分
  recordSatisfaction(agent, score) {
    this.userSatisfaction.observe({ agent }, score);
  }
  
  // 记录成本
  recordCost(agent, taskType, cost) {
    this.costPerRequest.observe({ agent, taskType }, cost);
  }
}
```

## 日志系统

### 1. 结构化日志

```typescript
class AgentLogger {
  constructor(service) {
    this.service = service;
  }
  
  // 请求日志
  logRequest(request) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      type: 'agent_request',
      traceId: request.traceId,
      spanId: request.spanId,
      agent: request.agent,
      input: {
        type: request.type,
        tokens: request.inputTokens,
        hasContext: !!request.context
      },
      user: {
        id: request.userId,
        sessionId: request.sessionId
      }
    }));
  }
  
  // 工具调用日志
  logToolCall(toolCall) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      type: 'tool_call',
      traceId: toolCall.traceId,
      tool: {
        name: toolCall.name,
        input: this.sanitize(toolCall.input),
        duration: toolCall.duration,
        status: toolCall.status
      }
    }));
  }
  
  // 错误日志
  logError(error) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      type: 'agent_error',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context: error.context
    }));
  }
  
  sanitize(data) {
    // 移除敏感信息
    const sensitive = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...data };
    
    for (const key of Object.keys(sanitized)) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
}
```

### 2. 日志级别策略

```typescript
const LogLevel = {
  DEBUG: 0,  // 详细调试信息
  INFO: 1,   // 一般信息
  WARN: 2,   // 警告
  ERROR: 3,   // 错误
  FATAL: 4    // 致命错误
};

class AdaptiveLogger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO';
  }
  
  shouldLog(level) {
    return level >= LogLevel[this.level];
  }
  
  debug(message, meta) {
    if (this.shouldLog('DEBUG')) {
      this.log('DEBUG', message, meta);
    }
  }
  
  info(message, meta) {
    if (this.shouldLog('INFO')) {
      this.log('INFO', message, meta);
    }
  }
  
  error(message, meta) {
    if (this.shouldLog('ERROR')) {
      this.log('ERROR', message, meta);
    }
  }
  
  log(level, message, meta) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service: 'agent',
      message,
      ...meta
    };
    
    console.log(JSON.stringify(entry));
  }
}
```

## 分布式追踪

### 1. Agent 追踪

```typescript
class AgentTracer {
  constructor(exporter) {
    this.exporter = exporter;
    this.activeSpans = new Map();
  }
  
  // 开始追踪
  startSpan(name, options = {}) {
    const span = {
      id: this.generateId(),
      name,
      parentId: options.parentId,
      traceId: options.traceId || this.generateId(),
      startTime: Date.now(),
      attributes: options.attributes || {},
      events: []
    };
    
    this.activeSpans.set(span.id, span);
    
    return span;
  }
  
  // 结束追踪
  endSpan(spanId, options = {}) {
    const span = this.activeSpans.get(spanId);
    if (!span) return;
    
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = options.status || 'ok';
    
    if (options.error) {
      span.status = 'error';
      span.events.push({
        name: 'error',
        timestamp: Date.now(),
        attributes: { error: options.error.message }
      });
    }
    
    // 导出
    this.exporter.export(span);
    
    this.activeSpans.delete(spanId);
    
    return span;
  }
  
  // 添加事件
  addEvent(spanId, eventName, attributes = {}) {
    const span = this.activeSpans.get(spanId);
    if (!span) return;
    
    span.events.push({
      name: eventName,
      timestamp: Date.now(),
      attributes
    });
  }
  
  generateId() {
    return Math.random().toString(36).substring(2, 15);
  }
}
```

### 2. 使用示例

```typescript
const tracer = new AgentTracer(new JaegerExporter());

async function handleRequest(req) {
  // 开始追踪
  const span = tracer.startSpan('agent.request', {
    attributes: {
      userId: req.userId,
      requestType: req.type
    }
  });
  
  try {
    // 分解任务
    tracer.addEvent(span.id, 'task_decomposition');
    const steps = await decomposeTask(req.task);
    
    // 执行步骤
    for (const step of steps) {
      const stepSpan = tracer.startSpan('agent.step', {
        parentId: span.id,
        attributes: { step: step.type }
      });
      
      const result = await executeStep(step);
      
      tracer.endSpan(stepSpan.id, { status: 'ok' });
    }
    
    tracer.endSpan(span.id, { status: 'ok' });
    
    return result;
  } catch (error) {
    tracer.endSpan(span.id, { 
      status: 'error', 
      error 
    });
    throw error;
  }
}
```

## 告警系统

### 1. 告警规则

```typescript
class AlertManager {
  constructor(notifier) {
    this.notifier = notifier;
    this.rules = [];
    this.activeAlerts = new Map();
  }
  
  // 添加规则
  addRule(rule) {
    this.rules.push(rule);
  }
  
  // 检查指标
  async check(metrics) {
    for (const rule of this.rules) {
      const value = this.getMetricValue(metrics, rule.metric);
      
      if (this.evaluateCondition(value, rule.condition)) {
        await this.triggerAlert(rule, value);
      } else {
        await this.resolveAlert(rule);
      }
    }
  }
  
  async triggerAlert(rule, value) {
    // 检查是否已存在
    if (this.activeAlerts.has(rule.name)) {
      // 更新
      const alert = this.activeAlerts.get(rule.name);
      alert.value = value;
      alert.updatedAt = Date.now();
      return;
    }
    
    // 新告警
    const alert = {
      name: rule.name,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      severity: rule.severity,
      firedAt: Date.now(),
      status: 'firing'
    };
    
    this.activeAlerts.set(rule.name, alert);
    
    // 发送通知
    await this.notifier.send(alert);
  }
  
  // 预定义规则
  static defaultRules() {
    return [
      {
        name: 'high_error_rate',
        metric: 'agent_errors_total / agent_requests_total',
        condition: (value) => value > 0.1,
        threshold: 0.1,
        severity: 'critical'
      },
      {
        name: 'high_latency',
        metric: 'p95(agent_request_duration_seconds)',
        condition: (value) => value > 10,
        threshold: 10,
        severity: 'warning'
      },
      {
        name: 'low_success_rate',
        metric: 'agent_task_completion_rate',
        condition: (value) => value < 0.8,
        threshold: 0.8,
        severity: 'warning'
      },
      {
        name: 'high_cost',
        metric: 'agent_cost_per_request',
        condition: (value) => value > 1,
        threshold: 1,
        severity: 'info'
      }
    ];
  }
}
```

---

*监控与可观测性指南 v1.0*
