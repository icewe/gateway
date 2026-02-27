# 分布式系统设计模式

## 微服务架构

### 服务拆分

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│  用户   │  │  订单   │  │  支付   │
│ 服务    │  │  服务   │  │  服务   │
└────┬────┘  └────┬────┘  └────┬────┘
     │            │            │
     └────────────┼────────────┘
                  ▼
           ┌───────────┐
           │   API     │
           │   Gateway │
           └───────────┘
```

### 服务通信

```javascript
// HTTP 客户端
const httpClient = axios.create({
  baseURL: 'http://api.example.com',
  timeout: 5000
});

// 服务发现
const serviceDiscovery = {
  register: (service, url) => {
    consul.register(service, url);
  },
  resolve: async (service) => {
    const services = await consul.resolve(service);
    return services[Math.floor(Math.random() * services.length)];
  }
};
```

## 缓存策略

### 多级缓存

```javascript
const multiLevelCache = {
  // L1: 内存
  local: new Map(),
  
  // L2: Redis
  redis: redisClient,
  
  async get(key) {
    // 先查本地
    if (this.local.has(key)) {
      return this.local.get(key);
    }
    // 再查 Redis
    const value = await this.redis.get(key);
    if (value) {
      this.local.set(key, value);
    }
    return value;
  }
};
```

---

*分布式系统 v1.0*
