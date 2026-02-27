# 断路器模式

## 概念

防止级联故障

## 状态

```
Closed (正常) → Open (熔断) → Half-Open (尝试)
```

## 实现

```javascript
class CircuitBreaker {
  constructor(threshold, timeout) {
    this.state = 'CLOSED';
    this.failures = 0;
  }
  
  call(fn) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit open');
    }
    try {
      const result = fn();
      this.reset();
      return result;
    } catch (e) {
      this.recordFailure();
      throw e;
    }
  }
}
```

---

*断路器模式 v1.0*
