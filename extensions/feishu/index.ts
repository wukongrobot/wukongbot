/**
 * 飞书插件入口
 */

import type { PluginApi } from "../../src/plugin-sdk/index.js";
import { createFeishuChannelPlugin } from "./src/channel.js";

export default {
  id: "feishu",
  register(api: PluginApi) {
    api.registerChannel(createFeishuChannelPlugin());
  },
};

// 导出类型供外部使用
export type { FeishuConfig, FeishuMessage } from "./src/types.js";
export { FeishuClient } from "./src/sdk.js";
