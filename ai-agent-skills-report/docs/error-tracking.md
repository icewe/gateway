# 错误追踪

## Sentry

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx'
});

try {
  // code
} catch (e) {
  Sentry.captureException(e);
}
```

## 功能

- 堆栈跟踪
- 环境信息
- 用户上下文
- Releases 追踪

---

*错误追踪 v1.0*
