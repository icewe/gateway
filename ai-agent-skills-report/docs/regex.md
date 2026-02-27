# 正则表达式指南

## 基础

```javascript
// 匹配
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
email.test('test@example.com'); // true

// 替换
'Hello World'.replace(/World/, 'JavaScript');

// 提取
const url = 'https://example.com/path';
const domain = url.match(/https?:\/\/([^\/]+)/)[1];
```

## 常用正则

```javascript
// 手机号
const phone = /^1[3-9]\d{9}$/;

// URL
const urlRegex = /^https?:\/\/.+$/;

// 身份证
const idCard = /^\d{17}[\dXx]$/;

// 日期
const date = /^\d{4}-\d{2}-\d{2}$/;
```

## 标志

```javascript
const regex = /pattern/gi;
// g - 全局
// i - 不区分大小写
// m - 多行
```

---

*正则表达式 v1.0*
