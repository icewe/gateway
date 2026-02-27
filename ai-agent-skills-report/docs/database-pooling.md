# 数据库连接池

## 原理

```
请求 → 连接池 → 数据库
      ↑________|
      (复用)
```

## Node.js

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000
});

const result = await pool.query('SELECT * FROM users');
```

## 配置

| 参数 | 说明 |
|------|------|
| max | 最大连接数 |
| idleTimeoutMillis | 空闲超时 |
| connectionTimeoutMillis | 连接超时 |

---

*数据库连接池 v1.0*
