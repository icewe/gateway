# 容器化最佳实践

## Dockerfile 优化

```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/index.js"]
```

## 最佳实践

1. 使用轻量基础镜像
2. 减少层数
3. 缓存依赖
4. 不包含敏感信息

---

*容器化最佳实践 v1.0*
