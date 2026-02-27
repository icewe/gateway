# 认证协议

## OAuth 2.0 授权类型

| 类型 | 用途 |
|------|------|
| Authorization Code | Web应用 |
| PKCE | 移动/SPA |
| Client Credentials | 机器间 |
| Device Code | TV/IoT |

## OIDC

基于 OAuth 2.0 的身份层

```javascript
// 验证 ID Token
const jwt = require('jsonwebtoken');

const verifyIdToken = async (idToken) => {
  const decoded = jwt.decode(idToken);
  // 验证签名、iss、aud、exp
  return decoded;
};
```

---

*认证协议 v1.0*
