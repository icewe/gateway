# x402 参考实现

## JavaScript

```javascript
// 基础调用
import { X402 } from '@x402/sdk';

const x402 = new X402({ wallet: '0x...' });

const result = await x402.request('https://api.example.com/data');
```

## Python

```python
import x402

client = x402.Client(wallet='0x...')
result = client.get('https://api.example.com/data')
```

## Go

```go
import "github.com/x402/sdk-go"

client := x402.NewClient(wallet)
result, _ := client.Get("https://api.example.com/data")
```

---

*x402 参考实现 v1.0*
