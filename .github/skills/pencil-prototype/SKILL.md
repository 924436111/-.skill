---
name: pencil-prototype
description: "Pencil 原型绘制、自校验、外部设计稿导入与截图验证。USE WHEN: 画原型、Pencil、batch_design、snapshot_layout、自校验、布局修复、导出截图、原型验证、页面绘制、设计校验、修改已有页面、修改图表、新增子页面、添加状态页、重建页面、调整曲线、新增弹窗、复制父页面、MasterGo导入、Figma导入、SVG导入、script节点、Code on Canvas"
---

# Pencil 原型绘制与自校验

## 前置

1. 调用 `mcp_pencil_get_editor_state` 获取编辑器状态和 schema
2. 读取项目的 Style Guide `.pen` 文件获取配色和组件规范
3. **所有色值、字号、圆角、间距必须严格引用变量，不得硬编码**
4. **同步规则：子页面改动风格或新增组件后，必须同步更新 Style Guide 中对应组件**（如 stroke/fill/effect 语法变更、新增卡片样式等）
5. **用 `mcp_pencil_get_variables` 读取当前项目的变量名和值，以 .pen 文件为准**
6. **变量名推荐统一命名约定**：`$color-{用途}`、`$spacing-{级别}`，便于跨项目理解

### 变量命名约定（推荐，非强制）

项目应在 Style Guide `.pen` 中通过 `mcp_pencil_set_variables` 定义变量。推荐命名模式：

**配色**：`$color-bg-page`、`$color-bg-card`、`$color-primary`、`$color-text-primary`、`$color-text-secondary`、`$color-border`、`$color-danger` 等

**间距**：`$spacing-xs`(4)、`sm`(8)、`md`(12)、`lg`(16)、`xl`(20)、`2xl`(24) 等

用法：`fill: "$color-primary"`，`gap: "$spacing-md"`。AI 每次操作前用 `mcp_pencil_get_variables` 读取当前项目的实际值。

---

## ⚠️ 交付规范（确保 .pen 可被开发直接消费）

设计师交付的 `.pen` 文件必须满足以下三项，开发侧才能用 AI 一键生成代码：

### 变量化：禁止硬编码色值
- 所有 `fill`/`stroke`/`color` 必须引用 `$变量`（如 `"$color-primary"`）
- 间距用变量体系：`$spacing-xs`(4) / `sm`(8) / `md`(12) / `lg`(16) / `xl`(20) / `2xl`(24)
- 变量通过 `mcp_pencil_set_variables` 写入 .pen 文件

### 组件化：重复模块标记 reusable
- 卡片、按钮、导航栏等重复 UI 必须设 `reusable:true`
- 可变内容区域用 `slots` 定义，标记为 `"Make a slot"`
- Style Guide 中列出所有组件 ID 供开发引用

**Slots 创建规则**（Pencil 官方要求）：
- 只能在组件原点（origin）的空 frame 上创建 slot
- 在 Pencil UI 中选中空 frame → 点击属性面板顶部 `"Make a slot"`
- Slot 在画布上显示为斜线区域
- 可设置 `suggested slot components` 指定该 slot 允许放入的组件类型
- batch_design 中引用 slot：`parent + "/slotId"`

### 结构化：优先 flexbox 布局
- 页面级布局用 `layout:"vertical"` / `"horizontal"`，避免 `layout:"none"` + 手动 x/y
- 用 `width:"fill_container"` / `height:"fit_content"` 而非硬编码尺寸
- 显式声明 `gap` 和 `padding`

> 详见 `工作流约定.md` → 设计交付规范

### 组件搜索前置：插入前必须先搜索（来自 chiroro-jr/pencil-design-skill Rule 1）

**插入任何元素前，必须先搜索已有 reusable 组件：**

1. `mcp_pencil_batch_get` with `patterns: [{reusable: true}]` 列出所有可用组件
2. 找到匹配的组件 → 用 `type: "ref", ref: "<componentId>"` 插入实例
3. 通过 `Update(instanceId + "/childId", {...})` 定制实例内容
4. 只有没有匹配组件时才从头创建

**同理，插入图片/Logo 前必须先搜索已有资源：**

1. `mcp_pencil_batch_get` with `patterns: [{name: "logo|brand|icon|image"}]`
2. 如果文档中已有 → 用 `Insert(目标位置, {type: "ref", ref: "已有节点ID"})` 复制
3. 只有文档中完全没有时才生成新资源

### 溢出防止：每个区块插入内容后必须检查（来自 chiroro-jr/pencil-design-skill Rule 3）

**每个逻辑区块（header、card、footer 等）插入内容后：**

