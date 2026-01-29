import type { MoltbotPluginApi } from "clawdbot/plugin-sdk";
import { emptyPluginConfigSchema } from "clawdbot/plugin-sdk";

import { createWeComChannelPlugin } from "./src/channel.js";

const plugin = {
  id: "wecom",
  name: "企业微信",
  description: "企业微信 (WeCom) channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: MoltbotPluginApi) {
    api.registerChannel({ plugin: createWeComChannelPlugin() });
  },
};

export default plugin;
