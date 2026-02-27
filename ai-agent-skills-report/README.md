# AI Agent 能力扩展平台研究报告

> 探索 AI Agent 如何找到适合的 Skills、MCP 和开放能力

## 摘要

随着 AI Agent 的快速发展，如何扩展 Agent 的能力成为关键问题。本报告调研了当前市场上主要的 Agent 能力扩展平台、Skills 市场、MCP 生态以及各类开放能力提供者。

---

## 一、Skills 市场与平台

### 1.1 Skills.sh - 开放 Agent Skills 生态系统

**官网**: https://skills.sh/

Skills.sh 是目前最大的 AI Agent Skills 开放市场，聚合了来自多个 AI 平台的 Skills 资源。

**热门 Skills 排行榜 TOP 30**:

| 排名 | Skill | 安装量 | 描述 |
|------|-------|--------|------|
| 1 | find-skills | 337.3K | 技能发现 |
| 2 | vercel-react-best-practices | 171.6K | React 最佳实践 |
| 3 | web-design-guidelines | 131.2K | Web 设计指南 |
| 4 | remotion-best-practices | 114.1K | 视频生成最佳实践 |
| 5 | frontend-design | 103.3K | 前端设计 |
| 6 | azure-ai | 74.5K | Azure AI 服务 |
| 7 | azure-observability | 74.5K | Azure 可观测性 |
| 8 | azure-cost-optimization | 74.5K | Azure 成本优化 |
| 9 | azure-storage | 74.4K | Azure 存储 |
| 10 | azure-diagnostics | 74.4K | Azure 诊断 |
| 23 | agent-browser | 63.0K | 浏览器自动化 |
| 29 | browser-use | 40.7K | 浏览器使用 |
| 57 | mcp-builder | 13.6K | MCP 构建器 |

**支持的主流 AI Agent 平台**:
- Claude Code (Anthropic)
- Cursor
- GitHub Copilot
- Cline
- Windsurf (Codeium)
- Trae
- VS Code
- OpenAI Codex
- Google Gemini
- 数十种其他平台

**安装方式**:
```bash
# 安装 skills CLI
npm install -g skills

# 搜索技能
npx skills find ai news

# 安装技能
npx skills add <owner/repo>
```

### 1.2 Anthropic Skills (官方)

| Skill | 功能 |
|-------|------|
| `frontend-design` | 前端界面设计 |
| `pdf` | PDF 文档处理 |
| `pptx` | PowerPoint 制作 |
| `docx` | Word 文档 |
| `xlsx` | Excel 表格 |
| `skill-creator` | 创建新技能 |
| `mcp-builder` | MCP 服务器构建 |
| `webapp-testing` | Web 应用测试 |

### 1.3 Vercel Skills (官方)

| Skill | 功能 |
|-------|------|
| `find-skills` | 技能发现与搜索 |
| `vercel-react-best-practices` | React 最佳实践 |
| `web-design-guidelines` | Web 设计指南 |
| `vercel-composition-patterns` | 组件组合模式 |
| `agent-browser` | 浏览器自动化 |
| `next-best-practices` | Next.js 最佳实践 |
| `vercel-react-native-skills` | React Native |

---

## 二、MCP (Model Context Protocol) 生态

### 2.1 什么是 MCP?

**官网**: https://modelcontextprotocol.io/

MCP 是一个开放标准，用于将 AI 应用连接到外部系统。就像 USB-C 连接电子设备一样，MCP 提供了 AI 应用连接外部系统的标准化方式。

**MCP 的核心能力**:
- **数据源**: 访问本地文件、数据库、云存储
- **工具**: 搜索引擎、API 调用、计算器等
- **工作流**: 专业化提示词和自动化

**与 Skills 的区别**:
- Skills: 注入专业领域知识/最佳实践
- MCP: 连接外部工具和数据源

### 2.2 MCP 官方服务器

**GitHub**: https://github.com/modelcontextprotocol/servers

**官方参考服务器**:

| 服务器 | 功能 |
|--------|------|
| `everything` | 完整功能演示 |
| `fetch` | 网页内容获取与转换 |
| `filesystem` | 文件系统操作 (可配置权限) |
| `git` | Git 仓库操作 |
| `memory` | 知识图谱持久化 |
| `sequential-thinking` | 思维链推理 |
| `time` | 时区转换 |

**已归档服务器** (仍可用):

| 服务器 | 功能 |
|--------|------|
| `brave-search` | Brave 搜索 API |
| `everart` | AI 图像生成 |
| `github` | GitHub API |
| `gitlab` | GitLab API |
| `google-drive` | Google Drive |
| `google-maps` | 地图服务 |
| `postgres` | PostgreSQL |
| `sqlite` | SQLite |
| `redis` | Redis |
| `puppeteer` | 浏览器自动化 |
| `sentry` | 错误追踪 |
| `slack` | Slack 消息 |

