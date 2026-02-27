# 函数计算

## Serverless

- 无需管理服务器
- 按需付费
- 自动扩展

## AWS Lambda

```javascript
exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello' })
  };
  return response;
};
```

## 触发器

- HTTP (API Gateway)
- 定时 (CloudWatch)
- 文件 (S3)
- 消息 (SQS)

---

*函数计算 v1.0*
