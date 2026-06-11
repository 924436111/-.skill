---
name: pencil-prototype
description: "Pencil 原型绘制、自校验与截图验证。USE WHEN: 画原型、Pencil、batch_design、snapshot_layout、自校验、布局修复、导出截图、原型验证、页面绘制、设计校验、修改已有页面、修改图表、新增子页面、添加状态页、重建页面、调整曲线、新增弹窗、复制父页面"
---

# Pencil 原型绘制与自校验

## 前置

1. 调用 `mcp_pencil_get_editor_state` 获取编辑器状态和 schema
2. 读取 `UI风格样板.pen`（Style Guide）获取配色和组件规范
3. **所有色值、字号、圆角、间距必须严格引用 Style Guide，不得自行变体**
4. **同步规则：子页面改动风格或新增组件后，必须同步更新 Style Guide 中对应组件**（如 stroke/fill/effect 语法变更、新增卡片样式等）

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

- 卡片间：**12px**
- 组件内 gap：**8-12px**
- padding：**16-20px**

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

### 常见报错速查

| 报错 | 原因 | 修复 |
|------|------|------|
| `OnXba has 'fit_content' sizing but does not have flexbox layout` | 组件警告，可忽略 | 无需处理 |
| `Properties 'x' and 'y' are ignored because it is inside a flexbox layout` | flex 容器内不能用绝对定位 | 改用 `layout:"none"` 或去掉 x/y |
| `Delete skipped: node 'xxx' does not exist` | 节点已被删除 | 检查 ID 是否正确 |

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
  children:[{type:"path", fill:"#22D3EE", width:20, height:20, viewBox:[0,0,24,24], geometry:"..."}]});

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
Insert(parent, {type: "path", fill: "#C4B5FD15", geometry: "M0 100 C30 100 70 85 100 85 ... L600 130 L0 130 Z", viewBox: [0,0,600,130]});
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
