# JWT 详解

## 结构

```
header.payload.signature
```

## 示例

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: 1, role: 'admin' },
  'secret-key',
  { expiresIn: '7d' }
);

const decoded = jwt.verify(token, 'secret-key');
```

## 常用选项

```javascript
{ 
  expiresIn: '1h',  // 1小时
  issuer: 'my-app',  // 发行者
  audience: 'api'   // 受众
}
```

---

*JWT 详解 v1.0*
