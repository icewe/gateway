# 设计模式指南

## 创建型模式

### 单例模式

```javascript
class Singleton {
  static #instance = null;
  
  static getInstance() {
    if (!Singleton.#instance) {
      Singleton.#instance = new Singleton();
    }
    return Singleton.#instance;
  }
}
```

### 工厂模式

```javascript
class Factory {
  static create(type) {
    switch (type) {
      case 'A': return new ProductA();
      case 'B': return new ProductB();
      default: throw new Error('Unknown type');
    }
  }
}
```

### 构建者模式

```javascript
class Builder {
  #result = {};
  
  setName(name) { this.#result.name = name; return this; }
  setAge(age) { this.#result.age = age; return this; }
  build() { return { ...this.#result }; }
}

const user = new Builder().setName('Tom').setAge(20).build();
```

---

*设计模式 v1.0*
