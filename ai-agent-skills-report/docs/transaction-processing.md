# 事务处理

## ACID

- Atomic: 原子性
- Consistency: 一致性
- Isolation: 隔离性
- Durability: 持久性

## 分布式事务

### 两阶段提交

```
1. 准备阶段
2. 提交阶段
```

### Saga 模式

```
服务A → 服务B → 服务C
  ↓        ↓       ↓
补偿A   补偿B   补偿C
```

---

*事务处理 v1.0*
