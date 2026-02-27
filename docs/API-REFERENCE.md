# x402 API 参考

## 端点

### 创建支付
```
POST /api/v1/payments
```

### 查询支付
```
GET /api/v1/payments/:id
```

### 验证支付
```
POST /api/v1/verify
```

### 结算
```
POST /api/v1/settle
```

## 错误码

| 码 | 描述 |
|----|------|
| 400 | 参数错误 |
| 402 | 需要支付 |
| 403 | 禁止访问 |
| 500 | 服务器错误 |

---

*x402 API 参考 v1.0*
