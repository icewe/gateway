# 错误处理模式

## 全局错误处理

```javascript
// Express
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      code: err.code
    }
  });
});
```

## 异步错误

```javascript
// Promise 包装
const to = (promise) => 
  promise
    .then(data => [null, data])
    .catch(err => [err, null]);

// 使用
const [err, user] = await to(getUser(id));
if (err) {
  return handleError(err);
}
```

## 自定义错误

```javascript
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

throw new AppError('Not found', 404, 'NOT_FOUND');
```

---

*错误处理 v1.0*
