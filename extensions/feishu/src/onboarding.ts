/**
 * 飞书引导配置
 */

export type Prompter = {
  text: (params: { message: string; initial?: string }) => Promise<string>;
  password: (params: { message: string }) => Promise<string>;
  confirm: (params: { message: string; initial?: boolean }) => Promise<boolean>;
  select: <T extends string>(params: {
    message: string;
    choices: Array<{ value: T; label: string; hint?: string }>;
  }) => Promise<T>;
  note: (message: string, title?: string) => void;
};

export type FeishuOnboardingOptions = {
  skipWebhook?: boolean;
};

/**
 * 飞书配置引导
 */
export async function onboardFeishu(
  prompter: Prompter,
  options?: FeishuOnboardingOptions,
): Promise<{
  appId: string;
  appSecret: string;
  verificationToken?: string;
  encryptKey?: string;
  webhookPort?: number;
  webhookPath?: string;
  allowFrom: string[];
}> {
  prompter.note(
    "飞书集成配置引导\n\n" +
      "你需要先在飞书开放平台创建应用:\n" +
      "1. 访问 https://open.feishu.cn/app\n" +
      "2. 创建企业自建应用\n" +
      "3. 获取 App ID 和 App Secret\n" +
      "4. 配置事件订阅和消息权限",
    "飞书配置",
  );

  // App ID
  const appId = await prompter.text({
    message: "请输入飞书应用 App ID:",
  });

  if (!appId || !appId.trim()) {
    throw new Error("App ID 不能为空");
  }

  // App Secret
  const appSecret = await prompter.password({
    message: "请输入飞书应用 App Secret:",
  });

  if (!appSecret || !appSecret.trim()) {
    throw new Error("App Secret 不能为空");
  }

  // Verification Token (可选)
  const needsToken = await prompter.confirm({
    message: "是否配置 Verification Token? (用于 Webhook 验证)",
    initial: true,
  });

  let verificationToken: string | undefined;
  if (needsToken) {
    verificationToken = await prompter.text({
      message: "请输入 Verification Token:",
    });
  }

  // Encrypt Key (可选)
  const needsEncrypt = await prompter.confirm({
    message: "是否配置 Encrypt Key? (用于消息加密)",
    initial: false,
  });

  let encryptKey: string | undefined;
  if (needsEncrypt) {
    encryptKey = await prompter.text({
      message: "请输入 Encrypt Key:",
    });
  }

  // Webhook 配置
  let webhookPort: number | undefined;
  let webhookPath: string | undefined;

  if (!options?.skipWebhook) {
    const configWebhook = await prompter.confirm({
      message: "是否配置 Webhook 服务器?",
      initial: true,
    });

    if (configWebhook) {
      const portStr = await prompter.text({
        message: "Webhook 监听端口:",
        initial: "3000",
      });
      webhookPort = Number.parseInt(portStr) || 3000;

      webhookPath = await prompter.text({
        message: "Webhook 路径:",
        initial: "/webhook/feishu",
      });
    }
  }

  // 用户白名单
  const allowAllUsers = await prompter.confirm({
    message: "是否允许所有用户与机器人交互?",
    initial: true,
  });

  const allowFrom = allowAllUsers ? ["*"] : [];

  prompter.note(
    "配置完成!\n\n" +
      "下一步:\n" +
      "1. 在飞书开放平台配置事件订阅 URL\n" +
      `2. URL 格式: http://your-server:${webhookPort || 3000}${webhookPath || "/webhook/feishu"}\n` +
      "3. 添加权限: 获取与发送单聊消息、获取与发送群组消息\n" +
      "4. 发布版本并启用应用",
    "配置完成",
  );

  return {
    appId: appId.trim(),
    appSecret: appSecret.trim(),
    verificationToken: verificationToken?.trim(),
    encryptKey: encryptKey?.trim(),
    webhookPort,
    webhookPath,
    allowFrom,
  };
}
