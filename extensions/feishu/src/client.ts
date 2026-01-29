/**
 * 飞书客户端管理 (支持 WebSocket 连接)
 */

import * as Lark from "@larksuiteoapi/node-sdk";
import type { FeishuConfig, FeishuDomain } from "./types.js";

let cachedClient: Lark.Client | null = null;
let cachedWSClient: Lark.WSClient | null = null;
let cachedConfig: { 
  appId: string; 
  appSecret: string; 
  domain: FeishuDomain;
} | null = null;

function resolveDomain(domain: FeishuDomain = "feishu") {
  return domain === "lark" ? Lark.Domain.Lark : Lark.Domain.Feishu;
}

/**
 * 解析飞书凭证
 */
function resolveFeishuCredentials(cfg: FeishuConfig) {
  if (!cfg.appId || !cfg.appSecret) {
    return null;
  }
  return {
    appId: cfg.appId,
    appSecret: cfg.appSecret,
    domain: (cfg.domain || "feishu") as FeishuDomain,
    verificationToken: cfg.verificationToken,
    encryptKey: cfg.encryptKey,
  };
}

/**
 * 创建飞书 HTTP 客户端 (用于发送消息、调用 API)
 */
export function createFeishuClient(cfg: FeishuConfig): Lark.Client {
  const creds = resolveFeishuCredentials(cfg);
  if (!creds) {
    throw new Error("Feishu credentials not configured (appId, appSecret required)");
  }

  // 如果配置相同，返回缓存的客户端
  if (
    cachedClient &&
    cachedConfig &&
    cachedConfig.appId === creds.appId &&
    cachedConfig.appSecret === creds.appSecret &&
    cachedConfig.domain === creds.domain
  ) {
    return cachedClient;
  }

  const client = new Lark.Client({
    appId: creds.appId,
    appSecret: creds.appSecret,
    appType: Lark.AppType.SelfBuild,
    domain: resolveDomain(creds.domain),
  });

  cachedClient = client;
  cachedConfig = { 
    appId: creds.appId, 
    appSecret: creds.appSecret, 
    domain: creds.domain,
  };

  return client;
}

/**
 * 创建飞书 WebSocket 客户端 (用于接收消息)
 */
export function createFeishuWSClient(cfg: FeishuConfig): Lark.WSClient {
  const creds = resolveFeishuCredentials(cfg);
  if (!creds) {
    throw new Error("Feishu credentials not configured (appId, appSecret required)");
  }

  // 如果配置相同，返回缓存的 WebSocket 客户端
  if (
    cachedWSClient &&
    cachedConfig &&
    cachedConfig.appId === creds.appId &&
    cachedConfig.appSecret === creds.appSecret &&
    cachedConfig.domain === creds.domain
  ) {
    return cachedWSClient;
  }

  const wsClient = new Lark.WSClient({
    appId: creds.appId,
    appSecret: creds.appSecret,
    domain: resolveDomain(creds.domain),
    loggerLevel: Lark.LoggerLevel.info,
  });

  cachedWSClient = wsClient;
  cachedConfig = { 
    appId: creds.appId, 
    appSecret: creds.appSecret, 
    domain: creds.domain,
  };

  return wsClient;
}

/**
 * 创建事件分发器 (用于 Webhook 模式)
 */
export function createEventDispatcher(cfg: FeishuConfig): Lark.EventDispatcher {
  const creds = resolveFeishuCredentials(cfg);
  return new Lark.EventDispatcher({
    encryptKey: creds?.encryptKey,
    verificationToken: creds?.verificationToken,
  });
}

/**
 * 清除客户端缓存
 */
export function clearClientCache() {
  cachedClient = null;
  cachedWSClient = null;
  cachedConfig = null;
}
