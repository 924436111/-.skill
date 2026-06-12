const fs = require('fs');
const PEN_FILE = 'PRD/pencil-new.pen';

// Exact match map
const EXACT = {
  '#21DBB0': '$color-primary', '#4A3728': '$color-text-primary',
  '#8B7355': '$color-text-secondary', '#C4B5A5': '$color-text-muted',
  '#FFFFFF': '$color-bg-card', '#FDFBF7': '$color-bg-page',
  '#E8E0D5': '$color-border', '#EF4444': '$color-danger',
  '#F59E4B': '$color-warning', '#D4A574': '$color-secondary',
  '#000000': '$color-black', '#CBD5E1': '$color-gray-300',
  '#A5B4FC': '$color-indigo-300',
};

// Build lookup: for any #RRGGBBXX, find the base and map to base-subtle
function lookup(hex) {
  if (typeof hex !== 'string' || hex.startsWith('$')) return hex;
  const upper = hex.toUpperCase();
  // Exact match
  if (EXACT[upper]) return EXACT[upper];
  // Check if it's a base + alpha (length 9 = #RRGGBBAA)
  if (upper.length === 9) {
    const base = upper.slice(0, 7);
    if (EXACT[base]) return EXACT[base] + '-subtle';
  }
  return hex;
}

function fix(n) {
  if (!n || typeof n !== 'object') return;
  if (typeof n.fill === 'string') n.fill = lookup(n.fill);
  else if (n.fill && typeof n.fill === 'object' && Array.isArray(n.fill.colors)) {
    for (const c of n.fill.colors) if (c && typeof c.color === 'string') c.color = lookup(c.color);
  }
  if (typeof n.stroke === 'string') n.stroke = lookup(n.stroke);
  if (n.fontFamily && n.fontFamily !== 'Inter') n.fontFamily = 'Inter';
  if (n.effect) {
    const fx = Array.isArray(n.effect) ? n.effect : [n.effect];
    for (const e of fx) if (e && typeof e.color === 'string') e.color = lookup(e.color);
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

fs.writeFileSync(PEN_FILE, JSON.stringify(data));
process.exit(after > 0 ? 1 : 0);
