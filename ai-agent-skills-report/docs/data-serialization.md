# 数据序列化

## 格式对比

| 格式 | 人类可读 | 体积 | 速度 |
|------|---------|------|------|
| JSON | 是 | 大 | 中 |
| XML | 是 | 大 | 慢 |
| Protobuf | 否 | 小 | 快 |
| MessagePack | 否 | 小 | 快 |

## Protobuf

```proto
message User {
  string name = 1;
  int32 age = 2;
  repeated string hobbies = 3;
}
```

---

*数据序列化 v1.0*
