# 边缘计算

## 概念

在网络边缘执行计算，减少延迟

## Cloudflare Workers

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  return new Response('Hello from edge!', {
    headers: { 'content-type': 'text/plain' }
  });
}
```

## 适用场景

- 实时视频处理
- IoT 数据处理
- CDN 动态内容
- 用户认证

---

*边缘计算 v1.0*
