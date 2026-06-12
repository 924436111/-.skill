const fs = require('fs');
const PEN_FILE = process.argv[2] || 'PRD/pencil-new.pen';
const raw = fs.readFileSync(PEN_FILE, 'utf8');
const parsed = JSON.parse(raw);
const data = parsed.children || (Array.isArray(parsed) ? parsed : [parsed]);

const KNOWN = {
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

const results = [];
function scan(node, page) {
  for (const prop of ['fill', 'stroke']) {
    const v = node[prop];
    if (v && typeof v === 'string' && v.startsWith('#') && !v.startsWith('$')) {
      const base = v.length <= 7 ? v : v.slice(0, 7);
      const suffix = v.length > 7 ? v.slice(7) : '';
      if (KNOWN[base]) results.push({id: node.id, name: node.name||'', prop, current: v, target: KNOWN[base]+suffix, page});
    }
  }
  if (node.fontFamily && node.fontFamily !== 'Inter') {
    results.push({id: node.id, name: node.name||'', prop: 'fontFamily', current: node.fontFamily, target: 'Inter', page});
  }
  if (Array.isArray(node.children)) {
    for (const c of node.children) if (c && typeof c === 'object') scan(c, page);
  }
}
for (const page of data) scan(page, page.name || page.id);

const seen = new Set();
const unique = results.filter(r => { const k=r.id+'|'+r.prop; if(seen.has(k)) return false; seen.add(k); return true; });

console.log('Total pages: ' + data.length);
console.log('Hardcoded found: ' + unique.length);

if (unique.length > 0) {
  const byPage = {};
  for (const r of unique) { if(!byPage[r.page]) byPage[r.page]=[]; byPage[r.page].push(r); }
  for (const [p, items] of Object.entries(byPage)) {
    console.log('--- ' + p + ' (' + items.length + ') ---');
    for (const i of items) console.log('  ' + i.id + ' ' + i.name + ' ' + i.prop + ': ' + i.current + ' -> ' + i.target);
  }
  // Generate fix batches
  const batches = [];
  for (let i = 0; i < unique.length; i += 30) {
    const chunk = unique.slice(i, i + 30);
    const lines = chunk.map(r => r.prop === 'fontFamily'
      ? `Update("${r.id}", {fontFamily: "${r.target}"});`
      : `Update("${r.id}", {${r.prop}: "${r.target}"});`);
    batches.push(lines.join('\n'));
  }
  if (!fs.existsSync('assets')) fs.mkdirSync('assets', {recursive: true});
  for (let i = 0; i < batches.length; i++) {
    fs.writeFileSync('assets/fix-batch-' + (i+1) + '.txt', batches[i]);
  }
  console.log('Generated ' + batches.length + ' fix batches');
  process.exit(1);
} else {
  console.log('ALL CLEAR - zero hardcoded');
  process.exit(0);
}
