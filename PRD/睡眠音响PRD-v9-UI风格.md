# 睡眠音响 PRD v12 - UI 风格

> 版本：v12 | 日期：2026-06-11 | 阶段：E UI 风格确认 | 风格：Warm Linen

---

## 设计系统概览

| 属性 | 值 |
|------|-----|
| 风格 | Warm Linen · Illustrated Ribbon Stack（暖色生活风） |
| 品牌色 | #21DBB0 |
| 辅色 | #D4A574 |
| 调性 | 温暖、亲和、全天候舒适阅读 |
| 平台 | iOS / Android |
| 基准宽 | 390px |
| 字体 | Inter(标题) / Geist(正文) |

---

## 配色系统

| 变量名 | 色值 | 用途 |
|--------|------|------|
| `$color-bg-page` | #FDFBF7 | 页面背景 |
| `$color-bg-card` | #FFFFFF | 卡片背景 |
| `$color-border` | #E8E0D5 | 边框/分割线 |
| `$color-primary` | #21DBB0 | 品牌色 |
| `$color-primary-subtle` | #21DBB020 | 图标背景 |
| `$color-primary-bg` | #21DBB015 | 强调卡边框 |
| `$color-secondary` | #D4A574 | 辅色 |
| `$color-warning` | #F59E4B | 警告 |
| `$color-danger` | #EF4444 | 危险 |
| `$color-text-primary` | #4A3728 | 主文字 |
| `$color-text-secondary` | #8B7355 | 次要文字 |
| `$color-text-muted` | #C4B5A5 | 弱化文字 |

---

## 字体排版

| 层级 | 字号 | 字重 | 色值 | 用途 |
|------|------|------|------|------|
| H1 | 18px | 700 | #4A3728 | 页面标题 |
| H2 | 14px | 500 | #8B7355 | 卡片标题 |
| Body | 13px | normal | #8B7355 | 正文 |
| Label | 12px | 600 | #21DBB0 | 标签 |
| Caption | 11px | normal | #8B7355 | 图例 |
| Score | 48px | 700 | #21DBB0 | 评分大数 |
| Score-Label | 14px | 600 | #D4A574 | 评分等级 |
| Stat | 16px | 600 | #4A3728 | 统计数值 |
| Nav | 11px | 500 | #21DBB0/#8B7355 | 底栏 |

---

## 间距体系

| 间距 | 值 | 用途 |
|------|-----|------|
| 页面 padding-top | 46px | 状态栏留空 |
| 页面 padding-h | 16px | 左右边距 |
| 卡片间 gap | 12px(首页)/16px(其他) | — |
| 卡片 padding | 20-24px | — |
| 元素 gap | 8-12px | — |
| 内容区宽 | 358px | 390-16×2 |

---

## 圆角体系

| 场景 | 值 |
|------|-----|
| 卡片 | 16px |
| 底栏 | 36px |
| 按钮 | 12-22px |
| 日期导航 | 18px |
| 设备胶囊 | 30px |
| 柱状图条 | 4px |

---

## 组件规范

### 底栏导航
- 高 72px，圆角 36px，padding:[8,12]
- 背景 #FFFFFF，边框 #E8E0D5，阴影 offset(0,8) blur:24 #00000040
- 活跃：图标背景 #21DBB020，图标+文字 #21DBB0
- 非活跃：图标+文字 #8B7355
- 图标 20×20 Remix Icon filled

### 状态栏
- 高 30-40px，时间 14px/600，电池 24×12
- 颜色 #4A3728

### 评分环 (OnXba)
- 5层：glow→渐变→hole→cover弧→分数
- 渐变：#21DBB0→#D4A574
- 大号 118×118(首页)，小号 100×100(详情)

### 按钮

| 类型 | 背景 | 边框 | 文字 |
|------|------|------|------|
| 主要 | #21DBB0 | — | #4A3728 |
| 次要 | #FFFFFF | #E8E0D5 | #4A3728 |
| 危险 | #EF444415 | #EF4444 | #EF4444 |

### 卡片
- 背景 #FFFFFF，圆角 16px，边框 #E8E0D5

### 图表
- 心率线：#21DBB0
- 线：#D4A574
- 网格：#E8E0D580 / #E8E0D550
- 标签：#8B7355

---

## 对比度

| 组合 | 对比度 | 达标 |
|------|--------|------|
| #4A3728 on #FDFBF7 | 10.1:1 | ✅ |
| #4A3728 on #FFFFFF | 10.7:1 | ✅ |
| #8B7355 on #FFFFFF | 3.8:1 | ✅ |

---

## CSS 变量速查

```css
:root {
  --bg-page: #FDFBF7; --bg-card: #FFFFFF; --border: #E8E0D5;
  --primary: #21DBB0; --secondary: #D4A574;
  --warning: #F59E4B; --danger: #EF4444;
  --text-1: #4A3728; --text-2: #8B7355; --text-3: #C4B5A5;
}
```

---

> 视觉参考：`pencil-new.pen`，47 页均已应用此规范。
