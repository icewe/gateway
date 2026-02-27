# GraphQL vs REST

## 对比

| 特性 | REST | GraphQL |
|------|------|---------|
| 数据获取 | 多个端点 | 单次请求 |
| 灵活性 | 低 | 高 |
| 缓存 | 简单 | 需特殊处理 |
| 学习曲线 | 低 | 中 |

## GraphQL 查询

```graphql
query {
  user(id: "1") {
    name
    email
    posts {
      title
    }
  }
}
```

## REST  equivalent

```
GET /users/1
GET /users/1/posts
```

---

*GraphQL vs REST v1.0*
