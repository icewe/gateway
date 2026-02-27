# TypeScript 最佳实践

## 类型定义

```typescript
// 接口
interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user' | 'guest';
  metadata?: Record<string, unknown>;
}

// 类型别名
type UserId = string;
type UserRole = 'admin' | 'user' | 'guest';

// 泛型
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}
```

## 实用技巧

```typescript
// 可选链
const name = user?.profile?.name ?? 'Anonymous';

// 断言
const value = data as string;

// 类型守卫
const isUser = (x: unknown): x is User => {
  return typeof x === 'object' && x !== null && 'email' in x;
};
```

## 严格模式

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true
  }
}
```

---

*TypeScript v1.0*
