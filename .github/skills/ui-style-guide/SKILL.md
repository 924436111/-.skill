---
name: ui-style-guide
description: "UI 风格确认与 Style Guide 生成。USE WHEN: UI风格、配色方案、Style Guide、风格样板、风格对比、设计风格、配色选择、UI 确认"
---

# UI 风格确认与 Style Guide

## 风格确认流程

### 1. 创建风格样板

**不用文字描述风格**。直接用 Pencil 创建 `UI风格样板.pen`，展示 2-3 个完整配色方案并排对比。

每个方案必须包含：
- 配色卡（背景色 / 主色 / 文字色 / 辅助色）
- 产品核心卡片示例（如评分卡片）
- 按钮示例（主按钮 / 次按钮 / 禁用态）
- 文字层级示例（H1-H4 / 正文 / 标注）

### 2. 导出对比

导出各方案截图，让用户直观对比选择。

### 3. 生成 Style Guide

用户选定方案后，将 `UI风格样板.pen` 更新为完整 Style Guide，必须包含：

- 完整配色表（含色值、用途、深浅变体）
- 字体层级（字号、字重、行高、颜色）
- 所有组件示例：按钮 / 卡片 / 进度条 / 标签 / 通知条 / 输入框 / 开关等
- 间距体系（xs / sm / md / lg / xl）

**Style Guide 是所有子页面的配色和组件唯一权威来源。**

### 4. 图标集选定

调用 `iconify-icons` skill：
1. 根据产品风格推荐 2-3 个匹配图标集
2. 搜索关键图标预览对比
3. 用户选定后写入 Style Guide

### 5. 存档

生成 `{产品名}PRD-v{版本号}-UI风格.md` 记录配色和图标集决策。

---

## Style Guide 页面结构（必须包含的卡片）

Style Guide 位于画布最上方（0,0），宽 1440px，以下模块按序纵向排列：

| # | 卡片 | 内容 | 边框色 |
|---|------|------|--------|
| 1 | 品牌 | App 名称（36px Bold）+ 标语（14px） | 无 |
| 2 | 配色变量 | 13 色卡：色块 + 中文名 + `$color-xxx` + hex | `$color-border` |
| 3 | 字体排版 | 字体名、字重层级、6 级字号示例 | `$color-border` |
| 4 | 共享组件 | `reusable:true` 组件及 ID（蓝色边框） | `$color-primary` |
| 5 | 模板卡片 | 底栏/顶导等需复制改动的模板（橙色边框） | `$color-warning` |
| 6 | 间距体系 | `$spacing-xs`~`$spacing-2xl` + `$spacing-page`(80) | `$color-border` |
| 7 | 按钮样式 | 主/次/危险 × 大/小，圆角 12 或 8 | `$color-border` |
| 8 | 图表规范 | 折线 2.5px / 圆点 4px / Y轴对齐网格线 | `$color-border` |
| 9 | 图标 | Remix Icon / filled / 24×24 viewBox | `$color-border` |

**卡片格式**：`cornerRadius:16`, `fill:"$color-bg-card"`, `padding:28`, `gap:20`
标题：14px / 600 字重 / `$color-text-primary`，说明文字：12px / `$color-text-secondary`
