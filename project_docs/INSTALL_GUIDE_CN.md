# 悟空Bot 依赖安装指南

## 问题说明

由于您的 Node.js 版本是 v21.5.0，而项目要求 >= 22.12.0，建议先升级 Node.js 版本。

## 解决方案

### 方案一：升级 Node.js (推荐)

```bash
# 使用 nvm 升级 Node.js
nvm install 22
nvm use 22

# 或者使用 n
npm install -g n
n 22

# 验证版本
node --version  # 应该显示 v22.x.x
```

### 方案二：临时降低版本要求

如果暂时无法升级 Node.js，可以临时修改版本要求：

```bash
cd /root/code/wukongbot

# 备份原始 package.json
cp package.json package.json.bak

# 修改版本要求（仅用于测试）
# 将 "node": ">=22.12.0" 改为 "node": ">=21.0.0"
```

### 方案三：分步安装

```bash
cd /root/code/wukongbot

# 1. 先安装根项目依赖
pnpm install --ignore-workspace --no-frozen-lockfile

# 2. 安装飞书扩展
cd extensions/feishu
pnpm install

# 3. 安装企业微信扩展
cd ../wecom
pnpm install

# 4. 安装钉钉扩展
cd ../dingtalk
pnpm install

# 5. 返回根目录
cd ../..

# 6. 完整安装
pnpm install --no-frozen-lockfile
```

## 当前已修复的问题

✅ 已修复：移除扩展包中对 `clawdbot@workspace:*` 的引用
✅ 已修复：修正飞书 SDK 版本从 ^2.0.0 到 ^1.56.0
✅ 已修复：更新所有扩展包的类型导入路径

## 下一步

安装成功后，运行：

```bash
# 构建项目
pnpm build

# 运行配置向导
pnpm wukongbot onboard

# 查看帮助
pnpm wukongbot --help
```

## 常见问题

### Q: 为什么需要 Node.js 22?
A: 项目使用了 Node.js 22 的新特性，建议升级以获得最佳体验和性能。

### Q: 可以使用 npm 或 yarn 吗?
A: 建议使用 pnpm，因为项目配置了 pnpm workspace。

### Q: 安装时间过长怎么办?
A: 可以尝试清理缓存后重新安装：
```bash
pnpm store prune
rm -rf node_modules
pnpm install --no-frozen-lockfile
```
