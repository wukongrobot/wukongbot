/**
 * 企业微信插件入口
 */

import type { PluginApi } from "clawdbot/plugin-sdk";
import { createWeComChannelPlugin } from "./src/channel.js";

export default {
  id: "wecom",
  register(api: PluginApi) {
    api.registerChannel(createWeComChannelPlugin());
  },
};

export type { WeComConfig, WeComMessage } from "./src/types.js";
export { WeComClient } from "./src/sdk.js";
