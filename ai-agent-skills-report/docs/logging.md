# 日志收集与分析

## 结构化日志

```javascript
const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      ...meta
    }));
  },
  
  error: (message, error, meta = {}) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: {
        message: error.message,
        stack: error.stack
      },
      ...meta
    }));
  }
};
```

## 日志收集

```javascript
// 使用 Winston
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console()
  ]
});
```

## 日志分析

```bash
# 搜索错误
grep "error" logs/combined.log | jq

# 统计
cat logs/combined.log | jq -r '.level' | sort | uniq -c

# 实时监控
tail -f logs/combined.log | jq 'select(.level == "error")'
```

---

*日志收集 v1.0*
