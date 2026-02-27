# 配置管理

## 工具对比

| 工具 | 类型 | 特点 |
|------|------|------|
| etcd | KV存储 | Kubernetes内置 |
| Consul | 服务发现 | 功能丰富 |
| ZooKeeper | 分布式 | 成熟稳定 |

## 使用场景

- 服务发现
- 配置存储
- 分布式锁

## etcd 示例

```bash
# 写入
etcdctl put /myapp/config "{\"key\": \"value\"}"

# 读取
etcdctl get /myapp/config

# 监听变化
etcdctl watch /myapp/config
```

---

*配置管理 v1.0*
