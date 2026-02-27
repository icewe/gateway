# 数据库设计模式

## 用户表设计

```sql
-- 基础用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 用户配置
CREATE TABLE user_settings (
  user_id UUID REFERENCES users(id),
  key VARCHAR(100),
  value JSONB,
  PRIMARY KEY (user_id, key)
);

-- 用户属性(灵活扩展)
CREATE TABLE user_properties (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  prop_key VARCHAR(100) NOT NULL,
  prop_value TEXT,
  prop_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
  created_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_user_properties_user ON user_properties(user_id);
CREATE INDEX idx_user_properties_key ON user_properties(prop_key);
```

## NoSQL 设计

```javascript
// MongoDB 用户文档
{
  _id: ObjectId,
  email: "user@example.com",
  profile: {
    name: "张三",
    avatar: "url",
    bio: "个人简介"
  },
  settings: {
    theme: "dark",
    language: "zh-CN"
  },
  metadata: {
    source: "web",
    referrer: "google"
  },
  tags: ["vip", "developer"],
  stats: {
    loginCount: 100,
    lastLogin: ISODate("2024-01-15")
  }
}
```

---

*数据库设计 v1.0*
