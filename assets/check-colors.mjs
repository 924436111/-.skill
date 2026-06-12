// 用法: node check-colors.mjs
// 功能: 从 .pen 文件实时拉取全部节点，扫描硬编码色值，输出报告

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

// 从 Pencil MCP 拉取全量数据的辅助函数
// 实际使用时通过 batch_get(readDepth:5) 获取完整树

const KNOWN_COLORS = {
  '#21DBB0': '$color-primary',
  '#4A3728': '$color-text-primary',
  '#8B7355': '$color-text-secondary',
  '#C4B5A5': '$color-text-muted',
  '#FFFFFF': '$color-bg-card',
  '#FDFBF7': '$color-bg-page',
  '#E8E0D5': '$color-border',
  '#EF4444': '$color-danger',
  '#F59E4B': '$color-warning',
  '#D4A574': '$color-secondary',
};

// 递归扫描节点树
function scan(node, results, pageName) {
  // 检查 fill
  if (node.fill && typeof node.fill === 'string' && node.fill.startsWith('#') && !node.fill.startsWith('$')) {
    const base = node.fill.length <= 7 ? node.fill : node.fill.slice(0, 7);
    const suffix = node.fill.length > 7 ? node.fill.slice(7) : '';
    if (KNOWN_COLORS[base]) {
      results.push({
        id: node.id,
        name: node.name || '(unnamed)',
        prop: 'fill',
        current: node.fill,
        target: KNOWN_COLORS[base] + suffix,
        page: pageName,
      });
    }
  }
  // 检查 stroke
  if (node.stroke && typeof node.stroke === 'string' && node.stroke.startsWith('#') && !node.stroke.startsWith('$')) {
    const base = node.stroke.length <= 7 ? node.stroke : node.stroke.slice(0, 7);
    const suffix = node.stroke.length > 7 ? node.stroke.slice(7) : '';
    if (KNOWN_COLORS[base]) {
      results.push({
        id: node.id,
        name: node.name || '(unnamed)',
        prop: 'stroke',
        current: node.stroke,
        target: KNOWN_COLORS[base] + suffix,
        page: pageName,
      });
    }
  }
  // 检查 fontFamily
  if (node.fontFamily && node.fontFamily !== 'Inter') {
    results.push({
      id: node.id,
      name: node.name || '(unnamed)',
      prop: 'fontFamily',
      current: node.fontFamily,
      target: 'Inter',
      page: pageName,
    });
  }
  // 递归子节点
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      if (typeof child === 'object') scan(child, results, pageName);
    }
  }
}

// 主函数：读取 JSON 并扫描
function main() {
  // 从 stdin 或文件读取数据
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error('Usage: node check-colors.mjs <batch-get-output.json>');
    process.exit(1);
  }

  const data = JSON.parse(require('fs').readFileSync(inputFile, 'utf8'));
  const results = [];

  for (const page of data) {
    scan(page, results, page.name || page.id);
  }

  // 去重
  const seen = new Set();
  const unique = results.filter(r => {
    const k = r.id + '|' + r.prop;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // 输出报告
  console.log(`\n=== 扫描报告 ===`);
  console.log(`总节点数: ${data.length} 页`);
  console.log(`发现硬编码: ${unique.length} 处\n`);

  if (unique.length > 0) {
    // 按页面分组
    const byPage = {};
    for (const r of unique) {
      if (!byPage[r.page]) byPage[r.page] = [];
      byPage[r.page].push(r);
    }
    for (const [page, items] of Object.entries(byPage)) {
      console.log(`📄 ${page} (${items.length} 处)`);
      for (const item of items) {
        console.log(`  ${item.id} ${item.name} ${item.prop}: ${item.current} → ${item.target}`);
      }
    }

    // 生成 batch_design 修复脚本
    const batches = [];
    for (let i = 0; i < unique.length; i += 30) {
      const chunk = unique.slice(i, i + 30);
      const lines = chunk.map(r => {
        if (r.prop === 'fontFamily') {
          return `Update("${r.id}", {fontFamily: "${r.target}"});`;
        }
        return `Update("${r.id}", {${r.prop}: "${r.target}"});`;
      });
      batches.push(lines.join('\n'));
    }

    if (!existsSync('assets')) mkdirSync('assets');
    for (let i = 0; i < batches.length; i++) {
      writeFileSync(`assets/fix-batch-${i + 1}.txt`, batches[i]);
    }
    console.log(`\n已生成 ${batches.length} 个修复批次到 assets/fix-batch-*.txt`);
  } else {
    console.log('✅ 零硬编码，全部通过！');
  }

  // 退出码：0=通过，1=有遗漏
  process.exit(unique.length > 0 ? 1 : 0);
}

main();
