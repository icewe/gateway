# 消息签名的艺术

## HMAC

```javascript
const crypto = require('crypto');

const sign = (message, secret) => {
  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
};

const verify = (message, signature, secret) => {
  return sign(message, secret) === signature;
};
```

## JWT

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { userId: 1 },
  'secret',
  { expiresIn: '1h' }
);
```

---

*消息签名 v1.0*
