/**
 * 悟空Bot Web UI 中文语言包
 */

export const zh_CN = {
  // 通用
  common: {
    connect: "连接",
    disconnect: "断开",
    refresh: "刷新",
    save: "保存",
    cancel: "取消",
    edit: "编辑",
    delete: "删除",
    add: "添加",
    search: "搜索",
    loading: "加载中...",
    error: "错误",
    success: "成功",
    warning: "警告",
    info: "信息",
    confirm: "确认",
    yes: "是",
    no: "否",
    ok: "确定",
    back: "返回",
    next: "下一步",
    previous: "上一步",
    finish: "完成",
    close: "关闭",
    open: "打开",
    enable: "启用",
    disable: "禁用",
    status: "状态",
    name: "名称",
    type: "类型",
    value: "值",
    description: "描述",
    settings: "设置",
    advanced: "高级",
    documentation: "文档",
  },

  // 导航
  nav: {
    overview: "概览",
    chat: "对话",
    channels: "频道",
    config: "配置",
    cron: "定时任务",
    logs: "日志",
    sessions: "会话",
    skills: "技能",
    debug: "调试",
  },

  // 概览页面
  overview: {
    title: "概览",
    gatewayAccess: "网关访问",
    gatewayAccessDesc: "控制面板的连接和认证方式",
    websocketUrl: "WebSocket 地址",
    gatewayToken: "网关令牌",
    password: "密码(不存储)",
    sessionKey: "会话密钥",
    connectionStatus: "连接状态",
    connected: "已连接",
    disconnected: "未连接",
    connecting: "连接中...",
    lastError: "最后错误",
    gatewayInfo: "网关信息",
    uptime: "运行时间",
    tickInterval: "轮询间隔",
    presence: "在线设备",
    sessions: "会话数",
    cronStatus: "定时任务",
    nextRun: "下次运行",
    lastChannelsRefresh: "频道刷新",
    authRequired: "此网关需要认证。添加令牌或密码后点击连接。",
    authFailed: "认证失败。请重新获取令牌或更新密码后点击连接。",
    insecureContext: "当前页面为 HTTP,浏览器阻止设备身份验证。请使用 HTTPS 或在网关主机上打开 http://127.0.0.1:18789。",
    getToken: "获取令牌",
    generateToken: "生成令牌",
    controlUiAuth: "控制面板认证",
  },

  // 对话页面
  chat: {
    title: "对话",
    newChat: "新对话",
    inputPlaceholder: "输入消息...",
    send: "发送",
    sendingStatus: "发送中...",
    thinking: "思考中...",
    typing: "输入中...",
    noMessages: "还没有消息",
    clearHistory: "清除历史",
    exportChat: "导出对话",
    copyMessage: "复制消息",
    regenerate: "重新生成",
    stopGeneration: "停止生成",
  },

  // 频道页面
  channels: {
    title: "频道管理",
    addChannel: "添加频道",
    noChannels: "还没有配置频道",
    channelStatus: "频道状态",
    healthy: "正常",
    error: "错误",
    notConfigured: "未配置",
    degraded: "降级",
    configure: "配置",
    reconfigure: "重新配置",
    testConnection: "测试连接",
    viewLogs: "查看日志",
    feishu: "飞书",
    wecom: "企业微信",
    dingtalk: "钉钉",
    telegram: "Telegram",
    discord: "Discord",
    slack: "Slack",
    whatsapp: "WhatsApp",
    signal: "Signal",
    imessage: "iMessage",
  },

  // 配置页面
  config: {
    title: "配置",
    saveConfig: "保存配置",
    resetConfig: "重置配置",
    exportConfig: "导出配置",
    importConfig: "导入配置",
    configInvalid: "配置无效",
    configSaved: "配置已保存",
    configReset: "配置已重置",
    general: "通用",
    models: "模型",
    gateway: "网关",
    security: "安全",
    hooks: "钩子",
    workspace: "工作空间",
  },

  // 定时任务页面
  cron: {
    title: "定时任务",
    addJob: "添加任务",
    editJob: "编辑任务",
    deleteJob: "删除任务",
    enableJob: "启用任务",
    disableJob: "禁用任务",
    noJobs: "还没有定时任务",
    schedule: "调度",
    message: "消息",
    target: "目标",
    enabled: "已启用",
    disabled: "已禁用",
    lastRun: "上次运行",
    nextRun: "下次运行",
  },

  // 日志页面
  logs: {
    title: "日志",
    clearLogs: "清除日志",
    downloadLogs: "下载日志",
    filterLogs: "筛选日志",
    level: "级别",
    timestamp: "时间戳",
    message: "消息",
    noLogs: "没有日志",
    debug: "调试",
    info: "信息",
    warn: "警告",
    error: "错误",
  },

  // 会话页面
  sessions: {
    title: "会话",
    activeSessions: "活跃会话",
    sessionHistory: "会话历史",
    viewSession: "查看会话",
    deleteSession: "删除会话",
    noSessions: "没有会话",
    duration: "时长",
    messages: "消息数",
    channel: "频道",
    user: "用户",
  },

  // 技能页面
  skills: {
    title: "技能",
    installedSkills: "已安装技能",
    availableSkills: "可用技能",
    installSkill: "安装技能",
    uninstallSkill: "卸载技能",
    enableSkill: "启用技能",
    disableSkill: "禁用技能",
    noSkills: "没有技能",
    skillInfo: "技能信息",
    version: "版本",
    author: "作者",
  },

  // 错误信息
  errors: {
    connectionFailed: "连接失败",
    authFailed: "认证失败",
    networkError: "网络错误",
    serverError: "服务器错误",
    invalidConfig: "配置无效",
    unknownError: "未知错误",
    timeout: "请求超时",
    notFound: "未找到",
    forbidden: "禁止访问",
    unauthorized: "未授权",
  },

  // 成功消息
  success: {
    connected: "连接成功",
    disconnected: "已断开连接",
    saved: "保存成功",
    deleted: "删除成功",
    updated: "更新成功",
    sent: "发送成功",
    installed: "安装成功",
    uninstalled: "卸载成功",
  },

  // 品牌
  brand: {
    name: "悟空Bot",
    title: "悟空Bot 控制面板",
    tagline: "你的私人AI助手,七十二变无所不能",
    welcome: "欢迎使用悟空Bot",
    poweredBy: "基于",
  },
};

export type I18n = typeof zh_CN;

// 默认使用中文
export const i18n: I18n = zh_CN;

// 翻译函数
export function t(key: string): string {
  const keys = key.split(".");
  let value: any = i18n;
  for (const k of keys) {
    value = value[k];
    if (value === undefined) return key;
  }
  return String(value);
}
