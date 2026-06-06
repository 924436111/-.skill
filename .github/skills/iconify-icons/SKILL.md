---
name: iconify-icons
description: "Iconify 图标搜索与导入 Pencil 原型。USE WHEN: 需要找图标、搜索图标、导入图标到 Pencil、icon_font、Iconify、图标集选定、页面需要 icon"
---

# Iconify 图标搜索与导入

Iconify 是开源图标集，收录 200+ 图标库、20 万+ 图标。

## 选图标三步法

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

### 3. 导入 Pencil

Pencil batch_design **不支持** `icon_font`、`image` 节点类型，只能用 `path` 节点。

**正确流程**：
1. 下载 SVG：`Invoke-WebRequest -Uri 'https://api.iconify.design/{prefix}/{name}.svg' -OutFile 'xxx.svg'`
2. `read_file` 读取 SVG 文件，提取 `<path d="...">` 中的 d 属性值
3. 在 `batch_design` 中用 `path` 节点画：

```javascript
// 实心图标（Phosphor、Remix Icon）
Insert(page, {type: "path", name: "icon", width: 24, height: 24, fill: "#色值", geometry: "M...", viewBox: [0,0,24,24]});

// 描边图标（Lucide）
Insert(page, {type: "path", name: "icon", width: 24, height: 24, fill: "none", stroke: "#色值", strokeWidth: 2, geometry: "M...", viewBox: [0,0,24,24]});
```

- Phosphor viewBox: `[0,0,256,256]` | Remix/Lucide viewBox: `[0,0,24,24]`
- **图标对比卡片**：左 Phosphor（紫）右 Lucide（青），48×48 path 节点，一行一组对比选定

## 图标集选定流程

1. 根据产品风格推荐 2-3 个匹配的图标集
2. 搜索 3-5 个该产品大概率会用的关键词图标
3. 展示各图标集同一关键词的渲染效果对比
4. 用户选定后固定为全站图标唯一来源
