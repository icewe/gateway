# SEO 最佳实践

## Meta 标签

```html
<title>页面标题 - 品牌</title>
<meta name="description" content="页面描述，控制在160字符内">
<meta name="keywords" content="关键词1, 关键词2">

<!-- Open Graph -->
<meta property="og:title" content="标题">
<meta property="og:description" content="描述">
<meta property="og:image" content="图片URL">
<meta property="og:url" content="页面URL">

<!-- 结构化数据 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题",
  "image": ["图片URL"]
}
</script>
```

## URL 结构

```javascript
// 好的 URL
https://example.com/blog/how-to-learn-javascript
https://example.com/products/javascript-frameworks

// 避免
https://example.com/p?id=123
https://example.com/category?page=2&sort=name
```

## 性能

```html
<!-- 关键资源预加载 -->
<link rel="preload" href="style.css" as="style">
<link rel="preload" href="main.js" as="script">

<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//fonts.googleapis.com">
```

---

*SEO 最佳实践 v1.0*
