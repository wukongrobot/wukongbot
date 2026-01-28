/**
 * 钉钉插件入口
 */

import type { PluginApi } from "clawdbot/plugin-sdk";
import { createDingTalkChannelPlugin } from "./src/channel.js";

export default {
  id: "dingtalk",
  register(api: PluginApi) {
    api.registerChannel(createDingTalkChannelPlugin());
  },
};

export type { DingTalkConfig, DingTalkMessage } from "./src/types.js";
export { DingTalkClient } from "./src/sdk.js";
