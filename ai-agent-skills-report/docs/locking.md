# 乐观锁与悲观锁

## 乐观锁

```sql
-- 版本号
UPDATE users 
SET name = '新名字', version = version + 1 
WHERE id = 1 AND version = 5;

-- 失败则重试
if (affectedRows === 0) {
  // 重新获取并重试
}
```

## 悲观锁

```sql
SELECT * FROM users 
WHERE id = 1 
FOR UPDATE;
```

## 使用场景

| 锁类型 | 适用场景 |
|--------|---------|
| 乐观锁 | 冲突较少 |
| 悲观锁 | 冲突频繁 |

---

*锁机制 v1.0*
