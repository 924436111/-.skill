# .pen 全量校验 SOP

> 核心原则：**用脚本数字做判断，不用 AI 感觉做判断**

## 流程

### 第一步：全量拉取

用 `mcp_pencil_batch_get` 一次拉取全部 51 个页面（readDepth:5），保存到 `assets/full-dump.json`。

**禁止**分页拉取——分页会导致遗漏。

### 第二步：脚本扫描

```bash
node assets/check-colors.mjs assets/full-dump.json
```

输出：
- 硬编码色值数量（按页面分组）
- 字体不统一数量
- 自动生成 `assets/fix-batch-*.txt` 修复脚本

**退出码**：0 = 通过，1 = 有遗漏

### 第三步：批量修复

读取 `assets/fix-batch-*.txt`，逐个文件调用 `mcp_pencil_batch_design` 执行。

每个 batch 最多 30 条 Update，防止 MCP 超时。

### 第四步：重新扫描验证

重复第一步和第二步，确认退出码为 0。

**禁止**跳过这步——必须用脚本确认，不能用 AI "感觉没问题了"。

### 第五步：布局检查

```bash
mcp_pencil_snapshot_layout(problemsOnly: true)
```

修复所有 reported 问题后，再次检查直到零问题。

### 第六步：截图抽检

从 51 页中随机抽 5 页截图，人工确认视觉无异常。

---

## 禁止事项

| ❌ 禁止 | ✅ 正确 |
|---------|--------|
| AI 自行判断"差不多了" | 脚本退出码为 0 才算完成 |
| 分页拉取分页修 | 一次全量拉取，脚本统一扫描 |
| 修完不验证 | 每轮修复后重新跑脚本 |
| 只检查 fill | fill + stroke + fontFamily 全部检查 |
| 用缓存 JSON 扫描 | 每次从 .pen 实时拉取 |

## 当前状态

- [ ] 第一步：全量拉取
- [ ] 第二步：脚本扫描（退出码 = ?）
- [ ] 第三步：批量修复
- [ ] 第四步：重新扫描（退出码 = 0）
- [ ] 第五步：布局检查
- [ ] 第六步：截图抽检
