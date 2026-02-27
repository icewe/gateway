# CDN 安全

## DDoS 防护

- 流量清洗
- 速率限制
- 地理封锁

## WAF

```javascript
// Cloudflare Worker
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // 检查恶意请求
  if (request.headers.get('block')) {
    return new Response('Blocked', { status: 403 });
  }
  return fetch(request);
}
```

---

*CDN 安全 v1.0*
