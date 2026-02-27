# 帐户系统进阶设计

## 权限体系

### 角色继承

```javascript
const roles = {
  // 扁平角色
  flat: {
    admin: ['*'],
    moderator: ['users:read', 'users:write', 'content:moderate'],
    user: ['profile:read', 'profile:write:own'],
    guest: ['content:read']
  },
  
  // 继承角色
  hierarchical: {
    super_admin: { inherits: [], permissions: ['*'] },
    admin: { inherits: ['moderator'], permissions: ['users:*'] },
    moderator: { inherits: ['user'], permissions: ['content:moderate'] },
    user: { inherits: [], permissions: ['profile:*:own'] }
  }
};
```

### 资源权限

```javascript
// 细粒度权限
const resourcePermissions = {
  // 文档权限
  document: {
    owner: ['read', 'write', 'delete', 'share'],
    editor: ['read', 'write'],
    viewer: ['read'],
    public: []
  },
  
  // 订单权限
  order: {
    owner: ['read', 'cancel', 'refund'],
    support: ['read', 'update:status'],
    finance: ['read', 'refund']
  }
};
```

## 会员体系

### 等级设计

```javascript
const membership = {
  tiers: [
    { name: 'free', price: 0, features: ['basic'] },
    { name: 'pro', price: 9.99, features: ['basic', 'pro'] },
    { name: 'enterprise', price: 99.99, features: ['basic', 'pro', 'enterprise'] }
  ],
  
  // 升级规则
  upgradeRules: {
    points: 1000,  // 积分升级
    spending: 500, // 消费升级
    referral: 5    // 邀请升级
  }
};
```

### 积分系统

```javascript
const points = {
  // 积分规则
  earn: {
    login: 1,
    purchase: 1,  // 每元1分
    referral: 100,
    review: 10
  },
  
  // 积分兑换
  redeem: {
    discount_10: 100,
    discount_50: 500,
    gift: 1000
  }
};
```

## 数据导出

### 用户数据

```javascript
// GDPR 合规 - 数据导出
const exportUserData = async (userId) => {
  const data = {
    profile: await db.users.findById(userId),
    orders: await db.orders.find({ userId }),
    activities: await db.activities.find({ userId }),
    settings: await db.settings.find({ userId })
  };
  
  return {
    format: 'json',
    data,
    exportedAt: new Date()
  };
};
```

### 批量导出

```javascript
const bulkExport = async (format = 'csv') => {
  const users = await db.users.find();
  
  if (format === 'csv') {
    return toCSV(users);
  }
  if (format === 'json') {
    return JSON.stringify(users);
  }
};
```

## 审计追溯

### 变更日志

```javascript
const auditTrail = {
  // 记录所有: async (user变更
  logId, action, changes) => {
    await db.audit_logs.insert({
      user_id: userId,
      action,
      changes,
      ip: getClientIp(),
      user_agent: getUserAgent(),
      timestamp: new Date()
    });
  },
  
  // 查询变更历史
  getHistory: async (resourceType, resourceId) => {
    return await db.audit_logs
      .where('resource_type', resourceType)
      .where('resource_id', resourceId)
      .orderBy('timestamp', 'desc');
  }
};
```

---

*帐户进阶 v1.0*
