---
name: iconify-icons
description: "Iconify 图标搜索与导入 Pencil 原型。USE WHEN: 需要找图标、搜索图标、导入图标到 Pencil、icon_font、Iconify、图标集选定、页面需要 icon"
---

# Iconify 图标搜索与导入

## ⚠️ 优先使用 Pencil 内置图标库

Pencil **原生内置**四套图标库，无需下载 SVG：

| 图标库 | 风格 | 适用场景 |
|--------|------|----------|
| Material Symbols | Material Design，最全面，Outlined/Rounded/Sharp | 通用 |
| Lucide Icons | 简洁线条风 | 通用轻量 |
| Feather | 极简线条 | 极简风格 |
| Phosphor | 现代轻量，6 种粗细 | 现代 App |

**图标库选定后写入 Style Guide，全站统一使用。**

> 如果 MCP `batch_design` 不支持 `icon_font` 节点类型，则回退到下方 Iconify + path 节点方案。
> 外部设计稿（MasterGo/Figma）的 SVG 图标导入应走 **script 节点** 而非 image fill，详见 `pencil-prototype` → 外部设计稿导入。

---

## Iconify 补充方案（当内置图标不满足或 MCP 不支持 icon_font 时）

Iconify 是开源图标集，收录 200+ 图标库、20 万+ 图标。

### 选图标三步法

### 1. 搜索图标

用 `web` 工具调用 Iconify 搜索 API：

```
GET https://api.iconify.design/search?query={关键词}&limit=10
```

返回 JSON，格式：

```json
{
  "icons": ["prefix:name", ...],
  "total": 100
}
```

### 2. 预览确认

- 从结果中筛选 3-5 个候选
- 用 `https://api.iconify.design/{prefix}/{name}.svg` 查看 SVG 效果
- 展示给用户选择

常用图标集推荐（按风格）：

| 图标集 | 前缀 | 风格 | 适用场景 |
|--------|------|------|----------|
| Material Symbols | `material-symbols` | Material Design，最全面 | 通用 |
| Phosphor | `ph` | 现代轻量，6 种粗细 | 现代 App |
| IBM Carbon | `carbon` | 企业级，严谨 | B2B / 后台 |
| Tabler | `tabler` | 线条风，简洁 | 仪表盘 |
| Lucide | `lucide` | 简洁常用 | 通用轻量 |

### 3. 导入 Pencil（⚠️ 推荐 script 节点，不要用 image fill）

**Pencil 对本地 SVG image fill 渲染不稳定（棋盘格），禁止用 `image` 节点填 SVG。**
正确做法：SVG → 解析 path d → script 节点，与 MasterGo/Figma 导入同一链路。

#### ✅ 推荐：script 节点（Code on Canvas）

```javascript
// 1. 下载 SVG 到本地
// Invoke-WebRequest -Uri 'https://api.iconify.design/{prefix}/{name}.svg' -OutFile 'assets/icons/xxx.svg'

// 2. Node.js 脚本：解析 SVG → 生成 Pencil .js script 文件
const fs = require('fs');
const svg = fs.readFileSync('assets/icons/xxx.svg', 'utf8');

// 提取 viewBox
const vb = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);

// 提取所有 path
const paths = [...svg.matchAll(/<path\b([^>]*)\/>/g)].map(m => {
  const d = (m[1].match(/d="([^"]+)"/) || [])[1];
  const fill = (m[1].match(/fill="([^"]+)"/) || [])[1];
  return { d, fill: fill || '#000' };
});

// 生成 script 文件
const script = `/** @schema 2.11 */
const viewBox = ${JSON.stringify(vb)};
return [
${paths.map((p, i) => `  { type: "path", name: "icon ${i+1}", x: 0, y: 0,
    width: pencil.width, height: pencil.height,
    viewBox: viewBox, geometry: ${JSON.stringify(p.d)},
    fill: ${JSON.stringify(p.fill)} }`).join(',\n')}
];`;
fs.writeFileSync('assets/scripts/icon.js', script);
```

```javascript
// 3. batch_design 插入 script 节点
Insert(page, { type: "script", script: "assets/scripts/icon.js", width: 24, height: 24 });
```

> 多处复用同一图标时，多个 script 节点可指向同一个 .js 文件，修改源文件全部同步。

#### 🔶 备选：手写 path 节点 DSL（简单图标可用）

仅适合单 path 的简单图标，多 path 图标强烈建议用上方 script 方案。

```javascript
// 实心图标（Phosphor、Remix Icon）
Insert(page, {type: "path", name: "icon", width: 24, height: 24, fill: "#色值", geometry: "M...", viewBox: [0,0,24,24]});

// 描边图标（Lucide）
Insert(page, {type: "path", name: "icon", width: 24, height: 24, fill: "none", stroke: "#色值", strokeWidth: 2, geometry: "M...", viewBox: [0,0,24,24]});
```

- Phosphor viewBox: `[0,0,256,256]` | Remix/Lucide viewBox: `[0,0,24,24]`
- 图标对比卡片建议用 script 节点，避免手写多 path 的 DSL 出错

> **iconfont 的 SVG 同理**：从 iconfont.cn 下载的 SVG 走同一 script 节点链路，不需要任何特殊处理。

## 图标集选定流程

1. 根据产品风格推荐 2-3 个匹配的图标集
2. 搜索 3-5 个该产品大概率会用的关键词图标
3. 展示各图标集同一关键词的渲染效果对比
4. 用户选定后固定为全站图标唯一来源
