# AI Agent 工具箱

本文件夹包含各种实用的 Agent 工具配置。

## 目录

- `skills/` - 自定义 Skills 配置
- `mcp/` - MCP 服务器配置
- `prompts/` - 常用提示词模板
- `workflows/` - 工作流模板

## 快速开始

### 安装所有依赖

```bash
# Skills
npx skills add anthropics/skills@pdf
npx skills add anthropics/skills@pptx
npx skills add anthropics/skills@docx

# MCP
npx @modelcontextprotocol/server-filesystem ~/
npx @modelcontextprotocol/server-brave-search
```

### 配置示例

```json
{
  "skills": ["pdf", "pptx", "docx"],
  "mcp": {
    "filesystem": { "path": "~/documents" },
    "search": { "api_key": "xxx" }
  }
}
```

## 推荐组合

### 前端开发
- Skills: react, next, tailwind
- MCP: filesystem, git, github

### 数据分析
- Skills: pandas, visualization
- MCP: postgres, sqlite

### 内容创作
- Skills: copywriting, seo
- MCP: filesystem, search
