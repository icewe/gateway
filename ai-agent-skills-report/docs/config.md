# 环境配置管理

## .env 文件

```
# 开发
NODE_ENV=development
DATABASE_URL=postgres://localhost:5432/dev
REDIS_URL=redis://localhost:6379

# 生产
DATABASE_URL=postgres://prod:5432/prod
REDIS_URL=redis://prod:6379
API_KEY=sk-xxx
```

## 配置加载

```javascript
// 开发环境
import dotenv from 'dotenv';
dotenv.config();

// 生产环境 (从环境变量)
const config = {
  db: {
    url: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 }
  },
  redis: {
    url: process.env.REDIS_URL
  }
};
```

## 多环境

```javascript
const env = process.env.NODE_ENV || 'development';

const configs = {
  development: { /* ... */ },
  staging: { /* ... */ },
  production: { /* ... */ }
};

export default configs[env];
```

---

*环境配置 v1.0*
