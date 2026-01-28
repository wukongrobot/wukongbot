import { html, nothing } from "lit";

import { formatAgo } from "../format";
import type { ChannelAccountSnapshot } from "../types";
import type { ChannelsProps } from "./channels.types";
import { renderChannelConfigSection } from "./channels.config";

export function renderFeishuCard(params: {
  props: ChannelsProps;
  feishu?: Record<string, unknown> | null;
  feishuAccounts: ChannelAccountSnapshot[];
  accountCountLabel: unknown;
}) {
  const { props, feishu, feishuAccounts, accountCountLabel } = params;
  const hasMultipleAccounts = feishuAccounts.length > 1;

  const renderAccountCard = (account: ChannelAccountSnapshot) => {
    const label = account.name || account.accountId;
    return html`
      <div class="account-card">
        <div class="account-card-header">
          <div class="account-card-title">${label}</div>
          <div class="account-card-id">${account.accountId}</div>
        </div>
        <div class="status-list account-card-status">
          <div>
            <span class="label">运行中</span>
            <span>${account.running ? "是" : "否"}</span>
          </div>
          <div>
            <span class="label">已配置</span>
            <span>${account.configured ? "是" : "否"}</span>
          </div>
          <div>
            <span class="label">上次入站</span>
            <span>${account.lastInboundAt ? formatAgo(account.lastInboundAt) : "无"}</span>
          </div>
          ${account.lastError
            ? html`
                <div class="account-card-error">
                  ${account.lastError}
                </div>
              `
            : nothing}
        </div>
      </div>
    `;
  };

  const configured = typeof feishu?.configured === "boolean" ? feishu.configured : false;
  const running = typeof feishu?.running === "boolean" ? feishu.running : false;
  const lastStartAt = typeof feishu?.lastStartAt === "number" ? feishu.lastStartAt : null;
  const lastProbeAt = typeof feishu?.lastProbeAt === "number" ? feishu.lastProbeAt : null;
  const lastError = typeof feishu?.lastError === "string" ? feishu.lastError : null;
  const probe = feishu?.probe as { ok?: boolean; status?: string; error?: string } | undefined;

  return html`
    <div class="card">
      <div class="card-title">飞书</div>
      <div class="card-sub">机器人状态与渠道配置。</div>
      ${accountCountLabel}

      ${hasMultipleAccounts
        ? html`
            <div class="account-card-list">
              ${feishuAccounts.map((account) => renderAccountCard(account))}
            </div>
          `
        : html`
            <div class="status-list" style="margin-top: 16px;">
              <div>
                <span class="label">已配置</span>
                <span>${configured ? "是" : "否"}</span>
              </div>
              <div>
                <span class="label">运行中</span>
                <span>${running ? "是" : "否"}</span>
              </div>
              <div>
                <span class="label">上次启动</span>
                <span>${lastStartAt ? formatAgo(lastStartAt) : "无"}</span>
              </div>
              <div>
                <span class="label">上次探测</span>
                <span>${lastProbeAt ? formatAgo(lastProbeAt) : "无"}</span>
              </div>
            </div>
          `}

      ${lastError
        ? html`<div class="callout danger" style="margin-top: 12px;">
            ${lastError}
          </div>`
        : nothing}

      ${probe
        ? html`<div class="callout" style="margin-top: 12px;">
            探测 ${probe.ok ? "ok" : "失败"} ·
            ${probe.status ?? ""} ${probe.error ?? ""}
          </div>`
        : nothing}

      ${renderChannelConfigSection({ channelId: "feishu", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>
          探测
        </button>
      </div>
    </div>
  `;
}
