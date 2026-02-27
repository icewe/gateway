# 单元测试框架对比

## Jest

```javascript
describe('calculate', () => {
  test('adds numbers', () => {
    expect(1 + 2).toBe(3);
  });
  
  test('async', async () => {
    const data = await fetchData();
    expect(data).toBeDefined();
  });
});
```

## Vitest

```javascript
import { describe, it, expect } from 'vitest';

describe('utils', () => {
  it('works', () => {
    expect(true).toBe(true);
  });
});
```

## Mocha + Chai

```javascript
const expect = require('chai').expect;

describe('Array', () => {
  it('#includes', () => {
    expect([1,2,3]).to.include(2);
  });
});
```

---

*测试框架 v1.0*