1. 设置文字 `width: "fill_container"` + `textGrowth: "fixed-width"` 防止文字溢出
2. 约束宽度不超过父容器，特别是手机屏幕（390px）
3. `mcp_pencil_snapshot_layout` with `problemsOnly: true` 检查裁剪/溢出
4. 修复所有问题后再进入下一个区块

### 常见错误速查（来自 chiroro-jr/pencil-design-skill）

| 错误 | 正确做法 |
|------|---------|
| 从头创建按钮/卡片 | 先搜索 reusable 组件，用 ref 插入 |
| `fill: "#21DBB0"` | 用变量：`fill: "$color-primary"` |
| `cornerRadius: 8` | 用变量或统一值 |
| 插入文字后不检查溢出 | 每个区块后 `snapshot_layout(problemsOnly: true)` |
| 从头生成 Logo | 搜索文档中已有 Logo，复制使用 |
| 跳过截图验证 | 每个区块后 `get_screenshot` 确认 |
| 硬编码宽高 | 用 `fill_container` / `fit_content` |

---

## 外部设计稿导入 Pencil（高还原度）

从 MasterGo / Figma 等外部设计工具导入到 Pencil 时，必须走 **SVG path → Script 节点** 链路，否则还原度极低。

### ❌ 两条死路（已验证失败）

| 方法 | 结果 | 根因 |
|------|------|------|
| 手工近似复刻 | 还原度低，坐标/字重/间距全错 | 人眼无法精确匹配 DSL 数据 |
| SVG 作为 `image` fill 填入 | 棋盘格 / 渲染不稳定 | Pencil 对本地 SVG image fill 支持不完善 |

### ✅ 正确链路：MCP SVG → Script 节点

```
MCP 拉取设计稿 SVG
  → 解析 <path d="..."> 提取 path data
  → 生成 Pencil .js script 文件（Code on Canvas）
  → batch_design 插入 script 节点
  → Pencil 原生渲染，可编辑
```

### 详细步骤

**1. 拉取数据**
- 用 MasterGo MCP 的 `extract-svg` 拿整页/组件级 SVG
- 用 MasterGo MCP 的 DSL 接口拿精确坐标/字重/间距

**2. 解析 SVG → Script 文件**

```javascript
// 核心逻辑：从 SVG 提取 path 节点，生成 Pencil script
const fs = require('fs');
let raw = fs.readFileSync('mastergo-extract-xxx.svg', 'utf8')
  .replace(/^\uFEFF/, '');  // ⚠️ 必须清 BOM，否则 JSON.parse 报错
const data = JSON.parse(raw);

function paths(svg) {
  const out = [];
  const re = /<path\b([^>]*)>/g;
  let m;
  while ((m = re.exec(svg))) {
    const d = (m[1].match(/d="([^"]+)"/) || [])[1];
    const fill = (m[1].match(/fill="([^"]+)"/) || [])[1];
    if (!d) continue;
    out.push({ d, fill: fill || '#1D1F25' });
  }
  return out;
}

// 生成 Pencil script 文件
const script = `/** @schema 2.11 */
const viewBox = ${JSON.stringify(viewBox)};
return [
${paths.map((p, i) => `  { type: "path", name: "icon ${i+1}",
    x: 0, y: 0, width: pencil.width, height: pencil.height,
    viewBox: viewBox, geometry: ${JSON.stringify(p.d)},
    fill: ${JSON.stringify(p.fill)} }`).join(',\n')}
];`;
fs.writeFileSync('assets/scripts/icon.js', script);
```

**3. 在 Pencil 中使用**

```javascript
// batch_design 插入 script 节点（.js 文件与 .pen 同目录）
scriptNode = Insert(page, {
  type: "script",
  script: "assets/scripts/icon.js",
  width: 24, height: 24
});
```

**4. DSL 坐标校正**
- 用 MasterGo DSL 的 `absoluteBoundingBox` / `layoutStyle` 校正位置
- 字重用 DSL 的 `fontWeight`，不要自行猜测
- 间距用 DSL 的实际 gap/padding 值

### ⚠️ 字体限制

Pencil 不包含 PingFang SC 等 macOS 专用字体。MasterGo/Figma 原稿中指定的字体在 Pencil 中可能不可用：
- 自动回退为系统可用中文字体
- 文字观感会有轻微差异，属于 Pencil 客观限制
- 字重和坐标仍按原稿走，保持结构精确

### ⚠️ PowerShell 中文编码

PowerShell 终端传中文给 Node.js 可能变问号：
- 用节点 ID（如 `105:35316`）匹配，不依赖中文名
- 或在 Node 脚本中用 UTF-8 BOM 清理：`.replace(/^\uFEFF/, '')`

