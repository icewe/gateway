# OpenClaw 配置完全指南

## 1. 基础配置

### config.yaml

```yaml
# Gateway 配置
gateway:
  host: "0.0.0.0"
  port: 8080
  debug: false

# 模型配置
models:
  default: "minimax/MiniMax-M2.5"
  providers:
    - name: "minimax"
      apiKey: "${MINIMAX_API_KEY}"
      baseUrl: "https://api.minimax.chat/v1"
      
# 会话配置
session:
  maxContext: 200000
  maxHistory: 100
  
# Skills 配置
skills:
  directory: "./skills"
  autoLoad: true
```

## 2. 通道配置

### 飞书

```yaml
channels:
  feishu:
    enabled: true
    appId: "${FEISHU_APP_ID}"
    appSecret: "${FEISHU_APP_SECRET}"
    verificationToken: "${FEISHU_VERIFY_TOKEN}"
```

### Telegram

```yaml
channels:
  telegram:
    enabled: true
    botToken: "${TELEGRAM_BOT_TOKEN}"
```

## 3. 定时任务

```yaml
cron:
  enabled: true
  jobs:
    - name: "daily-report"
      schedule: "0 8 * * *"  # 每天 8 点
      timezone: "Asia/Shanghai"
      payload:
        kind: "agentTurn"
        message: "生成每日报告"
      delivery:
        mode: "announce"
        channel: "feishu"
```

## 4. 高级配置

### 安全设置

```yaml
security:
  allowedChannels:
    - "feishu"
    - "telegram"
  rateLimit:
    enabled: true
    maxRequests: 100
    windowSeconds: 60
    
# 插件配置
plugins:
  - name: "feishu"
    enabled: true
  - name: "qqbot"
    enabled: false
```

---

*OpenClaw 配置完全指南 v1.0*
