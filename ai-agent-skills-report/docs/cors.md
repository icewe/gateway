# CORS 配置

## 基础配置

```javascript
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://example.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
```

## 预检请求

```javascript
app.options('*', (req, res) => {
  res.status(204).end();
});
```

## 生产环境

```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(',')
}));
```

---

*CORS 配置 v1.0*
