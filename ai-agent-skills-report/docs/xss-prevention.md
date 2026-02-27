# XSS 防护

## 类型

- 存储型: 恶意脚本存入数据库
- 反射型: URL 参数注入
- DOM型: 前端直接执行

## 防护

```javascript
// 转义
const escape = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

// CSP 头
res.setHeader('Content-Security-Policy', "script-src 'self'");
```

---

*XSS 防护 v1.0*
