# 缓存策略指南

## 缓存层级

```javascript
// L1: 内存缓存
const L1 = new Map();

// L2: Redis
const L2 = {
  async get(key) {
    return await redis.get(key);
  },
  async set(key, value, ttl) {
    await redis.setex(key, ttl, value);
  }
};

// 读取
const get = async (key) => {
  // L1
  if (L1.has(key)) return L1.get(key);
  
  // L2
  const value = await L2.get(key);
  if (value) {
    L1.set(key, value);
    return value;
  }
  
  // DB
  const dbValue = await db.get(key);
  await L2.set(key, dbValue, 3600);
  L1.set(key, dbValue);
  return dbValue;
};
```

## 缓存模式

```javascript
// Cache-Aside
const cacheAside = async (key, fn) => {
  let value = await L2.get(key);
  if (!value) {
    value = await fn();
    await L2.set(key, value, 3600);
  }
  return value;
};

// Write-Through
const writeThrough = async (key, fn) => {
  const value = await fn();
  await L2.set(key, value);
  return value;
};
```

## 缓存失效

```javascript
// 删除
const invalidate = async (key) => {
  L1.delete(key);
  await L2.del(key);
};

// 模式失效
const invalidatePattern = async (pattern) => {
  const keys = await redis.keys(pattern);
  await redis.del(...keys);
};
```

---

*缓存策略 v1.0*
