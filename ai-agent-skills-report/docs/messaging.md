# 消息队列指南

## 使用场景

```javascript
// 异步任务
const queue = {
  // 添加任务
  async add(job, data) {
    return await redis.lpush('queue:' + job, JSON.stringify(data));
  },
  
  // 消费任务
  async consume(job, handler) {
    while (true) {
      const data = await redis.brpop('queue:' + job);
      if (data) {
        await handler(JSON.parse(data));
      }
    }
  }
};
```

## 任务模式

```javascript
// 重试机制
const withRetry = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
};

// 延迟任务
const schedule = async (job, delay, data) => {
  const executeAt = Date.now() + delay;
  await redis.zadd('scheduled', executeAt, JSON.stringify({ job, data }));
};
```

## 消息确认

```javascript
// 消费者
const consume = async (msg) => {
  try {
    await process(msg);
    await ack(msg.id);
  } catch (e) {
    await nack(msg.id, true); // 重新入队
  }
};
```

---

*消息队列 v1.0*
