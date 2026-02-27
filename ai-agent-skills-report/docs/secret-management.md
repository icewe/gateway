# 密钥管理

## KMS

```javascript
// AWS KMS
const AWS = require('aws-sdk');
const kms = new AWS.KMS();

const encrypt = async (plaintext) => {
  const params = {
    KeyId: 'alias/my-key',
    Plaintext: plaintext
  };
  return kms.encrypt(params).promise();
};
```

## 最佳实践

1. 永不提交密钥到 Git
2. 使用密钥管理服务
3. 定期轮换
4. 最小权限

---

*密钥管理 v1.0*
