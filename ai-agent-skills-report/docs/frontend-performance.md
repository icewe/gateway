# 前端性能优化

## 图片优化

```html
<!-- 响应式图片 -->
<img 
  srcset="img-400.jpg 400w,
          img-800.jpg 800w,
          img-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, 800px"
  src="img-800.jpg"
  alt="描述"
>

<!-- 懒加载 -->
<img loading="lazy" src="image.jpg">

<!-- 格式选择 -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg">
</picture>
```

## 代码分割

```javascript
// React
const LazyComponent = React.lazy(() => import('./Component'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

## 缓存策略

```javascript
// Service Worker
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

---

*性能优化 v1.0*
