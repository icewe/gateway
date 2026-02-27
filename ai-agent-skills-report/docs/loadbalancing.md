# 负载均衡指南

## 算法

```javascript
// 轮询
const roundRobin = (servers, index) => {
  return servers[index % servers.length];
};

// 加权轮询
const weightedRoundRobin = (servers) => {
  // 权重越高，出现的次数越多
};

// 最少连接
const leastConnections = (servers) => {
  return servers.reduce((a, b) => 
    a.connections < b.connections ? a : b
  );
};

// IP 哈希
const ipHash = (ip, servers) => {
  const hash = ip.split('').reduce((acc, char) => 
    acc + char.charCodeAt(0), 0
  );
  return servers[hash % servers.length];
};
```

## 健康检查

```javascript
const healthCheck = async (server) => {
  try {
    const response = await fetch(`${server.url}/health`, {
      method: 'GET',
      signal: timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
};

// 定期检查
setInterval(async () => {
  for (const server of servers) {
    server.healthy = await healthCheck(server);
  }
}, 10000);
```

---

*负载均衡 v1.0*
