# OpenClaw 配置与扩展

## OpenClaw 简介

OpenClaw 是一个开源的 AI Agent 框架，支持多种渠道和功能扩展。

## 配置文件

### 基础配置

```json
{
  "name": "my-agent",
  "version": "1.0.0",
  "channels": ["feishu", "telegram", "discord"],
  "model": {
    "provider": "minimax",
    "model": "MiniMax-M2.5"
  }
}
```

## 扩展开发

### 创建 Skill

```javascript
// my-skill/SKILL.md
# My Skill

描述这个 skill 的功能

## 使用方法

说明如何使用
```

### 集成 MCP

```javascript
// 配置 MCP 服务器
const mcpConfig = {
  servers: {
    filesystem: {
      command: "npx",
      args: ["@modelcontextprotocol/server-filesystem", "./data"]
    }
  }
};
```

## 部署

### Docker 部署

```dockerfile
FROM openclaw/openclaw:latest
COPY ./skills /app/skills
COPY ./config.json /app/config.json
```

---

*OpenClaw v1.0*
