# 函数式编程概念

## 核心概念

```javascript
// 纯函数
const add = (a, b) => a + b;

// 不可变性
const update = (obj, changes) => ({ ...obj, ...changes });

// 高阶函数
const map = (fn, arr) => arr.map(fn);
const filter = (pred, arr) => arr.filter(pred);
const reduce = (fn, init, arr) => arr.reduce(fn, init);
```

## 组合

```javascript
// 函数组合
const compose = (...fns) => 
  (value) => fns.reduceRight((acc, fn) => fn(acc), value);

const pipe = (...fns) => 
  (value) => fns.reduce((acc, fn) => fn(acc), value);

// 示例
const processUser = pipe(
  validateUser,
  normalizeEmail,
  addTimestamp,
  saveToDb
);
```

## 柯里化

```javascript
// 柯里化
const curry = (fn) => {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...next) => curried(...args, ...next);
  };
};

const add = curry((a, b) => a + b);
const add5 = add(5);
add5(3); // 8
```

---

*函数式编程 v1.0*
