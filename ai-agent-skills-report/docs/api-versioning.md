# API 版本管理

## URL 版本

```
/api/v1/users
/api/v2/users
```

## Header 版本

```http
Accept: application/vnd.myapp.v2+json
```

## 查询参数

```
/api/users?version=2
```

## 弃用策略

```javascript
app.use((req, res, next) => {
  if (req.query.version === '1') {
    res.set('Deprecation', 'true');
    res.set('Link', '<https://api.example.com/v2/users>; rel="successor-version"');
  }
  next();
});
```

---

*API 版本 v1.0*
