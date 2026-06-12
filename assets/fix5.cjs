const fs = require('fs');
const PEN_FILE = 'PRD/pencil-new.pen';

// ONLY map to variables that actually exist in .pen
const EXACT = {
  '#21DBB0': '$color-primary', '#4A3728': '$color-text-primary',
  '#8B7355': '$color-text-secondary', '#C4B5A5': '$color-text-muted',
  '#FFFFFF': '$color-bg-card', '#FDFBF7': '$color-bg-page',
  '#E8E0D5': '$color-border', '#EF4444': '$color-danger',
  '#F59E4B': '$color-warning', '#D4A574': '$color-secondary',
  '#000000': '$color-black', '#CBD5E1': '$color-gray-300',
  '#A5B4FC': '$color-indigo-300',
  '#21DBB020': '$color-primary-subtle', '#21DBB030': '$color-primary-subtle5',
  '#21DBB010': '$color-primary-subtle3', '#21DBB015': '$color-primary-subtle4',
  '#21DBB008': '$color-primary-subtle2', '#21DBB040': '$color-primary-subtle6',
  '#21DBB060': '$color-primary-subtle7', '#21DBB0FF': '$color-primary-opaque',
  '#EF444440': '$color-danger-subtle5', '#EF444430': '$color-danger-subtle4',
  '#EF444420': '$color-danger-subtle3', '#EF444410': '$color-danger-subtle',
  '#EF444415': '$color-danger-subtle2',
  '#F59E4B40': '$color-warning-subtle', '#F59E4B20': '$color-warning-subtle4',
  '#F59E4B10': '$color-warning-subtle2', '#F59E4B15': '$color-warning-subtle3',
  '#FFFFFF08': '$color-bg-card-subtle', '#FFFFFF05': '$color-bg-card-subtle2',
  '#FFFFFF02': '$color-bg-card-subtle3', '#FFFFFF06': '$color-bg-card-subtle4',
  '#FFFFFF10': '$color-bg-card-subtle5', '#FFFFFF15': '$color-bg-card-subtle6',
  '#FFFFFF80': '$color-bg-card-subtle7', '#FFFFFF00': '$color-bg-card-subtle8',
  '#FDFBF7CC': '$color-bg-page-subtle', '#00000000': '$color-black-subtle',
  '#D4A57412': '$color-secondary-subtle2', '#D4A57410': '$color-secondary-subtle',
  '#D4A57408': '$color-secondary-subtle', '#D4A57440': '$color-secondary-subtle4',
  '#D4A57430': '$color-secondary-subtle3',
  '#C4B5A520': '$color-text-muted-subtle', '#C4B5A540': '$color-text-muted-subtle2',
  '#8B735580': '$color-text-secondary-subtle', '#E8E0D580': '$color-border-subtle',
};

const sorted = Object.entries(EXACT).sort((a, b) => b[0].length - a[0].length);

function rc(val) {
  if (typeof val !== 'string' || val.startsWith('$')) return val;
  const upper = val.toUpperCase();
  for (const [hex, v] of sorted) {
    if (upper === hex.toUpperCase()) return v;
  }
  return val;
}

function fix(n) {
  if (!n || typeof n !== 'object') return;
  if (typeof n.fill === 'string') n.fill = rc(n.fill);
  else if (n.fill && typeof n.fill === 'object' && Array.isArray(n.fill.colors)) {
    for (const c of n.fill.colors) if (c && typeof c.color === 'string') c.color = rc(c.color);
  }
  if (typeof n.stroke === 'string') n.stroke = rc(n.stroke);
  if (n.fontFamily && n.fontFamily !== 'Inter') n.fontFamily = 'Inter';
  if (n.effect) {
    const fx = Array.isArray(n.effect) ? n.effect : [n.effect];
    for (const e of fx) if (e && typeof e.color === 'string') e.color = rc(e.color);
  }
  if (Array.isArray(n.children)) for (const c of n.children) fix(c);
}

function countHex(n) {
  let c = 0;
  if (!n || typeof n !== 'object') return 0;
  for (const p of ['fill', 'stroke']) {
    if (typeof n[p] === 'string' && n[p].startsWith('#') && !n[p].startsWith('$')) c++;
  }
  if (n.fontFamily && n.fontFamily !== 'Inter') c++;
  if (Array.isArray(n.children)) for (const ch of n.children) c += countHex(ch);
  return c;
}

const raw = fs.readFileSync(PEN_FILE, 'utf8');
const data = JSON.parse(raw);
const pages = data.children || [];

let before = 0;
for (const p of pages) before += countHex(p);
console.log('Before: ' + before);

for (const p of pages) fix(p);

let after = 0;
for (const p of pages) after += countHex(p);
console.log('After: ' + after);
console.log('Fixed: ' + (before - after));

// List any remaining unmatched
const unmatched = new Set();
function findUnmatched(n) {
  if (!n || typeof n !== 'object') return;
  for (const p of ['fill', 'stroke']) {
    if (typeof n[p] === 'string' && n[p].startsWith('#') && !n[p].startsWith('$')) unmatched.add(n[p]);
  }
  if (Array.isArray(n.children)) for (const ch of n.children) findUnmatched(ch);
}
for (const p of pages) findUnmatched(p);
if (unmatched.size > 0) {
  console.log('Unmatched colors:');
  for (const c of unmatched) console.log('  ' + c);
}

fs.writeFileSync(PEN_FILE, JSON.stringify(data));
process.exit(after > 0 ? 1 : 0);
