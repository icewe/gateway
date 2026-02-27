# Webhook 指南

## 接收 Webhook

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
  const event = req.headers['x-github-event'];
  
  switch (event) {
    case 'push':
      console.log('Code pushed!');
      break;
    case 'pull_request':
      console.log('PR created!');
      break;
  }
  
  res.status(200).send('OK');
});
```

## 签名验证

```javascript
const crypto = require('crypto');

const verifySignature = (payload, signature, secret) => {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
};
```

---

*Webhook v1.0*
