# 服务网格 Service Mesh

## 概念

- **控制平面**: 配置管理
- **数据平面**: 请求转发

## Istio

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: my-service
spec:
  hosts:
  - my-service
  http:
  - route:
    - destination:
        host: my-service
```

## 工具

| 工具 | 特点 |
|------|------|
| Istio | 功能全 |
| Linkerd | 简单 |
| Consul Connect | 多云 |

---

*服务网格 v1.0*
