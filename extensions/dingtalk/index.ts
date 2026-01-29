import type { MoltbotPluginApi } from "clawdbot/plugin-sdk";
import { emptyPluginConfigSchema } from "clawdbot/plugin-sdk";

import { createDingTalkChannelPlugin } from "./src/channel.js";

const plugin = {
  id: "dingtalk",
  name: "钉钉",
  description: "钉钉 (DingTalk) channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: MoltbotPluginApi) {
    api.registerChannel({ plugin: createDingTalkChannelPlugin() });
  },
};

export default plugin;
