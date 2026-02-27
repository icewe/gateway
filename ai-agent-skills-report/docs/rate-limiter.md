# 速率限制器

## 令牌桶

```javascript
class TokenBucket {
  constructor(rate, capacity) {
    this.rate = rate;
    this.capacity = capacity;
    this.tokens = capacity;
  }
  
  allow() {
    this.tokens = Math.min(this.capacity, this.tokens + this.rate);
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}
```

## 滑动窗口

更精确的限流

---

*速率限制器 v1.0*
