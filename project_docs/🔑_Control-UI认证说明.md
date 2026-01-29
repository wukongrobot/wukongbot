# 🔑 Control UI 认证说明

## 问题说明

访问 Control UI 时出现错误：
```
disconnected (1008): unauthorized: gateway token missing 
(open a tokenized dashboard URL or paste token in Control UI settings)
```

这是正常的安全机制，需要提供认证 token 才能连接到网关。

## 🔐 你的 Token

```
1a1760cece3bcedbfda1f348b0671cd2d9d56f74c47a74a0
```

**重要**: 这是你的私密 token，请妥善保管！

## ✅ 解决方案（二选一）

### 方案 1: 使用带 Token 的 URL（推荐）

直接访问包含 token 的 URL：

```
http://127.0.0.1:18789/?token=1a1760cece3bcedbfda1f348b0671cd2d9d56f74c47a74a0
```

**优点**:
- ✅ 一次性设置，自动保存到浏览器 localStorage
- ✅ 以后刷新页面不需要重新输入
- ✅ 最简单快捷

**步骤**:
1. 复制上面的完整 URL
2. 粘贴到浏览器地址栏
3. 按回车访问
4. ✅ 完成！

### 方案 2: 在设置中手动输入 Token

如果你已经打开了普通 URL（`http://127.0.0.1:18789/`）：

**步骤**:

1. **打开设置**:
   - 点击页面右上角的设置图标（⚙️）
   - 或者直接访问 `http://127.0.0.1:18789/#/config`

2. **找到 Gateway 设置**:
   - 在设置页面中找到 "Gateway URL" 和 "Token" 输入框

3. **输入 Token**:
   ```
   Token: 1a1760cece3bcedbfda1f348b0671cd2d9d56f74c47a74a0
   ```

4. **保存并连接**:
   - 点击保存或刷新页面
   - ✅ 完成！

## 📝 快速命令

### 随时获取带 Token 的 URL

```bash
cd /root/code/wukongbot
pnpm wukongbot dashboard
```

**输出示例**:
```
Dashboard URL: http://127.0.0.1:18789/?token=1a1760cece3bcedbfda1f348b0671cd2d9d56f74c47a74a0
```

### 查看当前 Token

```bash
cat ~/.clawdbot/moltbot.json | grep -A 2 "auth"
```

**输出示例**:
```json
"auth": {
  "mode": "token",
  "token": "1a1760cece3bcedbfda1f348b0671cd2d9d56f74c47a74a0"
}
```

### 生成新 Token（如需要）

```bash
pnpm wukongbot config set gateway.auth.token "$(openssl rand -hex 24)"
```

**注意**: 生成新 token 后，旧的 URL 会失效，需要使用新的 token。

## 🔍 验证连接

访问带 token 的 URL 后，应该看到：

### ✅ 正常状态
- 页面完整显示
- 左侧导航栏正常
- 右上角显示连接状态（绿色/已连接）
- 无错误提示

### ❌ 如果仍然出错

1. **检查 token 是否正确**:
   ```bash
   cat ~/.clawdbot/moltbot.json | grep token
   ```

2. **检查网关是否运行**:
   ```bash
   pnpm wukongbot gateway status
   ```

3. **查看网关日志**:
   ```bash
   tail -50 /tmp/wukongbot-gateway.log
   ```

4. **重启网关**:
   ```bash
   pkill -f "moltbot.*gateway"
   pnpm wukongbot gateway run --port 18789
   ```

## 🛡️ 安全建议

### Token 安全

- ❌ **不要** 将 token 提交到 git
- ❌ **不要** 在公共场合分享 token
- ❌ **不要** 在不安全的网络上使用

### 访问控制

当前配置：
```json
"gateway": {
  "mode": "local",
  "bind": "loopback",
  "port": 18789
}
```

- ✅ `bind: "loopback"` - 只允许本机访问（`127.0.0.1`）
- ✅ 其他机器无法访问，安全

### 远程访问（可选）

如果需要从其他机器访问，使用 SSH 隧道：

```bash
# 在你的本地机器上运行
ssh -N -L 18789:127.0.0.1:18789 root@<服务器IP>
```

然后在本地访问：
```
http://localhost:18789/?token=1a1760cece3bcedbfda1f348b0671cd2d9d56f74c47a74a0
```

## 📖 相关文档

- 官方文档: https://docs.molt.bot/web/control-ui
- 网关配置: https://docs.molt.bot/gateway/configuration
- 远程访问: https://docs.molt.bot/gateway/remote

## ❓ 常见问题

### Q1: 为什么需要 token？
**A**: Token 是认证凭证，防止未授权访问你的网关和配置。

### Q2: Token 会过期吗？
**A**: 不会。Token 是固定的，除非你手动更改。

### Q3: 忘记 token 怎么办？
**A**: 运行 `cat ~/.clawdbot/moltbot.json | grep token` 查看，或运行 `pnpm wukongbot dashboard` 获取完整 URL。

### Q4: 可以禁用 token 认证吗？
**A**: 不建议。如果确实需要，可以修改配置：
```bash
pnpm wukongbot config set gateway.auth.mode "none"
```
但这会降低安全性。

### Q5: 多个浏览器/设备可以同时使用吗？
**A**: 可以！只要使用相同的 token，多个客户端可以同时连接。

## 🎯 总结

### 最简单的方法

**直接访问这个 URL**:
```
http://127.0.0.1:18789/?token=1a1760cece3bcedbfda1f348b0671cd2d9d56f74c47a74a0
```

**完成！** ✨

---

**创建时间**: 2026-01-28  
**状态**: ✅ Token 有效  
**网关**: 运行在 http://127.0.0.1:18789/
