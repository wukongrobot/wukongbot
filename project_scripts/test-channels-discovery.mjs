#!/usr/bin/env node
/**
 * 测试国产频道插件发现
 */

import { discoverMoltbotPlugins } from './dist/plugins/discovery.js';
import { listChannelPluginCatalogEntries } from './dist/channels/plugins/catalog.js';

console.log('🐵 悟空Bot - 频道插件发现测试');
console.log('================================\n');

// 1. 发现所有插件
console.log('📦 发现所有 Moltbot 插件...');
const discovery = discoverMoltbotPlugins({ workspaceDir: process.cwd() });
console.log(`   找到 ${discovery.candidates.length} 个插件候选\n`);

// 2. 列出频道插件
console.log('📱 频道插件目录:');
const catalogEntries = listChannelPluginCatalogEntries({ workspaceDir: process.cwd() });
console.log(`   找到 ${catalogEntries.length} 个频道插件\n`);

// 3. 显示详细信息
if (catalogEntries.length > 0) {
  console.log('📋 频道列表:\n');
  
  const chinaChannels = catalogEntries.filter(entry => 
    ['feishu', 'wecom', 'dingtalk'].includes(entry.id)
  );
  
  const otherChannels = catalogEntries.filter(entry => 
    !['feishu', 'wecom', 'dingtalk'].includes(entry.id)
  );
  
  // 国产频道
  if (chinaChannels.length > 0) {
    console.log('🇨🇳 国产频道:');
    for (const entry of chinaChannels) {
      console.log(`   ✅ ${entry.meta.label} (${entry.id})`);
      console.log(`      描述: ${entry.meta.blurb}`);
      console.log(`      排序: ${entry.meta.order ?? '未设置'}`);
      console.log(`      本地路径: ${entry.install.localPath ?? '无'}`);
      console.log('');
    }
  }
  
  // 其他频道
  if (otherChannels.length > 0) {
    console.log('🌐 其他频道:');
    for (const entry of otherChannels) {
      console.log(`   • ${entry.meta.label} (${entry.id})`);
    }
    console.log('');
  }
}

// 4. 检查关键信息
console.log('🔍 检查结果:\n');

const hasFeishu = catalogEntries.some(e => e.id === 'feishu');
const hasWecom = catalogEntries.some(e => e.id === 'wecom');
const hasDingtalk = catalogEntries.some(e => e.id === 'dingtalk');

console.log(`   飞书 (feishu):     ${hasFeishu ? '✅ 已发现' : '❌ 未找到'}`);
console.log(`   企业微信 (wecom):   ${hasWecom ? '✅ 已发现' : '❌ 未找到'}`);
console.log(`   钉钉 (dingtalk):   ${hasDingtalk ? '✅ 已发现' : '❌ 未找到'}`);
console.log('');

if (hasFeishu && hasWecom && hasDingtalk) {
  console.log('🎉 所有国产频道已成功发现！');
  console.log('');
  console.log('现在运行 `pnpm wukongbot onboard` 应该能看到这些频道选项。');
} else {
  console.log('⚠️  有频道未被发现，请检查 package.json 中的 moltbot 配置。');
}

console.log('');
