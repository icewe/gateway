# API 网关

## 功能

- 路由
- 认证
- 限流
- 日志

## Nginx 配置

```nginx
server {
    location /api/ {
        proxy_pass http://backend;
        
        # 认证
        auth_basic "Restricted";
        auth_basic_user_file /etc/nginx/.htpasswd;
        
        # 限流
        limit_req zone=api burst=10;
    }
}
```

## 工具

| 网关 | 特点 |
|------|------|
| Kong | 功能丰富 |
| Nginx | 高性能 |
| Traefik | 易用 |

---

*API 网关 v1.0*
