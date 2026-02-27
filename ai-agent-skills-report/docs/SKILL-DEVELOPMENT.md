# Skills 开发完全指南

## 什么是 Skill

Skill 是一个可复用的 AI Agent 能力包，包含：
- 专业知识/最佳实践
- 专用工具定义
- Prompt 模板
- 配置选项

## Skill 结构

```
my-skill/
├── SKILL.md          # Skill 定义 (必需)
├── prompts/          # Prompt 模板
│   ├── system.md
│   └── user.md
├── tools/            # 工具定义
│   └── tools.json
├── config/           # 配置
│   └── default.json
└── README.md         # 文档
```

## SKILL.md 格式

```markdown
# Skill 名称

简短描述这个 Skill 的功能。

## 适用场景

- 场景1
- 场景2

## 使用方法

```javascript
// 示例代码
```

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| option1 | string | "default" | 选项1描述 |
| option2 | boolean | false | 选项2描述 |
```

## 创建 Skill 实战

### 1. 创建 Skill 骨架

```bash
npx skills init my-awesome-skill
```

### 2. 编写 SKILL.md

```markdown
# AI 代码审查 Skill

专门用于 AI Agent 自动代码审查的 Skill。

## 功能

- 安全性检查
- 性能建议
- 最佳实践验证
- 可读性分析

## 适用场景

- PR 审查
- 代码提交前检查
- 定时代码审计

## 审查维度

### 1. 安全性

- SQL 注入风险
- XSS 漏洞
- 敏感信息泄露
- 认证/授权问题

### 2. 性能

- 数据库查询效率
- 内存使用
- 算法复杂度

### 3. 可维护性

- 代码重复
- 函数长度
- 命名规范

### 4. 最佳实践

- 错误处理
- 日志记录
- 测试覆盖

## 使用示例

```javascript
const reviewResult = await agent.executeSkill(
  "code-review",
  {
    language: "javascript",
    files: ["./src/**/*.js"],
    options: {
      security: true,
      performance: true,
      strict: true
    }
  }
);
```

## 配置选项

| 选项 | 类型 | 默认 | 描述 |
|------|------|------|------|
| language | string | "javascript" | 编程语言 |
| strict | boolean | false | 严格模式 |
| security | boolean | true | 安全检查 |
| performance | boolean | true | 性能检查 |
```

### 3. 添加工具定义

```json
// tools/tools.json
{
  "tools": [
    {
      "name": "analyze_code",
      "description": "分析代码文件",
      "parameters": {
        "type": "object",
        "properties": {
          "filePath": {
            "type": "string",
            "description": "文件路径"
          },
          "language": {
            "type": "string",
            "enum": ["javascript", "typescript", "python", "java"]
          }
        },
        "required": ["filePath"]
      }
    },
    {
      "name": "generate_report",
      "description": "生成审查报告",
      "parameters": {
        "type": "object",
        "properties": {
          "format": {
            "type": "string",
            "enum": ["json", "markdown", "html"]
          }
        }
      }
    }
  ]
}
```

### 4. 发布 Skill

```bash
# 登录 GitHub
git init
git add .
git commit -m "feat: initial code review skill"
git push origin main

# 在 Skills.sh 注册
npx skills publish
```

## 热门 Skills 解析

### 1. vercel-react-best-practices

```markdown
# React 最佳实践

## 组件规范

### 函数组件

```jsx
// ✅ 推荐
function UserCard({ user }) {
  return (
    <div className="user-card">
      <Avatar src={user.avatar} />
      <Name>{user.name}</Name>
    </div>
  );
}

// ❌ 避免
class UserCard extends React.Component {
  render() {
    return (
      <div className="user-card">
        <Avatar src={this.props.user.avatar} />
        <Name>{this.props.user.name}</Name>
      </div>
    );
  }
}
```

### Hooks 规则

1. 只在最顶层调用 Hooks
2. 只在 React 函数中调用
3. 使用 useCallback/useMemo 优化
```

### 2. frontend-design

```markdown
# 前端设计系统

## 颜色

- 主色: #0066CC
- 次色: #FFFFFF
- 强调色: #FF6B00

## 间距

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

## 响应式断点

- mobile: < 768px
- tablet: 768px - 1024px
- desktop: > 1024px
```

## Skill 组合使用

```javascript
// 组合多个 Skills
const agent = {
  skills: [
    "vercel-react-best-practices",
    "frontend-design",
    "code-review"
  ],
  
  // 自定义 workflow
  async reviewAndImprove(code) {
    // 1. 代码审查
    const review = await this.executeSkill("code-review", { code });
    
    // 2. 应用最佳实践
    const improved = await this.executeSkill(
      "vercel-react-best-practices",
      { code: review.suggestedCode }
    );
    
    // 3. 验证设计规范
    const designCheck = await this.executeSkill(
      "frontend-design",
      { code: improved.code }
    );
    
    return designCheck;
  }
};
```

---

*Skill 开发指南 v1.0*
