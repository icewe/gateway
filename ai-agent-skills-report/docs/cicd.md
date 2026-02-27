# CI/CD 最佳实践

## GitHub Actions

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
      - uses: actions/deploy-pages@v4
```

## 部署流程

```javascript
// 部署脚本
const deploy = async () => {
  // 1. 构建
  await build();
  
  // 2. 测试
  await runTests();
  
  // 3. 部署到 staging
  await deployTo('staging');
  
  // 4. 验证
  await verifyStaging();
  
  // 5. 部署到生产
  if (process.env.CONTINUE === 'true') {
    await deployTo('production');
  }
};
```

## 回滚策略

```javascript
// 快速回滚
const rollback = async (version) => {
  const previous = await getDeployment(version - 1);
  await deploy(previous);
  await notifyTeam(`Rolled back to v${version - 1}`);
};
```

---

*CI/CD v1.0*
