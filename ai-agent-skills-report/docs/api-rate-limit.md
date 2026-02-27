# API 限流

## 令牌桶

```javascript
const rateLimit = {
  tokens: 100,
  refillRate: 10, // 每秒
  
  consume: function(n = 1) {
    this.tokens = Math.min(100, this.tokens + this.refillRate);
    if (this.tokens >= n) {
      this.tokens -= n;
      return true;
    }
    return false;
  }
};
```

## 分布式限流

```javascript
// Redis 计数器
const incr = await redis.incr('rate:user:1');
if (incr > 100) return 429;
```

---

*API 限流 v1.0*
