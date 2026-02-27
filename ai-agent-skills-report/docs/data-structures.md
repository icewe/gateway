# 数据结构指南

## 数组操作

```javascript
// 去重
const unique = [...new Set(arr)];

// 排序
arr.sort((a, b) => a - b);

// 分组
const groupBy = (arr, key) => 
  arr.reduce((acc, x) => {
    (acc[x[key]] = acc[x[key]] || []).push(x);
    return acc;
  }, {});

// 扁平化
arr.flat(2); // 2层
```

## 对象操作

```javascript
// 合并
const merged = { ...obj1, ...obj2 };

// 过滤键
const picked = Object.fromEntries(
  Object.entries(obj).filter(([k]) => ['a','b'].includes(k))
);

// 深拷贝
const deepClone = JSON.parse(JSON.stringify(obj));
```

---

*数据结构 v1.0*
