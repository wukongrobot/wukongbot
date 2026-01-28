import { html, nothing } from "lit";

import { formatAgo } from "../format";
import type { ChannelAccountSnapshot } from "../types";
import type { ChannelsProps } from "./channels.types";
import { renderChannelConfigSection } from "./channels.config";

export function renderWecomCard(params: {
  props: ChannelsProps;
  wecom?: Record<string, unknown> | null;
  wecomAccounts: ChannelAccountSnapshot[];
  accountCountLabel: unknown;
}) {
  const { props, wecom, wecomAccounts, accountCountLabel } = params;
  const hasMultipleAccounts = wecomAccounts.length > 1;

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

  const configured = typeof wecom?.configured === "boolean" ? wecom.configured : false;
  const running = typeof wecom?.running === "boolean" ? wecom.running : false;
  const lastStartAt = typeof wecom?.lastStartAt === "number" ? wecom.lastStartAt : null;
  const lastProbeAt = typeof wecom?.lastProbeAt === "number" ? wecom.lastProbeAt : null;
  const lastError = typeof wecom?.lastError === "string" ? wecom.lastError : null;
  const probe = wecom?.probe as { ok?: boolean; status?: string; error?: string } | undefined;

  return html`
    <div class="card">
      <div class="card-title">企业微信</div>
      <div class="card-sub">机器人状态与渠道配置。</div>
      ${accountCountLabel}

      ${hasMultipleAccounts
        ? html`
            <div class="account-card-list">
              ${wecomAccounts.map((account) => renderAccountCard(account))}
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

      ${renderChannelConfigSection({ channelId: "wecom", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>
          探测
        </button>
      </div>
    </div>
  `;
}
