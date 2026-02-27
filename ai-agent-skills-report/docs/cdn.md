# CDN 配置指南

## 常见 CDN

- CloudFlare
- AWS CloudFront
-阿里云 CDN
- 腾讯云 CDN

## 缓存策略

```javascript
// 响应头设置
res.setHeader('Cache-Control', 'public, max-age=31536000');
res.setHeader('ETag', 'abc123');

// 静态资源
Cache-Control: public, max-age=31536000, immutable

// API 响应
Cache-Control: no-cache
```

## 刷新缓存

```bash
# CloudFlare API
curl -X POST "https://api.cloudflare.com/client/v4/zones/{id}/purge_cache" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  --data '{"files": ["https://example.com/style.css"]}'
```

---

*CDN 配置 v1.0*
