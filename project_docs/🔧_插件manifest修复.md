# 🔧 插件 Manifest 修复

## 🐛 问题描述

在配置向导中选择飞书频道时，出现错误：

```
Error: Config validation failed: plugins: plugin: plugin manifest requires configSchema
 ELIFECYCLE  Command failed with exit code 1.
```

## 🔍 问题原因

所有 Moltbot 插件的 `clawdbot.plugin.json` 文件都需要包含以下必需字段：

1. **`id`** - 插件唯一标识符
2. **`channels`** - 插件提供的频道列表
3. **`configSchema`** - JSON Schema 配置验证规则

我们创建的三个国产IM插件缺少了 `channels` 和 `configSchema` 字段。

## ✅ 修复内容

### 修复的文件 (3个)

1. `extensions/feishu/clawdbot.plugin.json`
2. `extensions/wecom/clawdbot.plugin.json`
3. `extensions/dingtalk/clawdbot.plugin.json`

### 添加的字段

为每个插件的 `clawdbot.plugin.json` 添加了：

```json
{
  "id": "feishu",
  "channels": [
    "feishu"
  ],
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {}
  }
}
```

## 📋 修复详情

### 1. 飞书插件 (`extensions/feishu/clawdbot.plugin.json`)

**修复前**:
```json
{
  "id": "feishu",
  "version": "1.0.0",
  "name": "飞书集成",
  "description": "飞书/Lark IM 平台集成...",
  "author": "WukongBot Team",
  "type": "channel"
  // ❌ 缺少 channels 和 configSchema
}
```

**修复后**:
```json
{
  "id": "feishu",
  "version": "1.0.0",
  "name": "飞书集成",
  "description": "飞书/Lark IM 平台集成...",
  "author": "WukongBot Team",
  "type": "channel",
  "channels": [
    "feishu"
  ],
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {}
  }
}
```

### 2. 企业微信插件 (`extensions/wecom/clawdbot.plugin.json`)

添加了相同的 `channels` 和 `configSchema` 字段：

```json
{
  "id": "wecom",
  "channels": [
    "wecom"
  ],
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {}
  }
}
```

### 3. 钉钉插件 (`extensions/dingtalk/clawdbot.plugin.json`)

添加了相同的 `channels` 和 `configSchema` 字段：

```json
{
  "id": "dingtalk",
  "channels": [
    "dingtalk"
  ],
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {}
  }
}
```

## 📝 字段说明

### `channels` 字段

声明插件提供的频道列表。对于单频道插件，通常只包含一个与插件 ID 相同的频道名。

```json
"channels": ["feishu"]
```

**作用**:
- 告诉系统这个插件注册了哪些频道
- 用于频道发现和路由
- 在配置向导中显示频道选项时使用

### `configSchema` 字段

定义插件配置的 JSON Schema 验证规则。

```json
"configSchema": {
  "type": "object",
  "additionalProperties": false,
  "properties": {}
}
```

**字段说明**:
- `type: "object"` - 配置必须是对象类型
- `additionalProperties: false` - 不允许未定义的额外属性
- `properties: {}` - 配置属性定义（空对象表示不需要特定配置）

**作用**:
- 验证用户配置的有效性
- 防止错误配置导致插件运行失败
- 提供配置结构的文档

### 为什么可以是空对象？

对于简单的插件，可以使用空的 `properties: {}`，表示：
- 插件的配置由代码内部管理
- 不需要在 manifest 层面做额外的验证
- 实际的配置验证在插件代码中处理

## 🔄 对比其他插件

### Telegram 插件 (参考示例)

```json
{
  "id": "telegram",
  "channels": [
    "telegram"
  ],
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {}
  }
}
```

### Voice Call 插件 (复杂配置示例)

```json
{
  "id": "voice-call",
  "channels": [
    "voice"
  ],
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "enabled": {
        "type": "boolean"
      },
      "provider": {
        "type": "string",
        "enum": ["telnyx", "twilio"]
      },
      "phoneNumber": {
        "type": "string"
      }
    }
  }
}
```

如果需要，我们可以后续为国产IM插件添加更详细的配置验证规则。

## 🚀 测试验证

### 1. 重新构建

```bash
cd /root/code/wukongbot
./build-simple.sh
```

### 2. 运行配置向导

```bash
pnpm wukongbot onboard
```

### 3. 选择飞书频道

在配置向导中：
```
◇  选择通道 (快速开始)
│  飞书 (Feishu/Lark)           ← 选择这个

◇  Install 飞书 plugin?
│  Install now                 ← 或选择 "Skip for now"
```

### 预期结果

- ✅ **修复前**: 报错 `plugin manifest requires configSchema`
- ✅ **修复后**: 顺利进入飞书配置流程，无报错

## 📊 修复总结

### 修改统计
- **文件数**: 3 个
- **添加字段**: 6 个 (每个插件 2 个字段)
- **代码行**: ~12 行

### 修改清单
```
extensions/feishu/clawdbot.plugin.json
  + "channels": ["feishu"]
  + "configSchema": { ... }

extensions/wecom/clawdbot.plugin.json
  + "channels": ["wecom"]
  + "configSchema": { ... }

extensions/dingtalk/clawdbot.plugin.json
  + "channels": ["dingtalk"]
  + "configSchema": { ... }
```

## 🎯 关键要点

### Moltbot 插件 Manifest 必需字段

所有频道插件的 `clawdbot.plugin.json` 必须包含：

1. ✅ **`id`** - 插件唯一标识符
2. ✅ **`channels`** - 频道列表
3. ✅ **`configSchema`** - 配置验证规则

### 可选字段

- `version` - 版本号
- `name` - 显示名称
- `description` - 插件描述
- `author` - 作者
- `type` - 插件类型 (e.g., "channel")
- `homepage` - 主页链接
- `repository` - 代码仓库信息
- `keywords` - 关键词

## 🔍 相关代码位置

### 插件加载和验证
- `src/plugins/load.ts` - 插件加载逻辑
- `src/plugins/validate.ts` - Manifest 验证逻辑
- `src/channels/plugins/index.ts` - 频道插件注册

### 配置向导
- `src/commands/onboard-channels.ts` - 频道配置向导
- `src/commands/onboarding/registry.ts` - 配置适配器注册

## 📚 参考文档

### Moltbot 插件系统
- 插件发现机制：`src/plugins/discovery.ts`
- 插件注册表：`src/plugins/registry.ts`
- 频道插件目录：`src/channels/plugins/catalog.ts`

### JSON Schema
- 官方文档: https://json-schema.org/
- 验证工具: https://www.jsonschemavalidator.net/

## 🎉 修复完成

现在三个国产IM插件的 manifest 已经完整，可以正常通过配置向导进行安装和配置！

---

**修复时间**: 2026-01-28  
**状态**: ✅ 已修复  
**测试命令**: `pnpm wukongbot onboard` → 选择飞书/企微/钉钉  
**预期**: 无报错，正常进入配置流程
