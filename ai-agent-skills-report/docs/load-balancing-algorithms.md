# 负载均衡算法

## 算法

| 算法 | 特点 |
|------|------|
| Round Robin | 轮询 |
| Least Connections | 最少连接 |
| IP Hash | 来源IP固定 |
| Weighted | 加权 |

## Nginx

```nginx
upstream backend {
    least_conn;
    server backend1:80 weight=3;
    server backend2:80;
}
```

---

*负载均衡算法 v1.0*
