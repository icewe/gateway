# SQL 注入防护

## 问题

```sql
-- 危险
SELECT * FROM users WHERE id = '1 OR 1=1'
```

## 解决方案

```javascript
// 参数化查询
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);

// ORM
const user = await User.findById(userId);
```

## 验证

```javascript
const schema = {
  userId: Joi.number().integer().positive()
};
```

---

*SQL 注入防护 v1.0*
