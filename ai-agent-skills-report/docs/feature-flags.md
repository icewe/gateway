# 特性开关

## 概念

动态控制功能开启/关闭

## 实现

```javascript
const features = {
  newCheckout: { enabled: true, percentage: 10 },
  darkMode: { enabled: true }
};

const isEnabled = (feature) => {
  const f = features[feature];
  if (!f || !f.enabled) return false;
  if (f.percentage) {
    return Math.random() * 100 < f.percentage;
  }
  return true;
};
```

## 工具

- LaunchDarkly
- Split.io
- Unleash

---

*特性开关 v1.0*
