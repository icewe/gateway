# 微服务通信

## 同步

- REST API
- gRPC

## 异步

- 消息队列 (RabbitMQ, Kafka)
- 事件总线

## gRPC 示例

```proto
syntax = "proto3";

service UserService {
  rpc GetUser (UserRequest) returns (User);
}

message UserRequest {
  string id = 1;
}

message User {
  string id = 1;
  string name = 2;
}
```

---

*微服务通信 v1.0*
