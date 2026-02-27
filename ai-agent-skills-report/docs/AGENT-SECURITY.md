# AI Agent 安全实战指南

## 安全架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Input     │  │   Agent     │  │   Output    │       │
│  │  Validation│  │   Sandboxing│  │  Filtering │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   Rate      │  │   Access    │  │   Audit    │       │
│  │   Limiting  │  │   Control   │  │   Logging  │       │
│  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 输入安全

### 1. Prompt 注入防护

```typescript
class PromptGuard {
  constructor(config) {
    this.blockedPatterns = [
      /ignore.*previous.*instruction/i,
      /forget.*all.*rules/i,
      /system.*override/i,
      /\\(.*\\s*\\)/.source, // 嵌套指令
    ];
    
    this.suspiciousPatterns = [
      /\#\#\#.*instruction/i,
      /\/.*\//, // 角色扮演
      /you.*are.*now/i,
    ];
  }
  
  analyze(input) {
    const result = {
      blocked: false,
      suspicious: false,
      risk: 'low',
      reasons: []
    };
    
    // 检查阻断模式
    for (const pattern of this.blockedPatterns) {
      if (pattern.test(input)) {
        result.blocked = true;
        result.reasons.push(`Blocked pattern: ${pattern}`);
      }
    }
    
    // 检查可疑模式
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(input)) {
        result.suspicious = true;
        result.reasons.push(`Suspicious pattern: ${pattern}`);
      }
    }
    
    // 风险评估
    if (result.blocked) {
      result.risk = 'critical';
    } else if (result.suspicious) {
      result.risk = 'medium';
    }
    
    return result;
  }
  
  sanitize(input) {
    const analysis = this.analyze(input);
    
    if (analysis.blocked) {
      throw new Error('Input blocked due to security policy');
    }
    
    // 移除可疑内容
    let sanitized = input;
    for (const pattern of this.suspiciousPatterns) {
      sanitized = sanitized.replace(pattern, '[FILTERED]');
    }
    
    return sanitized;
  }
}
```

### 2. 数据验证

```typescript
class InputValidator {
  constructor() {
    this.schemas = {
      userQuery: {
        type: 'object',
        properties: {
          query: { 
            type: 'string',
            minLength: 1,
            maxLength: 10000,
            pattern: /^[^<>'"]+$/ // 防止 XSS
          },
          context: {
            type: 'object',
            maxProperties: 10
          },
          language: {
            type: 'string',
            enum: ['en', 'zh', 'ja', 'ko', 'es', 'fr']
          }
        },
        required: ['query']
      }
    };
  }
  
  validate(type, data) {
    const schema = this.schemas[type];
    if (!schema) {
      throw new Error(`Unknown validation type: ${type}`);
    }
    
    // 基础验证
    if (schema.type === 'object') {
      // 检查必填字段
      for (const field of schema.required || []) {
        if (!(field in data)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      // 检查字段类型和约束
      for (const [key, spec] of Object.entries(schema.properties)) {
        if (key in data) {
          this.validateField(key, data[key], spec);
        }
      }
    }
    
    return { valid: true };
  }
  
  validateField(name, value, spec) {
    if (spec.type === 'string') {
      if (typeof value !== 'string') {
        throw new Error(`${name} must be a string`);
      }
      
      if (spec.minLength && value.length < spec.minLength) {
        throw new Error(`${name} must be at least ${spec.minLength} characters`);
      }
      
      if (spec.maxLength && value.length > spec.maxLength) {
        throw new Error(`${name} must be at most ${spec.maxLength} characters`);
      }
      
      if (spec.pattern && !spec.pattern.test(value)) {
        throw new Error(`${name} contains invalid characters`);
      }
      
      if (spec.enum && !spec.enum.includes(value)) {
        throw new Error(`${name} must be one of: ${spec.enum.join(', ')}`);
      }
    }
  }
}
```

## Agent 沙箱

### 隔离执行

