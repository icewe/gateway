# 系统设计原则

## 核心原则

1. **单一职责**: 每个模块只做一件事
2. **开闭原则**: 对扩展开放, 对修改关闭
3. **依赖倒置**: 依赖抽象, 不依赖具体
4. **接口隔离**: 多个专用接口 > 一个通用接口

## 实践

```javascript
// 依赖注入
class UserService {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }
}
```

---

*系统设计原则 v1.0*
