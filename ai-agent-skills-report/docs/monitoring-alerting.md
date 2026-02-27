# 监控告警

## 指标

- CPU/内存
- 请求延迟
- 错误率
- QPS

## Prometheus + Grafana

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'my-app'
    static_configs:
      - targets: ['localhost:9090']
```

## 告警规则

```yaml
groups:
- name: alerts
  rules:
  - alert: HighErrorRate
    expr: rate(errors_total[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
```

---

*监控告警 v1.0*
