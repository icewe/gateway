# 服务发现

## 方式

- **客户端**: 客户端查询注册中心
- **服务端**: 负载均衡查询注册中心

## 工具

| 工具 | 类型 | 特点 |
|------|------|------|
| Eureka | Java | Netflix开源 |
| Consul | 多语言 | 功能丰富 |
| etcd | 多语言 | Kubernetes |

## Consul 示例

```javascript
const consul = require('consul')();

consul.agent.service.register({
  name: 'my-service',
  address: 'localhost',
  port: 3000
}, (err) => {
  if (err) throw err;
});
```

---

*服务发现 v1.0*
