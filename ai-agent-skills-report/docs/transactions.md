# 数据库事务

## ACID

- Atomic: 原子性
- Consistency: 一致性
- Isolation: 隔离性
- Durability: 持久性

## 使用

```javascript
// PostgreSQL
await db.transaction(async (trx) => {
  await trx('users').where({ id: 1 }).increment('balance', 100);
  await trx('transactions').insert({ ... });
});
```

## 隔离级别

```sql
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

---

*数据库事务 v1.0*
