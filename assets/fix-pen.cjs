const fs = require('fs');
const path = require('path');

const PEN_FILE = 'PRD/pencil-new.pen';
const BACKUP_FILE = 'PRD/pencil-new.pen.bak';

// Color mapping: hex -> variable name
const COLOR_MAP = {
  '#21DBB020': '$color-primary-subtle',
  '#21DBB030': '$color-primary-subtle',
  '#21DBB010': '$color-primary-subtle',
  '#21DBB015': '$color-primary-subtle',
  '#21DBB0': '$color-primary',
  '#4A3728': '$color-text-primary',
  '#8B7355': '$color-text-secondary',
  '#C4B5A5': '$color-text-muted',
  '#FDFBF7': '$color-bg-page',
  '#E8E0D5': '$color-border',
  '#EF444440': '$color-danger-subtle',
  '#EF444430': '$color-danger-subtle',
  '#EF444420': '$color-danger-subtle',
  '#EF444410': '$color-danger-subtle',
  '#EF4444': '$color-danger',
  '#F59E4B40': '$color-warning-subtle',
  '#F59E4B20': '$color-warning-subtle',
  '#F59E4B10': '$color-warning-subtle',
  '#F59E4B': '$color-warning',
  '#D4A574': '$color-secondary',
  '#FFFFFF08': '$color-bg-card-subtle',
  '#FFFFFF05': '$color-bg-card-subtle',
  '#FFFFFF02': '$color-bg-card-subtle',
  '#FFFFFF': '$color-bg-card',
};

// Sort by length descending so longer (more specific) matches first
const sortedEntries = Object.entries(COLOR_MAP).sort((a, b) => b[0].length - a[0].length);

function replaceColor(val) {
  if (typeof val !== 'string') return val;
  if (val.startsWith('$')) return val; // already a variable
  for (const [hex, varName] of sortedEntries) {
    if (val.toUpperCase() === hex.toUpperCase()) return varName;
  }
  return val;
}

function processNode(node) {
  if (!node || typeof node !== 'object') return;
  
  // Replace fill
  if (node.fill && typeof node.fill === 'string') {
    node.fill = replaceColor(node.fill);
  }
  
  // Replace stroke (only if string, not object)
  if (node.stroke && typeof node.stroke === 'string') {
    node.stroke = replaceColor(node.stroke);
  }
  
  // Replace fontFamily
  if (node.fontFamily && node.fontFamily !== 'Inter') {
    node.fontFamily = 'Inter';
  }
  
  // Recurse into gradient colors
  if (node.fill && typeof node.fill === 'object' && node.fill.colors) {
    for (const c of node.fill.colors) {
      if (c.color) c.color = replaceColor(c.color);
    }
  }
  
  // Recurse into effects (shadows)
  if (node.effect) {
    const effects = Array.isArray(node.effect) ? node.effect : [node.effect];
    for (const e of effects) {
      if (e.color) e.color = replaceColor(e.color);
    }
  }
  
  // Recurse children
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      if (child && typeof child === 'object') processNode(child);
    }
  }
}

// Main
console.log(`Reading ${PEN_FILE}...`);
const raw = fs.readFileSync(PEN_FILE, 'utf8');
const data = JSON.parse(raw);

// Backup
fs.writeFileSync(BACKUP_FILE, raw);
console.log(`Backup saved to ${BACKUP_FILE}`);

// Process
let count = 0;
function countAndProcess(node) {
  if (!node || typeof node !== 'object') return;
  for (const prop of ['fill', 'stroke']) {
    if (node[prop] && typeof node[prop] === 'string' && !node[prop].startsWith('$')) {
      const replaced = replaceColor(node[prop]);
      if (replaced !== node[prop]) count++;
    }
  }
  if (node.fontFamily && node.fontFamily !== 'Inter') count++;
  if (Array.isArray(node.children)) {
    for (const c of node.children) if (c && typeof c === 'object') countAndProcess(c);
  }
}
for (const page of data) countAndProcess(page);
console.log(`Will replace ${count} values`);

// Apply
for (const page of data) processNode(page);

// Write
fs.writeFileSync(PEN_FILE, JSON.stringify(data));
console.log(`Written to ${PEN_FILE}`);

// Verify
const verify = JSON.parse(fs.readFileSync(PEN_FILE, 'utf8'));
let remaining = 0;
function verifyNode(node) {
  if (!node || typeof node !== 'object') return;
  for (const prop of ['fill', 'stroke']) {
    if (node[prop] && typeof node[prop] === 'string' && node[prop].startsWith('#') && !node[prop].startsWith('$')) {
      remaining++;
    }
  }
  if (node.fontFamily && node.fontFamily !== 'Inter') remaining++;
  if (Array.isArray(node.children)) {
    for (const c of node.children) if (c && typeof c === 'object') verifyNode(c);
  }
}
for (const page of verify) verifyNode(page);
console.log(`Remaining hardcoded: ${remaining}`);
process.exit(remaining > 0 ? 1 : 0);
