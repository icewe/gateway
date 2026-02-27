# Kubernetes 部署指南

## 基本概念

```yaml
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: my-app:latest
        ports:
        - containerPort: 3000
```

## 命令

```bash
# 部署
kubectl apply -f deployment.yaml

# 扩缩容
kubectl scale deployment my-app --replicas=5

# 查看状态
kubectl get pods
kubectl get services

# 日志
kubectl logs -f deployment/my-app

# 进入容器
kubectl exec -it pod-name -- sh
```

---

*K8s 部署 v1.0*
