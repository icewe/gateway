# 加密算法指南

## 对称加密

```javascript
const crypto = require('crypto');

// AES
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
let encrypted = cipher.update('Hello', 'utf8', 'hex');
encrypted += cipher.final('hex');

const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
let decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');
```

## 非对称加密

```javascript
// RSA 密钥对生成
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// 签名
const sign = crypto.createSign('SHA256');
sign.update('data');
const signature = sign.sign(privateKey, 'hex');

// 验签
const verify = crypto.createVerify('SHA256');
verify.update('data');
console.log(verify.verify(publicKey, signature, 'hex'));
```

## 哈希

```javascript
const hash = crypto.createHash('sha256');
hash.update('Hello');
console.log(hash.digest('hex'));
```

---

*加密算法 v1.0*
