# x402 路由与网关

## 1. 支付网关

```typescript
class PaymentGateway {
  private facilitators = new Map<string, Facilitator>();
  
  async route(payment: Payment): Promise<Facilitator> {
    // 选择最优 facilitator
    const candidates = Array.from(this.facilitators.values())
      .filter(f => f.isAvailable())
      .sort((a, b) => a.fee - b.fee);
    
    if (candidates.length === 0) {
      throw new Error('No available facilitator');
    }
    
    return candidates[0];
  }
}
```

## 2. 负载均衡

```typescript
class LoadBalancer {
  private backends: Backend[] = [];
  
  select(): Backend {
    // 最小连接数
    return this.backends
      .filter(b => b.isHealthy())
      .sort((a, b) => a.connections - b.connections)[0];
  }
}
```

## 3. 容错处理

```typescript
class CircuitBreaker {
  private failures = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      throw new Error('Circuit open');
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

---

*x402 路由与网关 v1.0*
