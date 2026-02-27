# Docker 容器化

## Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

## Docker Compose

```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://db:5432/app
    depends_on:
      - db
      - redis
    
  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
      
  redis:
    image: redis:7-alpine
    
volumes:
  pgdata:
```

## 命令

```bash
# 构建
docker build -t myapp .

# 运行
docker run -d -p 3000:3000 myapp

# Compose
docker-compose up -d
```

---

*Docker v1.0*
