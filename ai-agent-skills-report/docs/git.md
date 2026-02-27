# Git 最佳实践

## 提交规范

```bash
# 格式: type(scope): message
git commit -m "feat(auth): add login API"
git commit -m "fix(ui): resolve button style"
git commit -m "docs(readme): update installation"
```

## 类型

- feat: 新功能
- fix: 修复
- docs: 文档
- style: 格式
- refactor: 重构
- test: 测试
- chore: 维护

## 分支策略

```
main ─────●─────●─────●─────
          │     │
feature ──●─────●     │
                  │
hotfix ───────────●──
```

## 常用命令

```bash
# 创建分支
git checkout -b feature/new-feature

# 变基
git rebase main

# 交互式变基
git rebase -i HEAD~3

# 储藏
git stash
git stash pop
```

---

*Git 最佳实践 v1.0*
