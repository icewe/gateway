# x402 错误码与处理

## HTTP 状态码

| 状态码 | 说明 | 处理方式 |
|--------|------|----------|
| 200 | 成功 | 处理响应 |
| 402 | 需要支付 | 完成支付后重试 |
| 401 | 未授权 | 检查认证 |
| 403 | 禁止访问 | 检查权限 |
| 404 | 未找到 | 检查 URL |
| 429 | 请求过多 | 限流等待 |
| 500 | 服务器错误 | 重试 |

## x402 特定错误

### 错误格式

```json
{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Wallet balance too low",
    "details": {
      "required": "0.001",
      "available": "0.0005"
    }
  }
}
```

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| INSUFFICIENT_BALANCE | 余额不足 | 充值 |
| INVALID_SIGNATURE | 签名无效 | 检查私钥 |
| PAYMENT_EXPIRED | 支付过期 | 重新发起 |
| NETWORK_MISMATCH | 网络不匹配 | 检查 chainId |
| INVALID_ADDRESS | 地址无效 | 检查地址格式 |

## 代码示例

### 错误处理

```javascript
async function payWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    
    if (response.status === 200) {
      return response;
    }
    
    if (response.status === 402) {
      // 需要支付
      const instructions = parse402Response(response);
      await makePayment(instructions);
      continue;
    }
    
    if (response.status === 429) {
      // 限流
      const retryAfter = response.headers.get('Retry-After');
      await sleep(retryAfter * 1000);
      continue;
    }
    
    throw new Error(`HTTP ${response.status}`);
  }
}
```

---

*错误处理 v1.0*
