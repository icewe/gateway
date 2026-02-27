# 认证与安全最佳实践

## 密码处理

```javascript
// 密码哈希
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
```

## JWT

```javascript
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
```

## CSRF 防护

```javascript
// CSRF Token
const csrf = require('csurf');
app.use(csrf({ cookie: true }));

// 验证
const csrfProtection = csrf({ cookie: true });

app.post('/api', csrfProtection, (req, res) => {
  res.json({ token: req.csrfToken() });
});
```

---

*认证安全 v1.0*
