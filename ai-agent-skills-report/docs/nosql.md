# NoSQL 数据库对比

## 类型

- **文档**: MongoDB, CouchDB
- **键值**: Redis, DynamoDB
- **列式**: Cassandra, HBase
- **图**: Neo4j

## MongoDB

```javascript
// 查询
db.users.find({ age: { $gt: 18 } });

// 聚合
db.orders.aggregate([
  { $group: { _id: "$product", total: { $sum: "$price" } } }
]);
```

## Redis

```javascript
// 字符串
redis.set('key', 'value');
redis.get('key');

// 哈希
redis.hset('user:1', 'name', 'Tom');
redis.hget('user:1', 'name');

// 列表
redis.lpush('queue', 'task1');
redis.rpop('queue');
```

---

*NoSQL 数据库 v1.0*
