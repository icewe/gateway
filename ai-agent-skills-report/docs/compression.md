# 压缩算法

## 常用算法

| 算法 | 用途 | 压缩比 |
|------|------|--------|
| gzip | HTTP | 中 |
| br | HTTP | 高 |
| zstd | 新 | 很高 |
| lz4 | 实时 | 快 |

## Nginx 配置

```nginx
gzip on;
gzip_types text/plain application/json application/javascript;
gzip_min_length 1000;
```

## 压缩级别

```javascript
const zlib = require('zlib');
// 1-9, 6是默认
zlib.gzipSync(data, { level: 9 });
```

---

*压缩算法 v1.0*
