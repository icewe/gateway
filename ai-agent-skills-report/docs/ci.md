# 持续集成 CI

## 流程

```
代码提交 → 构建 → 测试 → 部署
```

## GitHub Actions

```yaml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
```

## 最佳实践

1. 快速反馈
2. 保持构建稳定
3. 自动化一切
4. 可见性

---

*持续集成 v1.0*
