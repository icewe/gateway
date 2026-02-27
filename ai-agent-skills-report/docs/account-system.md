# 帐户系统低成本实现方案

## 核心思路

**目标**：降低开发和运维成本

**策略**：
1. 使用托管服务减少自研
2. 利用开源方案减少自建
3. 设计简化，减少复杂度

## 技术选型

### 方案对比

| 方案 | 开发成本 | 运维成本 | 适用规模 |
|------|----------|----------|----------|
| 自研 | 高 | 高 | 大型 |
| SaaS (Auth0/Clerk) | 低 | 低 | 任何 |
| 开源 (Keycloak) | 中 | 中 | 中大型 |
| BaaS (Supabase/Firebase) | 低 | 低 | 任何 |

### 推荐：BaaS 方案

**Supabase Auth** 或 **Firebase Auth**

```javascript
// Supabase 示例
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xxx.supabase.co',
  'public-anon-key'
)

// 注册
const { user, session } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// 登录
const { user, session } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// 第三方登录
const { user, session } = await supabase.auth.signInWithOAuth({
  provider: 'github'
})
```

## 存储设计

### 用户属性

```sql
-- 基础表 (Supabase/Firebase 管理)
users (
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP
)

-- 扩展属性 (自己管理)
user_profiles (
  user_id UUID PRIMARY KEY,
  nickname TEXT,
  avatar_url TEXT,
  properties JSONB,  -- 灵活属性
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 灵活属性设计

```javascript
// 使用 JSONB 存储任意属性
const updateUserProperties = async (userId, properties) => {
  await db.user_profiles.update({
    properties: db.raw('properties || ?', [JSON.stringify(properties)])
  }).where('user_id', userId)
}

// 示例属性
const user = {
  id: 'xxx',
  properties: {
    phone: '13800138000',
    address: '北京',
    preferences: { theme: 'dark', language: 'zh-CN' },
    tags: ['vip', 'developer'],
    custom_fields: {
      company: '某公司',
      department: '技术部'
    }
  }
}
```

## 多属性类型

### 支持的属性类型

| 类型 | 存储方式 | 查询支持 |
|------|----------|----------|
| 字符串 | VARCHAR/TEXT | 全文搜索 |
| 数字 | INTEGER/FLOAT | 范围查询 |
| 布尔 | BOOLEAN | 精确匹配 |
| 日期 | TIMESTAMP | 范围查询 |
| JSON | JSONB | 路径查询 |
| 数组 | ARRAY/JSONB | 包含查询 |
| 文件 | 对象存储 | 下载链接 |

### 示例：复杂属性

```javascript
// 用户画像
const profile = {
  // 基础信息
  name: '张三',
  email: 'zhangsan@example.com',
  
  // 数值属性
  age: 28,
  balance: 1000.00,
  points: 5000,
  
  // 标签 (数组)
  tags: ['vip', 'developer', 'beta'],
  
  // 偏好设置 (嵌套JSON)
  preferences: {
    notifications: { email: true, sms: false },
    privacy: { profile_visible: true }
  },
  
  // 时间
  created_at: '2024-01-01',
  last_login: '2024-01-15',
  
  // 扩展数据
  metadata: {
    source: 'ios',
    campaign: 'spring_promo'
  }
}
```

## 低成本运维

### 自动扩展

```yaml
# 使用 Supabase
# 免费层: 50K MAU, 1GB 数据库
# Pro 层: $25/月, 100K MAU
```

### 监控告警

```javascript
// 简单监控
const monitor = {
  async checkHealth() {
    const response = await fetch('https://xxx.supabase.co/rest/v1/');
    return response.ok;
  }
};

// 错误追踪
const errorHandler = (err, req) => {
  console.error({
    error: err.message,
    stack: err.stack,
    userId: req.user?.id,
    timestamp: new Date()
  });
};
```

---

*帐户系统方案 v1.0*