---

## ⚠️ 血泪经验（必须遵守）

### 禁止事项

| ❌ 禁止 | ✅ 正确做法 | 原因 |
|---------|------------|------|
| 一次修改多个卡片位置 | **一次只改一个，改完立即检查** | 问题累积，不知道哪个改坏了 |
| 在 `layout:"none"` 里用 frame 定位 | **用纯文字/矩形节点直接定位** | frame 的 x/y 在 layout:"none" 下不生效 |
| 用 `justifyContent:"space_between"` | **用 `"flex_start"` 让元素紧挨** | space_between 会把元素推到两端 |
| 跳过 snapshot_layout | **每步都 snapshot + screenshot** | 用户发现时已经乱了 |
| 改完不截图就做下一步 | **每步都 get_screenshot 给用户确认** | 问题累积到无法修复 |

### 修改流程（必须遵守）

```
1. batch_get 读取目标节点结构（readDepth:2）
2. 手动计算所有新坐标（纸上算清楚）
3. batch_design 只改一处
4. snapshot_layout 立即检查
5. 有问题 → 修正 → 再检查
6. 没问题 → get_screenshot 给用户确认
7. 用户确认 → 才做下一个
```

### 间距规范

- 卡片间：引用 `$spacing-*` 变量（如 `$spacing-md`）
- 组件内 gap：引用 `$spacing-*` 变量（如 `$spacing-sm`）
- padding：引用 `$spacing-*` 变量（如 `$spacing-lg`）
- 所有间距必须引用变量，禁止硬编码数字；具体值以 `mcp_pencil_get_variables` 返回为准

---

## ⚠️ 设计惯例（必须遵守）

### 交互模式选择

| 场景 | 优先方案 | 避免 |
|------|----------|------|
| 手动触发操作 | **下拉刷新** — 用户无感，符合移动端习惯 | 显式按钮占空间、增加操作成本 |
| 数据同步 | 首页顶部下拉 + "上次更新"时间戳 + "正在同步…"指示器 | "同步"按钮 |
| 状态展示 | 旋转指示器 + 文案提示，完成后自动消失 | Toast 弹窗 |

### 修改完成后记录

每次原型修改完成后，必须立即在 `PRD修改计划.md` 中：
1. 更新对应修改项的「原型」列为 ✅ 已完成
2. 在「修改记录」表中追加新记录

```
batch_design → 审计 → 截图确认 → 立即更新修改计划 ✓
```

### 风格切换教训

**全量换风格时，必须递归检查每一层：**

| ❌ 错误做法 | ✅ 正确做法 |
|------------|------------|
| 只改外层 frame 的 fill/stroke | **逐层读取所有子节点，逐一改** |
| 改了胶囊 frame，忘了内部矩形 | `batch_get(readDepth:3)` 后发现内部还有 `rectangle` 覆盖 |
| 改了容器，以为子元素自动继承 | **Pencil 不继承颜色**，每个节点独立设置 |
| 改了三层以为够了 | 进度条：frame→track→**fill 三层嵌套**，每层都要改 |

**换风格操作流程：**
1. `batch_get(readDepth:3)` 读取完整层级
2. 逐一列出所有 `fill`/`stroke`/`color` 节点
3. 批量替换为新风格色值
4. 特别关注：`rectangle` 覆盖层、嵌套 `ellipse`、`path` 图标、**进度条 fill 层**

### 常见报错速查

| 报错 | 原因 | 修复 |
|------|------|------|
| `OnXba has 'fit_content' sizing but does not have flexbox layout` | 组件警告，可忽略 | 无需处理 |
| `Properties 'x' and 'y' are ignored because it is inside a flexbox layout` | flex 容器内不能用绝对定位 | 改用 `layout:"none"` 或去掉 x/y |
| `Delete skipped: node 'xxx' does not exist` | 节点已被删除 | 检查 ID 是否正确 |
| 转换组件后无紫色边框 | 选中状态缓存 | 取消选中 → 重新选中即可 |
| Figma 粘贴无图片 | Figma→Pencil 不支持图片粘贴 | 单独拖拽导入图片 |
| `Process exited with code 1` | Claude Code 认证或权限问题 | 终端执行 `claude` 重新认证 → 重启 IDE |
| 导出图片与画布不一致 | 已知偶发 bug | 截图替代导出，或重试 |
| 图标显示棋盘格 / 不渲染 | 用 `image` fill 填本地 SVG 文件 | ✅ 改为 script 节点（Code on Canvas），见上文导入链路 |
| 字体报无效（如 PingFang SC） | Pencil 不含该字体 | 替换为系统可用中文字体，字重坐标不变 |

