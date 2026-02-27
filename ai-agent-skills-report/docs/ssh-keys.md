# SSH 密钥管理

## 生成密钥

```bash
# 生成 ED25519 (推荐)
ssh-keygen -t ed25519 -C "your@email.com"

# RSA
ssh-keygen -t rsa -b 4096 -C "your@email.com"
```

## 配置

```bash
# 添加到 SSH agent
ssh-add ~/.ssh/id_ed25519

# 复制公钥
cat ~/.ssh/id_ed25519.pub
```

## SSH Config

```bash
# ~/.ssh/config
Host server
    HostName example.com
    User ubuntu
    Port 22
    IdentityFile ~/.ssh/id_ed25519
```

---

*SSH 密钥 v1.0*
