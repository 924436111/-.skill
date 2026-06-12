const fs = require('fs');

const PEN_FILE = 'PRD/pencil-new.pen';
const BACKUP_FILE = 'PRD/pencil-new.pen.bak';

const COLOR_MAP = {
  '#21DBB020': '$color-primary-subtle', '#21DBB030': '$color-primary-subtle',
  '#21DBB010': '$color-primary-subtle', '#21DBB015': '$color-primary-subtle',
  '#21DBB0': '$color-primary',
  '#4A3728': '$color-text-primary',
  '#8B7355': '$color-text-secondary',
  '#C4B5A5': '$color-text-muted',
  '#FDFBF7': '$color-bg-page',
  '#E8E0D5': '$color-border',
  '#EF444440': '$color-danger-subtle', '#EF444430': '$color-danger-subtle',
  '#EF444420': '$color-danger-subtle', '#EF444410': '$color-danger-subtle',
  '#EF4444': '$color-danger',
  '#F59E4B40': '$color-warning-subtle', '#F59E4B20': '$color-warning-subtle',
  '#F59E4B10': '$color-warning-subtle', '#F59E4B': '$color-warning',
  '#D4A574': '$color-secondary',
  '#FFFFFF08': '$color-bg-card-subtle', '#FFFFFF05': '$color-bg-card-subtle',
  '#FFFFFF02': '$color-bg-card-subtle', '#FFFFFF': '$color-bg-card',
};

const sorted = Object.entries(COLOR_MAP).sort((a, b) => b[0].length - a[0].length);

function replaceColor(val) {
  if (typeof val !== 'string' || val.startsWith('$')) return val;
  for (const [hex, v] of sorted) {
    if (val.toUpperCase() === hex.toUpperCase()) return v;
  }
  return val;
}

function processNode(node) {
  if (!node || typeof node !== 'object') return;
  if (typeof node.fill === 'string') node.fill = replaceColor(node.fill);
  if (typeof node.stroke === 'string') node.stroke = replaceColor(node.stroke);
  if (node.fontFamily && node.fontFamily !== 'Inter') node.fontFamily = 'Inter';
  if (Array.isArray(node.children)) {
    for (const c of node.children) processNode(c);
  }
}

function countHardcoded(node) {
  let n = 0;
  if (!node || typeof node !== 'object') return 0;
  for (const p of ['fill', 'stroke']) {
    if (typeof node[p] === 'string' && node[p].startsWith('#') && !node[p].startsWith('$')) n++;
  }
  if (node.fontFamily && node.fontFamily !== 'Inter') n++;
  if (Array.isArray(node.children)) {
    for (const c of node.children) n += countHardcoded(c);
  }
  return n;
}

// Read
console.log('Reading ' + PEN_FILE + '...');
const raw = fs.readFileSync(PEN_FILE, 'utf8');
const data = JSON.parse(raw);
fs.writeFileSync(BACKUP_FILE, raw);
console.log('Backup saved');

const pages = data.children || [];
console.log('Pages: ' + pages.length);

// Count before
let before = 0;
for (const p of pages) before += countHardcoded(p);
console.log('Hardcoded before: ' + before);

// Fix
for (const p of pages) processNode(p);

// Count after
let after = 0;
for (const p of pages) after += countHardcoded(p);
console.log('Hardcoded after: ' + after);
console.log('Replaced: ' + (before - after));

// Write
fs.writeFileSync(PEN_FILE, JSON.stringify(data));
console.log('Written. Exit code: ' + (after > 0 ? 1 : 0));
process.exit(after > 0 ? 1 : 0);