### 预防措施（Pencil 官方建议）

- ❌ **禁止手动编辑 .pen 文件**（JSON 格式但结构复杂，手动改必出错）
- ✅ 频繁 `Ctrl+S` 保存（无自动保存）
- ✅ 大改动前先 Git commit（撤销功能有限）
- ✅ 保持 Claude Code 登录态有效

---

## batch_design DSL 语法

**所有节点 ID 和路径必须是字符串（加引号），裸单词会被当作变量：**

```javascript
// ❌ 错误：query 未定义，报 ReferenceError
Update(query, {width: 300});

// ✅ 正确：加引号
Update("query", {width: 300});
```

### 核心函数

| 函数 | 说明 | 示例 |
|------|------|------|
| `Insert(parent, node)` | 插入节点，返回变量 | `card = Insert(page, {type: "ref", ref: "cardId"})` |
| `Update(node, props)` | 更新属性 | `Update(card, {width: "fill_container"})` |
| `Replace(node, newNode)` | 替换节点 | `Replace("oldId", {type: "frame", ...})` |
| `Delete(node)` | 删除节点 | `Delete("nodeId")` |

### 规则

1. **节点 ID 必须双引号包裹**：`"abc123"`、`"oJuxZ/slotId"`
2. **Insert 返回值用变量**：`var = Insert(...)`，后续用 `var` 引用（不加引号）
3. **路径拼接用 `+`**：`card + "/slotId"`
4. **每条语句必须以 `;` 结尾**
5. **子节点用 `children` 数组**：`{type: "frame", children: [{type: "text", content: "标题"}]}`
6. `Update()` 只能改属性，**不能改变父子关系**。要移入容器必须用 `Insert(容器, {...})` 重建
7. **卡片排版**：`layout: "none"` + 手动计算 Y 坐标，间距统一 40px。每次修改后必须调间距
8. **`fill_container`** 仅在父节点有 `layout` 属性时生效
9. ⚠️ **batch_design 自动替换自定义 ID**：创建时写的 `id` 会被忽略并生成新 ID（如 `"ringCard"` → `"H1PUQe"`）。必须用返回的新 ID 引用节点，不可依赖自定义 ID

### 特殊属性语法

#### Stroke（描边）

**正确语法**（三个独立属性，不是嵌套对象）：
```javascript
// ✅ 正确
Insert(page, {type:"frame", ..., stroke:"#2997FF80", strokeWidth:1, strokeAlignment:"inner"});
Update("nodeId", {stroke:"#2997FF80", strokeWidth:1, strokeAlignment:"inner"});

// ❌ 错误：嵌套对象格式不生效
Insert(page, {type:"frame", ..., stroke:{type:"color",color:"#2997FF80"}});
Insert(page, {type:"frame", ..., stroke:{thickness:1, fill:"#2997FF40"}});
```

`strokeAlignment` 可选值：`"inner"` | `"center"` | `"outside"`

#### 背景模糊 + 阴影

```javascript
Insert(page, {type:"frame", ...,
  fill:"#FFFFFF02",
  stroke:{type:"color", color:"#2997FF40"},
  effect:[
    {type:"background_blur", radius:30},
    {type:"shadow", shadowType:"outer", offset:{x:0,y:4}, blur:24, color:"#2997FF0A"}
  ]
});
```

#### 渐变填充

```javascript
// 线性渐变
fill: {type:"gradient", gradientType:"linear", rotation:180,
  colors:[{color:"#0A0A18", position:0}, {color:"#12122A", position:0.5}, {color:"#0A0A18", position:1}]}

// 径向渐变（光晕）
fill: {type:"gradient", gradientType:"radial", center:{x:0.5,y:0.5}, size:{width:1,height:1},
  colors:[{color:"#2997FF28", position:0}, {color:"#2997FF00", position:1}]}
```

### 示例：创建一个页面

```javascript
page = Insert(document, {type: "frame", layout: "vertical", width: 375, height: "fit_content", gap: 16, padding: 16});
title = Insert(page, {type: "text", content: "首页", fontSize: 24, fontWeight: "700", fill: "#FFFFFF"});
card = Insert(page, {type: "ref", ref: "cardId", width: "fill_container"});
Update(card + "/contentSlotId", {gap: 12});
text = Insert(card + "/contentSlotId", {type: "text", content: "内容文字", fontSize: 14, fill: "#999999"});
```

## 常用组件写法

