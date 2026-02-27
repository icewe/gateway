# 事件溯源

## 概念

存储业务事件而非状态

## 示例

```javascript
const events = [
  { type: 'ORDER_CREATED', data: { id: 1, amount: 100 } },
  { type: 'PAYMENT_RECEIVED', data: { orderId: 1, amount: 100 } },
  { type: 'ORDER_SHIPPED', data: { orderId: 1 } }
];

const getState = (events) => {
  return events.reduce((state, event) => {
    switch (event.type) {
      case 'ORDER_CREATED': return { ...state, order: event.data };
      case 'PAYMENT_RECEIVED': return { ...state, paid: true };
    }
  }, {});
};
```

## 优势

- 完整审计日志
- 时间旅行
- 事件重放

---

*事件溯源 v1.0*
