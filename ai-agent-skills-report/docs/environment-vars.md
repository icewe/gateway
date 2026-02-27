# 环境变量最佳实践

## 原则

1. 不提交到 Git
2. 使用 .env.example 模板
3. 不同环境不同配置
4. 敏感信息加密

## 示例

```
# .env.example
DATABASE_URL=postgres://localhost:5432/db
API_KEY=
SECRET_KEY=
```

## 加载

```javascript
require('dotenv').config();

const apiKey = process.env.API_KEY;
```

---

*环境变量最佳实践 v1.0*
