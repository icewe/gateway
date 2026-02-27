# 运行 x402 Demo

## 方式一: Node.js 本地运行

### 1. 安装依赖

```bash
cd x402-demo
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，填入你的私钥
```

### 3. 启动服务端

```bash
npm run server
```

### 4. 另一个终端启动客户端

```bash
npm run client
```

## 方式二: Docker 运行

### 构建镜像

```bash
docker build -t x402-demo .
```

### 运行服务端

```bash
docker run -p 4021:4021 \
  -e EVM_ADDRESS=0xYourAddress \
  x402-demo npm run server
```

### 运行客户端

```bash
docker run -e EVM_PRIVATE_KEY=0xYourKey \
  x402-demo npm run client
```

## 测试网水龙头

- Base Sepolia: https://coinbase.com/faucet
- 需要测试 USDC 才能完成支付

## 常见问题

### Q: 支付失败怎么办?
A: 检查:
1. 私钥是否正确
2. 测试网账户是否有足够的 USDC
3. facilitator URL 是否正确

### Q: 如何切换到主网?
A: 修改代码中的 network 为主网 (如 eip155:8453 for Base Mainnet)