### 居中文字
不要手算绝对坐标，用 `frame` 容器自动居中：
```javascript
center = Insert(parent, {type: "frame", layout: "vertical", justifyContent: "center", alignItems: "center", width: 100, height: 100});
Insert(center, {type: "text", content: "居中", ...});
```

### 底栏导航图标居中
bg 框内图标必须同时设置双轴居中，否则 y 贴顶：
```javascript
// ✅ 正确：双属性
Insert(parent, {type:"frame", cornerRadius:16, width:40, height:32, justifyContent:"center", alignItems:"center",
  children:[{type:"path", fill:"$color-primary", width:20, height:20, viewBox:[0,0,24,24], geometry:"..."}]});

// ❌ 错误：缺 alignItems → y=0 贴顶
Insert(parent, {type:"frame", cornerRadius:16, width:40, height:32, justifyContent:"center",
  children:[{type:"path", ...}]});
```

### 环形进度条（纯色）
```javascript
Insert(parent, {type: "ellipse", fill: "none", stroke: "#色值", strokeWidth: 6, innerRadius: 0.90, startAngle: 90, sweepAngle: -306});
```
- sweepAngle 负值 = 顺时针

### 渐变环形进度条
Pencil 不支持椭圆渐变和渐变描边，用三层叠加：
```javascript
// 层1：渐变底圆（rectangle + cornerRadius=半宽）
Insert(parent, {type: "rectangle", cornerRadius: 59, fill: {type:"gradient", gradientType:"linear", rotation: 0, colors:[{color:"#主色",position:0},{color:"#次色",position:1}]}, width: 118, height: 118});
// 层2：挖孔（ellipse + 卡片背景色）
Insert(parent, {type: "ellipse", fill: "#卡片背景色", width: 106, height: 106, x: 6, y: 6});
// 层3：进度轨道（inner描边 + 深色 + 比环粗）
Insert(parent, {type: "ellipse", fill: "none", stroke: "#比背景深的色", strokeWidth: 8, strokeAlignment: "inner", innerRadius: 0.90, startAngle: -216, sweepAngle: -54});
```
- 轨道必须用 `strokeAlignment: "inner"` 防止超界

### 折线图
用多个 `line` 节点拼接，共享端点无缝：
```javascript
Insert(parent, {type: "line", x: 0, y: 100, width: 25, height: -2, stroke: "#色值", strokeWidth: 2.5});
```
- line 从 (x,y) 到 (x+width, y+height)，至少 20 段才平滑
- 面积填充用 path + bezier：
```javascript
Insert(parent, {type: "path", fill: "$color-secondary-subtle", geometry: "M0 100 C30 100 70 85 100 85 ... L600 130 L0 130 Z", viewBox: [0,0,600,130]});
```

## 页面绘制流程

1. 用 `mcp_pencil_batch_design` 执行批量设计操作
2. 每完成一个页面，调用 **`ui-ux-pro-max`** skill 做设计审查（对比度、间距、触控目标、无 emoji 等）
3. **本 skill 管"画对"，ui-ux-pro-max 管"画好"，两者互补**

### ⚠️ 每次 batch_design 后强制执行（不可跳过）
```
1. snapshot_layout → 检查间距/重叠/裁剪/塌陷
2. 发现重叠立即修正，不要等用户提醒
3. 新增页面时检查与已有页面无重叠
4. 修改组件后检查无重复元素残留
5. get_screenshot → 截图给用户确认
```
2. 校验通过后导出截图展示给用户
3. 等待用户反馈 → 调整 → 重新校验 → 重新截图

## 自校验（每次 batch_design 后必须执行）

### 执行

```
mcp_pencil_snapshot_layout → 检查所有变更容器的布局
```

### 自动修复

| 问题 | 修复 |
|------|------|
| x 负数 | 调正到 ≥0 |
| clipped 裁剪 | 增高容器 |
| collapse 塌陷 | 设置固定宽/高 |

### 分两级处理

🔴 **关键错误**（必须修复后重新校验）：
- x 负数
- clipped 裁剪
- collapse 塌陷
- overflow 溢出

🟡 **建议性 warning**（标注后可导出）：
- 间距偏大/偏小
- 对齐偏差
- 空区域

导出截图时附带备注说明已知 warning，供用户判断。

## 截图验证检查清单

每张截图必须检查：

- [ ] 卡片是否贴边（缺 padding/margin）
- [ ] 元素间距是否均匀
- [ ] 文字是否截断
- [ ] 层级是否合理
- [ ] 色值与 Style Guide 一致

## 读取节点

用 `mcp_pencil_batch_get` 读取节点结构，`mcp_pencil_get_screenshot` 截图验证。
