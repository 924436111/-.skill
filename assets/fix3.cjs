const fs = require('fs');
const PEN_FILE = 'PRD/pencil-new.pen';

// Generate alpha variants for all base colors
const BASE_COLORS = {
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
  '#000000': '$color-black',
  '#CBD5E1': '$color-gray-300',
  '#A5B4FC': '$color-indigo-300',
};

// Build full map with all alpha variants
const COLOR_MAP = {};
for (const [hex, v] of Object.entries(BASE_COLORS)) {
  COLOR_MAP[hex.toUpperCase()] = v;
  // Generate all 2-char alpha variants
  for (let a = 1; a < 255; a++) {
    const alpha = a.toString(16).padStart(2, '0').toUpperCase();
    COLOR_MAP[(hex + alpha).toUpperCase()] = v + '-subtle';
  }
  // Also handle FF suffix
  COLOR_MAP[(hex + 'FF').toUpperCase()] = v;
}
// Special overrides for known subtle mappings
COLOR_MAP['#21DBB020'] = '$color-primary-subtle';
COLOR_MAP['#21DBB030'] = '$color-primary-subtle';
COLOR_MAP['#21DBB010'] = '$color-primary-subtle';
COLOR_MAP['#21DBB015'] = '$color-primary-subtle';
COLOR_MAP['#21DBB008'] = '$color-primary-subtle';
COLOR_MAP['#21DBB040'] = '$color-primary-subtle';
COLOR_MAP['#21DBB060'] = '$color-primary-subtle';
COLOR_MAP['#EF444440'] = '$color-danger-subtle';
COLOR_MAP['#EF444430'] = '$color-danger-subtle';
COLOR_MAP['#EF444420'] = '$color-danger-subtle';
COLOR_MAP['#EF444410'] = '$color-danger-subtle';
COLOR_MAP['#EF444415'] = '$color-danger-subtle';
COLOR_MAP['#EF444408'] = '$color-danger-subtle';
COLOR_MAP['#F59E4B40'] = '$color-warning-subtle';
COLOR_MAP['#F59E4B20'] = '$color-warning-subtle';
COLOR_MAP['#F59E4B10'] = '$color-warning-subtle';
COLOR_MAP['#F59E4B15'] = '$color-warning-subtle';
COLOR_MAP['#FFFFFF08'] = '$color-bg-card-subtle';
COLOR_MAP['#FFFFFF05'] = '$color-bg-card-subtle';
COLOR_MAP['#FFFFFF02'] = '$color-bg-card-subtle';
COLOR_MAP['#FFFFFF06'] = '$color-bg-card-subtle';
COLOR_MAP['#FFFFFF10'] = '$color-bg-card-subtle';
COLOR_MAP['#FFFFFF15'] = '$color-bg-card-subtle';
COLOR_MAP['#FFFFFF80'] = '$color-bg-card-subtle';
COLOR_MAP['#FFFFFF00'] = '$color-bg-card-subtle';
COLOR_MAP['#FDFBF7CC'] = '$color-bg-page-subtle';
COLOR_MAP['#00000000'] = '$color-black-subtle';
COLOR_MAP['#D4A57412'] = '$color-secondary-subtle';
COLOR_MAP['#D4A57410'] = '$color-secondary-subtle';
COLOR_MAP['#D4A57408'] = '$color-secondary-subtle';
COLOR_MAP['#D4A57440'] = '$color-secondary-subtle';
COLOR_MAP['#D4A57430'] = '$color-secondary-subtle';
COLOR_MAP['#C4B5A520'] = '$color-text-muted-subtle';
COLOR_MAP['#C4B5A540'] = '$color-text-muted-subtle';
COLOR_MAP['#8B735580'] = '$color-text-secondary-subtle';
COLOR_MAP['#E8E0D580'] = '$color-border-subtle';
COLOR_MAP['#21DBB0FF'] = '$color-primary';

const sorted = Object.entries(COLOR_MAP).sort((a, b) => b[0].length - a[0].length);

function rc(val) {
  if (typeof val !== 'string' || val.startsWith('$')) return val;
  const upper = val.toUpperCase();
  for (const [hex, v] of sorted) {
    if (upper === hex) return v;
  }
  return val;
}

function fix(n) {
  if (!n || typeof n !== 'object') return;
  if (typeof n.fill === 'string') n.fill = rc(n.fill);
  else if (n.fill && typeof n.fill === 'object') fixFill(n.fill);
  if (typeof n.stroke === 'string') n.stroke = rc(n.stroke);
  if (n.fontFamily && n.fontFamily !== 'Inter') n.fontFamily = 'Inter';
  if (n.effect) {
    const fx = Array.isArray(n.effect) ? n.effect : [n.effect];
    for (const e of fx) { if (e && typeof e.color === 'string') e.color = rc(e.color); }
  }
  if (Array.isArray(n.children)) for (const c of n.children) fix(c);
}

function fixFill(fill) {
  if (!fill || typeof fill !== 'object') return;
  if (fill.color && typeof fill.color === 'string') fill.color = rc(fill.color);
  if (Array.isArray(fill.colors)) {
    for (const c of fill.colors) {
      if (c && typeof c.color === 'string') c.color = rc(c.color);
    }
  }
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
