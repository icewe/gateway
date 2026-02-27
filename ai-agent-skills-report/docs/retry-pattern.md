# 重试模式

## 策略

- 立即重试
- 固定延迟
- 指数退避

## 实现

```javascript
const retry = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
};
```

## 注意事项

- 幂等性
- 最大重试次数
- 区分可重试错误

---

*重试模式 v1.0*
