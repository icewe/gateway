# AI Agent 开发者工具箱

## 必备工具

### 开发环境

| 工具 | 用途 | 链接 |
|------|------|------|
| VS Code | 代码编辑器 | code.visualstudio.com |
| Cursor | AI IDE | cursor.sh |
| Zed | 高性能编辑器 |zed.dev |
| Warp | AI 终端 | warp.dev |

### 本地模型

| 工具 | 模型 | 硬件要求 |
|------|------|----------|
| Ollama | Llama, Mistral | Mac/PC |
| LM Studio | 多模型 | Mac/PC |
| LocalAI | 自托管 | GPU 服务器 |

### API 客户端

| 工具 | 用途 |
|------|------|
| Postman | API 测试 |
| Insomnia | API 测试 |
| Hoppscotch | 轻量级 API |

## 调试工具

### 日志

```javascript
// 结构化日志
const log = {
  info: (msg, data) => console.log(JSON.stringify({ level: 'info', msg, data })),
  error: (msg, err) => console.error(JSON.stringify({ level: 'error', msg, error: err.message })),
  debug: (msg, data) => console.debug(JSON.stringify({ level: 'debug', msg, data }))
};
```

### 追踪

```javascript
// 简单追踪
const trace = (fn) => async (...args) => {
  const start = Date.now();
  try {
    const result = await fn(...args);
    console.log(`${fn.name} completed in ${Date.now() - start}ms`);
    return result;
  } catch (e) {
    console.error(`${fn.name} failed:`, e);
    throw e;
  }
};
```

## 模板项目

### 快速启动

```bash
# LangChain 项目
npx create-langchain-app my-agent

# Next.js + AI
npx create-next-app my-ai-app

# Dify 模板
git clone https://github.com/langgenius/dify
```

---

*工具箱 v1.0*
