# 分布式追踪

## 概念

```
请求A → 服务1 → 服务2 → 服务3
  ↓
Span1 Span2 Span3 Span4
  ↓
Trace ID: abc123
```

## Jaeger

```yaml
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: my-jaeger
```

## OpenTelemetry

```javascript
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('my-app');

span = tracer.startSpan('operation');
span.end();
```

---

*分布式追踪 v1.0*
