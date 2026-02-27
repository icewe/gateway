# URL 处理指南

## 解析

```javascript
const url = new URL('https://example.com:8080/path?query=1#section');

url.protocol; // "https:"
url.host;    // "example.com:8080"
url.pathname; // "/path"
url.search;  // "?query=1"
url.hash;    // "#section"
```

## 构建

```javascript
const url = new URL('https://example.com');
url.searchParams.set('page', '1');
url.searchParams.set('limit', '10');
url.toString(); // "https://example.com/?page=1&limit=10"
```

## 查询参数

```javascript
const params = new URLSearchParams('page=1&limit=10');

params.get('page');  // "1"
params.set('page', '2');
params.toString();  // "page=2&limit=10"
```

---

*URL 处理 v1.0*
