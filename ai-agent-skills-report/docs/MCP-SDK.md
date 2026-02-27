# MCP SDK 对比

## TypeScript SDK

```typescript
import { Server } from '@modelcontextprotocol/sdk/server';

const server = new Server({ name: 'my-server', version: '1.0.0' });
```

## Python SDK

```python
from mcp.server import Server

server = Server("my-server")
```

## Go SDK

```go
import "github.com/mark3labs/mcp-go"

server := mcp.NewServer("my-server")
```

---

*MCP SDK 对比 v1.0*
