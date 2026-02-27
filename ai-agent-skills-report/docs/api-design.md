# API 设计最佳实践

## RESTful 设计

```javascript
// 路由设计
const routes = {
  // 资源
  'GET /users': 'list users',
  'GET /users/:id': 'get user',
  'POST /users': 'create user',
  'PUT /users/:id': 'update user',
  'DELETE /users/:id': 'delete user',
  
  // 嵌套资源
  'GET /users/:id/orders': 'list user orders',
  'POST /users/:id/orders': 'create order'
};

// 响应格式
const response = {
  success: true,
  data: { /* ... */ },
  meta: {
    page: 1,
    per_page: 20,
    total: 100
  }
};
```

## 错误处理

```javascript
// 统一错误格式
const errorResponse = (code, message, details) => ({
  error: {
    code,
    message,
    details,
    timestamp: new Date().toISOString()
  }
});

// 错误码
const errors = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500
};
```

## 版本控制

```javascript
// URL 版本
const api = {
  v1: 'https://api.example.com/v1',
  v2: 'https://api.example.com/v2'
};

// 请求示例
fetch('https://api.example.com/v1/users/123', {
  headers: {
    'Accept': 'application/vnd.example.v1+json'
  }
});
```

---

*API 设计 v1.0*
