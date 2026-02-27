# WebSocket 对比

## Socket.io

```javascript
// 服务端
io.on('connection', (socket) => {
  socket.on('message', (data) => {
    io.emit('message', data);
  });
});

// 客户端
socket.emit('message', 'Hello');
```

## WS (轻量)

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});
```

---

*WebSocket 对比 v1.0*
