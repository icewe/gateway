# Skills 开发深度指南

## SKILL.md 结构

### 必须字段

```markdown
---
name: skill-name
description: 简短描述（1-2句话）
category: development|ai|tool|integration
tags: [tag1, tag2]
version: 1.0.0
author: Your Name <email@example.com>
---

# Skill Name

## 简介
详细描述这个 Skill 的功能和适用场景。

## 触发条件
- 包含关键词: xxx, yyy
- 匹配模式: `^/command.*`

## 核心指令
你是一个 xxx 助手...

## 示例
```

### 完整示例

```markdown
---
name: react-typescript
description: React + TypeScript 最佳实践
category: development
tags: [react, typescript, frontend]
version: 2.0.0
author: AI Team <ai@example.com>
---

# React + TypeScript 最佳实践

## 简介
提供 React 应用开发的 TypeScript 最佳实践，包括类型定义、组件模式、状态管理等。

## 触发条件
- 文件包含: react, react-dom
- 文件扩展名: .tsx, .jsx

## 核心指令

### 1. 类型优先
始终先定义类型，再编写实现。

```typescript
// ✅ 好的做法
interface User {
  id: string;
  name: string;
  email: string;
}

function UserCard({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// ❌ 避免
function UserCard({ user }) {
  return <div>{user.name}</div>;
}
```

### 2. 组件模式
使用函数组件 + Hooks。

```typescript
// 函数组件
const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick,
  variant = 'primary'
}) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### 3. 状态管理
按复杂度选择：
- useState: 局部状态
- useReducer: 复杂状态逻辑
- Context: 跨组件共享
- Zustand/Jotai: 全局状态

## 示例

### 创建组件
用户输入: "创建一个用户列表组件"

生成代码:
```typescript
interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface UserListProps {
  users: User[];
  onSelect?: (user: User) => void;
  loading?: boolean;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  onSelect,
  loading
}) => {
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <ul className="user-list">
      {users.map(user => (
        <li 
          key={user.id}
          onClick={() => onSelect?.(user)}
        >
          {user.avatar && <img src={user.avatar} />}
          <span>{user.name}</span>
        </li>
      ))}
    </ul>
  );
};
```

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| strictMode | boolean | true | 严格类型检查 |
| componentStyle | string | "fc" | 组件风格(fc/class) |
| stateManagement | string | "useState" | 状态管理方案 |

## 注意事项

1. **不要使用 any** - 使用 unknown 或具体类型
2. **导出类型** - 公共 API 必须有类型
3. **错误边界** - 考虑错误处理
4. **性能** - 使用 memo/useMemo/useCallback
```

---

*Skills 开发深度指南 v1.0*
