/**
 * 飞书状态探测
 */

import type { FeishuClient } from "./sdk.js";
import type { FeishuConfig } from "./types.js";

export type ProbeResult = {
  status: "healthy" | "error" | "not-configured" | "degraded";
  message: string;
  details?: Record<string, unknown>;
};

/**
 * 探测飞书连接状态
 */
export async function probeFeishu(
  client: FeishuClient,
  config: FeishuConfig,
): Promise<ProbeResult> {
  // 检查配置
  if (!config.appId || !config.appSecret) {
    return {
      status: "not-configured",
      message: "飞书未配置: 缺少 App ID 或 App Secret",
    };
  }

  // 测试连接
  try {
    const isConnected = await client.testConnection();
    
    if (!isConnected) {
      return {
        status: "error",
        message: "飞书连接失败: 无法获取 access token",
      };
    }

    // 检查 Webhook 配置
    const warnings: string[] = [];
    
    if (!config.verificationToken) {
      warnings.push("未配置 Verification Token");
    }

    if (!config.webhookPort) {
      warnings.push("未配置 Webhook 端口");
    }

    if (warnings.length > 0) {
      return {
        status: "degraded",
        message: "飞书连接正常,但有配置警告",
        details: {
          warnings,
        },
      };
    }

    return {
      status: "healthy",
      message: "飞书连接正常",
      details: {
        appId: config.appId,
        webhookPort: config.webhookPort,
        webhookPath: config.webhookPath,
      },
    };
  } catch (error) {
    return {
      status: "error",
      message: `飞书连接失败: ${error}`,
    };
  }
}
