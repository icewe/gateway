# 日期时间处理

## Date 对象

```javascript
const now = new Date();

// 获取
now.getFullYear(); // 2026
now.getMonth();    // 0-11
now.getDate();     // 1-31

// 设置
now.setFullYear(2025);
now.setMonth(5);
```

## 日期格式化

```javascript
// 格式化
const format = (date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

// ISO 字符串
date.toISOString(); // "2026-01-01T00:00:00.000Z"

// 本地字符串
date.toLocaleString('zh-CN');
```

## 日期计算

```javascript
// 加减天数
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// 相差天数
const diffDays = (a, b) => {
  return Math.abs(a - b) / (1000 * 60 * 60 * 24);
};
```

---

*日期时间 v1.0*
