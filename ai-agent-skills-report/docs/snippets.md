# 常用代码片段集合

## JavaScript/TypeScript

### 通用工具

```javascript
// 防抖
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// 节流
const throttle = (fn, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 深拷贝
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};
```

### 日期处理

```javascript
// 格式化
const formatDate = (date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

// 相对时间
const relativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`;
  return `${Math.floor(minutes / 14400)}天前`;
};
```

### 数组处理

```javascript
// 分组
const groupBy = (arr, key) => {
  return arr.reduce((acc, item) => {
    const group = item[key];
    acc[group] = acc[group] || [];
    acc[group].push(item);
    return acc;
  }, {});
};

// 去重
const unique = (arr) => [...new Set(arr)];
```

### 异步处理

```javascript
// 并发限制
const concurrencyLimit = async (tasks, limit) => {
  const results = [];
  const executing = [];
  
  for (const task of tasks) {
    const p = Promise.resolve(task()).then(result => {
      results.push(result);
      executing.splice(executing.indexOf(p), 1);
    });
    
    executing.push(p);
    
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }
  
  return results;
};
```

---

*代码片段 v1.0*
