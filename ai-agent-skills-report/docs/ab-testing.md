# A/B 测试

## 统计方法

- 置信区间
- p-value
- 样本大小计算

## 实现

```javascript
const variants = {
  control: 50,
  variant_a: 50
};

const assign = (userId) => {
  const hash = hashString(userId);
  const bucket = hash % 100;
  return bucket < 50 ? 'control' : 'variant_a';
};
```

## 指标

- 转化率
- 点击率
- 留存率

---

*A/B 测试 v1.0*
