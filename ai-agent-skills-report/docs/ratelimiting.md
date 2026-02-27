# 限流策略

## 算法

```javascript
// 固定窗口
const fixedWindow = (key, limit, window) => {
  const now = Date.now();
  const windowStart = Math.floor(now / window) * window;
  const current = cache.get(`${key}:${windowStart}`) || 0;
  
  if (current >= limit) {
    throw new Error('Rate limit exceeded');
  }
  
  cache.set(`${key}:${windowStart}`, current + 1);
};

// 滑动窗口
const slidingWindow = (key, limit, window) => {
  const now = Date.now();
  const requests = cache.get(key) || [];
  const valid = requests.filter(t => now - t < window);
  
  if (valid.length >= limit) {
    throw new Error('Rate limit exceeded');
  }
  
  valid.push(now);
  cache.set(key, valid);
};

// 令牌桶
const tokenBucket = (key, capacity, refillRate) => {
  let { tokens, lastRefill } = cache.get(key) || { 
    tokens: capacity, 
    lastRefill: Date.now() 
  };
  
  const now = Date.now();
  const elapsed = now - lastRefill;
  tokens = Math.min(capacity, tokens + elapsed * refillRate / 1000);
  
  if (tokens < 1) {
    throw new Error('Rate limit exceeded');
  }
  
  tokens -= 1;
  cache.set(key, { tokens, lastRefill: now });
};
```

## 使用

```javascript
const rateLimit = (options) => {
  return (req, res, next) => {
    try {
      slidingWindow(req.ip, options.limit, options.window);
      next();
    } catch (e) {
      res.status(429).json({ error: 'Too many requests' });
    }
  };
};

app.use(rateLimit({ limit: 100, window: 60000 }));
```

---

*限流策略 v1.0*
