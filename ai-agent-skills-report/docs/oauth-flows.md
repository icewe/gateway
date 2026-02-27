# OAuth 流程详解

## 授权码流程

```
1. 用户 → 授权服务器 → 授权页面
2. 用户确认 → 授权服务器 → 回调+code
3. 前端 → 后端 → code换token
4. 后端 → API → 获取资源
```

## 令牌刷新

```javascript
const refreshToken = async (refreshToken) => {
  const response = await fetch('https://auth.example.com/token', {
    method: 'POST',
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });
  return response.json();
};
```

---

*OAuth 流程 v1.0*
