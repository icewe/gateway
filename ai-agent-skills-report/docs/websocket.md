# WebSocket 实时通信

## 服务端

```javascript
const { Server } = require('ws');

const wss = new Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    switch (data.type) {
      case 'chat':
        broadcast(data);
        break;
      case 'typing':
        broadcastTyping(data);
        break;
    }
  });
  
  ws.send(JSON.stringify({ type: 'welcome' }));
});
```

## 客户端

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
  console.log('Connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  handleMessage(data);
};

const send = (type, payload) => {
  ws.send(JSON.stringify({ type, payload }));
};
```

## 心跳保活

```javascript
// 心跳
setInterval(() => {
  ws.send(JSON.stringify({ type: 'ping' }));
}, 30000);

ws.on('pong', () => {
  console.log('Pong received');
});
```

---

*WebSocket v1.0*