### 2.3 MCP Registry

**地址**: https://registry.modelcontextprotocol.io/

官方 MCP 服务器注册表，可浏览和搜索已发布的 MCP 服务器。

### 2.4 MCP SDK 支持

| 语言 | SDK |
|------|-----|
| TypeScript/JavaScript | @modelcontextprotocol/typescript-sdk |
| Python | mcp |
| Go | github.com/modelcontextprotocol/go-sdk |
| C#/.NET | modelcontextprotocol/csharp-sdk |
| Java | modelcontextprotocol/java-sdk |
| Rust | modelcontextprotocol/rust-sdk |
| Swift | modelcontextprotocol/swift-sdk |

### 2.5 常用 MCP 服务器推荐

```python
# Python MCP 服务器示例
from mcp.server import Server
from mcp.types import Tool, Resource

server = Server("my-mcp-server")

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="search",
            description="Search the web",
            inputSchema={"type": "object", "properties": {"query": {"type": "string"}}}
        )
    ]
```

---

## 三、其他 Agent 平台与应用市场

### 3.1 Coze (扣子) - 字节跳动

**官网**: https://www.coze.com/

- 可视化工作流编排
- 插件市场 (Plugins)
- 知识库管理
- 多平台部署 (Discord, Slack, 微信, etc.)

### 3.2 Dify - 开源 AI Agent

**官网**: https://dify.ai/

- 开源 LLM 应用开发平台
- RAG 引擎
- 工作流编排
- 企业级部署

### 3.3 LangChain/LangGraph

**官网**: https://langchain.com/

- LLM 应用开发框架
- Agent 编排
- 工具集成

### 3.4 飞书 Bitable

飞书多维表格可作为 Agent 的轻量级数据存储和知识库。

---

## 四、如何选择合适的扩展方式

### 4.1 选择决策树

```
需要扩展 AI Agent 能力?
│
├─ 需要专业领域知识/最佳实践?
│   └─ Skills.sh / Anthropic Skills / Vercel Skills
│
├─ 需要连接外部工具/数据源?
│   └─ MCP (Model Context Protocol)
│
├─ 需要可视化编排复杂工作流?
│   └─ Coze / Dify / LangGraph
│
└─ 需要构建自己的工具?
    └─ MCP SDK (多语言支持)
```

### 4.2 方案对比

| 方案 | 难度 | 灵活性 | 生态丰富度 | 适用场景 |
|------|------|--------|-----------|----------|
| Skills.sh | 低 | 中 | 高 | 快速获取最佳实践 |
| MCP | 中 | 高 | 中 | 连接外部系统 |
| Coze | 低 | 中 | 高 | 快速构建 Agent |
| Dify | 中 | 高 | 中 | 企业级应用 |
| 自建 | 高 | 最高 | 依赖开发 | 特殊需求 |

### 4.3 发展趋势

1. **标准化**: MCP 正在成为行业标准
2. **生态聚合**: Skills.sh 等平台整合多源资源
3. **专业化**: 垂直领域 Skills 越来越多
4. **易用性**: 从代码配置向可视化转变
5. **AI Agent Marketplace**: 各平台都在构建自己的 Agent 市场

---

## 五、相关资源链接

### Skills
- Skills.sh: https://skills.sh/
- Anthropic Skills: https://docs.anthropic.com/en/docs/agents/skill
- Vercel Skills: https://vercel.com/docs/ai-agent-skills

### MCP
- 官网: https://modelcontextprotocol.io/
- Registry: https://registry.modelcontextprotocol.io/
- GitHub: https://github.com/modelcontextprotocol
- 官方服务器: https://github.com/modelcontextprotocol/servers

### 平台
- Coze: https://www.coze.com/
- Dify: https://dify.ai/
- LangChain: https://langchain.com/

### x402 支付
- 官网: https://x402.org/
- 文档: https://docs.x402.org/
- GitHub: https://github.com/coinbase/x402

---

## 六、附录：快速开始模板

### 安装 Skills
```bash
# 全局安装
npm install -g skills

# 搜索
npx skills find react

# 安装
npx skills add vercel-labs/skills@vercel-react-best-practices
```

### 启动 MCP 服务器
```python
# Python
pip install mcp
python -m mcp.server src/python stdio

# TypeScript
npx @modelcontextprotocol/server-filesystem /path/to/files
```

### 创建自己的 Skill
```bash
npx skills init my-awesome-skill
```

---

*报告生成时间: 2026-02-27*
*作者: AI Agent*
*版本: v1.1*
