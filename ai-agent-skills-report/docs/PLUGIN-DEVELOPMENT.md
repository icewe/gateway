# OpenClaw 插件开发

## 1. 插件结构

```
plugins/my-plugin/
├── package.json
├── src/
│   └── index.ts
└── config.yaml
```

### package.json

```json
{
  "name": "@openclaw/plugin-my-plugin",
  "version": "1.0.0",
  "main": "dist/index.js",
  "openclaw": {
    "hooks": ["message", "cron"]
  }
}
```

### 入口文件

```typescript
import { Plugin, PluginContext } from '@openclaw/plugin-core';

export class MyPlugin implements Plugin {
  name = 'my-plugin';
  version = '1.0.0';
  
  async onLoad(context: PluginContext): Promise<void> {
    console.log('Plugin loaded');
    
    // 注册命令
    context.commands.register('hello', this.hello);
  }
  
  async hello(args: string[]): Promise<string> {
    return `Hello, ${args[0] || 'World'}!`;
  }
  
  async onMessage(message: Message): Promise<void> {
    if (message.content === 'ping') {
      await message.reply('pong');
    }
  }
}
```

## 2. 钩子定义

```typescript
// 可用钩子
interface PluginHooks {
  onLoad?: (context: PluginContext) => Promise<void>;
  onUnload?: () => Promise<void>;
  onMessage?: (message: Message) => Promise<void>;
  onCron?: (job: CronJob) => Promise<void>;
  onError?: (error: Error) => Promise<void>;
}
```

---

*OpenClaw 插件开发 v1.0*
