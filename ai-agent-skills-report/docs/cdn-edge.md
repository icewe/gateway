# CDN 加速

## 适用资源

- 静态文件 (JS, CSS, 图片)
- 下载文件
- 视频流

## 边缘计算

```javascript
// Cloudflare Workers
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  return new Response('Hello from edge!', {
    headers: { 'content-type': 'text/plain' }
  });
}
```

---

*CDN 加速 v1.0*
