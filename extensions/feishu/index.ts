import type { MoltbotPluginApi } from "clawdbot/plugin-sdk";
import { emptyPluginConfigSchema } from "clawdbot/plugin-sdk";

import { createFeishuChannelPlugin } from "./src/channel.js";

const plugin = {
  id: "feishu",
  name: "飞书",
  description: "飞书 (Feishu/Lark) channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: MoltbotPluginApi) {
    api.registerChannel({ plugin: createFeishuChannelPlugin() });
  },
};

export default plugin;