```typescript
class AgentSandbox {
  constructor(config) {
    this.timeout = config.timeout || 30000; // 30秒
    this.maxMemory = config.maxMemory || 512 * 1024 * 1024; // 512MB
    this.allowedModules = config.allowedModules || ['fs', 'path', 'crypto'];
  }
  
  async execute(agent, input) {
    // 1. 创建隔离环境
    const sandbox = this.createSandbox();
    
    // 2. 设置超时
    const timeout = setTimeout(() => {
      sandbox.terminate();
      throw new Error('Execution timeout');
    }, this.timeout);
    
    try {
      // 3. 执行
      const result = await sandbox.run(agent, input);
      return result;
    } finally {
      clearTimeout(timeout);
    }
  }
  
  createSandbox() {
    // 使用 VM2 或 Isolated-VM
    const vm = new VM({
      timeout: this.timeout,
      memoryLimit: this.maxMemory,
      sandbox: {
        // 受限的 API
        console: {
          log: (...args) => console.log('[sandbox]', ...args),
          error: (...args) => console.error('[sandbox]', ...args)
        },
        
        // 只读的文件系统
        readFile: (path) => {
          if (!this.isPathAllowed(path)) {
            throw new Error('Access denied');
          }
          return fs.readFileSync(path, 'utf-8');
        },
        
        // 禁止的网络请求
        fetch: (url) => {
          throw new Error('Network access denied in sandbox');
        }
      }
    });
    
    return vm;
  }
  
  isPathAllowed(path) {
    const allowedDirs = ['/tmp', '/app/sandbox'];
    return allowedDirs.some(dir => path.startsWith(dir));
  }
}
```

## 输出过滤

### 内容安全

```typescript
class OutputFilter {
  constructor() {
    this.filters = [
      // 个人身份信息
      new PIIFilter(),
      
      // 敏感词
      new SensitiveWordFilter(),
      
      // 代码安全
      new CodeSecurityFilter(),
      
      // 格式验证
      new FormatValidator()
    ];
  }
  
  async filter(output) {
    let result = output;
    
    for (const filter of this.filters) {
      result = await filter.process(result);
    }
    
    return result;
  }
}

class PIIFilter {
  patterns = [
    // 邮箱
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    
    // 手机号
    /1[3-9]\d{9}/g,
    
    // 身份证
    /[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]/g,
    
    // 银行卡
    /\b\d{16,19}\b/g
  ];
  
  process(text) {
    let result = text;
    
    for (const pattern of this.patterns) {
      result = result.replace(pattern, '[PII_REDACTED]');
    }
    
    return result;
  }
}
```

## 访问控制

### RBAC 实现

```typescript
class RBAC {
  constructor() {
    this.roles = {
      admin: {
        permissions: ['*'],
        inherits: []
      },
      user: {
        permissions: ['read', 'write:own'],
        inherits: []
      },
      guest: {
        permissions: ['read'],
        inherits: []
      }
    };
  }
  
  async checkPermission(user, resource, action) {
    const userRoles = await this.getUserRoles(user.id);
    
    for (const role of userRoles) {
      const roleConfig = this.roles[role];
      if (!roleConfig) continue;
      
      // 检查权限
      for (const perm of roleConfig.permissions) {
        if (this.matchPermission(perm, resource, action)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  matchPermission(permission, resource, action) {
    // * 匹配所有
    if (permission === '*') return true;
    
    // exact:resource:action
    const [permResource, permAction] = permission.split(':');
    
    if (permResource !== resource && permResource !== '*') {
      return false;
    }
    
    if (permAction !== action && permAction !== '*') {
      return false;
    }
    
    return true;
  }
}
```

## 审计日志

### 完整追踪

```typescript
class SecurityAudit {
  constructor(db, alertService) {
    this.db = db;
    this.alertService = alertService;
  }
  
  async log(event) {
    const entry = {
      timestamp: new Date(),
      eventType: event.type,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      resource: event.resource,
      action: event.action,
      result: event.result,
      risk: event.risk || 'low',
      metadata: event.metadata
    };
    
    // 存储
    await this.db.securityLogs.create(entry);
    
    // 高风险事件告警
    if (entry.risk === 'high' || entry.risk === 'critical') {
      await this.alertService.send({
        type: 'security_alert',
        severity: entry.risk,
        event: entry
      });
    }
  }
  
  // 安全报告
  async generateReport(startDate, endDate) {
    const events = await this.db.securityLogs.find({
      timestamp: { $gte: startDate, $lte: endDate }
    });
    
    return {
      summary: {
        totalEvents: events.length,
        blocked: events.filter(e => e.result === 'blocked').length,
        suspicious: events.filter(e => e.risk === 'high').length
      },
      byType: this.groupBy(events, 'eventType'),
      byUser: this.groupBy(events, 'userId'),
      byRisk: this.groupBy(events, 'risk')
    };
  }
}
```

---

*安全实战指南 v1.0*
