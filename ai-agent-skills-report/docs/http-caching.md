# HTTP 缓存指南

## 缓存头

```http
# 缓存控制
Cache-Control: max-age=3600, public

# 条件请求
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT
```

## 客户端缓存

```javascript
// 强缓存
fetch(url, {
  headers: { 'Cache-Control': 'max-age=3600' }
});

// 协商缓存
fetch(url, {
  headers: {
    'If-None-Match': 'etag-value',
    'If-Modified-Since': 'date'
  }
});
```

## Service Worker

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

---

*HTTP 缓存 v1.0*
