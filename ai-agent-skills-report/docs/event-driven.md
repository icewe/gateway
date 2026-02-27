# 事件驱动架构

## 事件类型

```javascript
// 事件定义
const events = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  ORDER_PLACED: 'order.placed',
  PAYMENT_COMPLETED: 'payment.completed'
};

// 事件总线
class EventBus {
  constructor() {
    this.listeners = new Map();
  }
  
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }
  
  emit(event, data) {
    const handlers = this.listeners.get(event) || [];
    handlers.forEach(h => h(data));
  }
}
```

## 使用示例

```javascript
const bus = new EventBus();

bus.on('user.created', async (user) => {
  await sendWelcomeEmail(user.email);
  await createUserProfile(user.id);
});

bus.emit('user.created', { id: 1, email: 'test@example.com' });
```

---

*事件驱动 v1.0*
