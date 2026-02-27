# JSON 操作指南

## 解析与序列化

```javascript
// 解析
const obj = JSON.parse('{"name":"Tom"}');

// 序列化
const str = JSON.stringify(obj, null, 2);

// 格式化
JSON.stringify(obj, null, 2); // 2空格缩进
```

## 深拷贝

```javascript
const copy = JSON.parse(JSON.stringify(obj));
```

## 增量更新

```javascript
// 合并
const merged = { ...obj1, ...obj2 };

// 条件合并
const result = {
  ...obj1,
  ...(condition && obj2)
};
```

---

*JSON 操作 v1.0*
