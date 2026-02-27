# OAuth 2.0 详解

## 授权码流程

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  用户   │────▶│  前端   │────▶│  授权服务器  │
└─────────┘     └─────────┘     └─────────┘
                               │
                               ▼
┌─────────┐     ┌─────────┐     ┌─────────┐
│  API    │◀────│  前端   │◀────│  授权服务器  │
└─────────┘     └─────────┘     └─────────┘
```

## 实现

```javascript
// 授权 URL
const getAuthUrl = (clientId, redirectUri, scope) => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope.join(' ')
  });
  return `https://auth.example.com/authorize?${params}`;
};

// 兑换令牌
const token = async (code, clientId, clientSecret) => {
  const response = await fetch('https://auth.example.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret
    })
  });
  return response.json();
};
```

## 刷新令牌

```javascript
const refreshToken = async (refreshToken, clientId, clientSecret) => {
  const response = await fetch('https://auth.example.com/token', {
    method: 'POST',
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    })
  });
  return response.json();
};
```

---

*OAuth 2.0 v1.0*
