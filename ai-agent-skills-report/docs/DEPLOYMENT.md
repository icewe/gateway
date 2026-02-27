# AI Agent 部署策略

## 1. 容器化

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/index.js"]
```

## 2. K8s 部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent
  template:
    metadata:
      labels:
        app: agent
    spec:
      containers:
        - name: agent
          image: agent:latest
          ports:
            - containerPort: 8080
          resources:
            limits:
              memory: "2Gi"
              cpu: "1000m"
```

## 3. 扩缩容

```typescript
class AutoScaler {
  async scale(): Promise<void> {
    const metrics = await this.getMetrics();
    
    const targetReplicas = Math.ceil(
      metrics.currentLoad / this.targetUtilization
    );
    
    await this.updateReplicas(targetReplicas);
  }
}
```

---

*AI Agent 部署策略 v1.0*
