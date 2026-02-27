# AI Agent 法规与合规

## 数据隐私

### GDPR 合规

```javascript
// 数据处理原则
const gdpr = {
  // 合法性
  lawfulBasis: ['consent', 'contract', 'legal', 'vital', 'public', 'legitimate'],
  
  // 数据主体权利
  rights: {
    access: '用户可访问其数据',
    rectification: '用户可更正数据',
    erasure: '用户可删除数据',
    portability: '用户可导出数据',
    object: '用户可反对处理'
  },
  
  // 处理记录
  processingRecord: async (userId, activity) => {
    await db.processing_log.insert({
      user_id: userId,
      activity,
      timestamp: new Date(),
      purpose: 'agent_service'
    });
  }
};
```

### 数据脱敏

```javascript
const dataMasking = {
  // 脱敏规则
  rules: {
    email: (v) => v.replace(/(.{2}).*(@.*)/, '$1***$2'),
    phone: (v) => v.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
    idCard: (v) => v.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2')
  },
  
  // 自动脱敏
  mask: (data) => {
    return {
      ...data,
      email: data.email ? mask.email(data.email) : null,
      phone: data.phone ? mask.phone(data.phone) : null
    };
  }
};
```

## AI 法规

### 生成内容标识

```javascript
// AI 内容水印
const contentWatermark = {
  add: (content) => {
    return {
      ...content,
      metadata: {
        ...content.metadata,
        ai_generated: true,
        model: 'gpt-4',
        timestamp: new Date()
      }
    };
  },
  
  detect: (content) => {
    return content.metadata?.ai_generated === true;
  }
};
```

### 模型合规

```javascript
// 输出过滤
const contentFilter = {
  blocked: ['暴力', '色情', '仇恨'],
  
  filter: (text) => {
    const hasBlocked = blocked.some(word => text.includes(word));
    if (hasBlocked) {
      return { safe: false, reason: 'content_violation' };
    }
    return { safe: true };
  }
};
```

---

*合规指南 v1.0*
