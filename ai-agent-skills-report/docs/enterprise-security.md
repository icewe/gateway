# 企业级 AI Agent 安全指南

## 安全架构

```
┌─────────────────────────────────────────────┐
│                 安全层                         │
├─────────────────────────────────────────────┤
│ 身份验证 → 授权 → 审计 → 加密 → 监控          │
└─────────────────────────────────────────────┘
```

## 身份认证

### API Key 管理

```javascript
// 安全存储
const keyVault = {
  async getKey(service) {
    return await vault.get(`api-keys/${service}`);
  }
};

// 密钥轮换
const keyRotation = {
  rotate: async (service) => {
    const newKey = await generateKey();
    await vault.set(`api-keys/${service}`, newKey);
    await notifyService(service, newKey);
  }
};
```

### OAuth 2.0

```javascript
const oauth = {
  // 授权码流程
  async authorize(clientId, redirectUri, scope) {
    const state = generateState();
    const url = `https://auth.example.com/authorize?` +
      `client_id=${clientId}&redirect_uri=${redirectUri}` +
      `&scope=${scope}&state=${state}`;
    return { url, state };
  },
  
  // 获取令牌
  async token(code, clientId, clientSecret) {
    const response = await fetch('https://auth.example.com/token', {
      method: 'POST',
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code, client_id: clientId, client_secret: clientSecret
      })
    });
    return response.json();
  }
};
```

## 数据加密

### 传输加密

```javascript
// HTTPS 强制
const enforceHTTPS = (app) => {
  app.use((req, res, next) => {
    if (!req.secure) {
      return res.redirect(`https://${req.hostname}${req.url}`);
    }
    next();
  });
};
```

### 静态加密

```javascript
// 敏感数据加密存储
const encryptData = (data, key) => {
  const cipher = crypto.createCipher('aes-256-gcm', key);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return { encrypted, authTag };
};
```

## 访问控制

### RBAC

```javascript
const rbac = {
  roles: {
    admin: ['*'],
    user: ['read', 'write:own'],
    guest: ['read']
  },
  
  async checkPermission(role, action, resource) {
    const permissions = this.roles[role] || [];
    return permissions.includes('*') || 
           permissions.includes(action) ||
           permissions.includes(`${action}:${resource.owner}`);
  }
};
```

## 审计日志

```javascript
const auditLog = async (userId, action, details) => {
  await db.auditLogs.insert({
    userId,
    action,
    details,
    ip: req.ip,
    timestamp: new Date()
  });
};
```

---

*企业安全 v1.0*
