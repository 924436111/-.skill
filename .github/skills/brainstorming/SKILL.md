---
name: "brainstorming"
description: "在写代码前通过提问细化需求并探索替代方案。当用户描述新功能或需要解决的问题时触发。"
---

# Brainstorming Skill - 头脑风暴技能

## When to Activate - 何时触发
- User describes a new feature they want to build - 用户描述想要构建的新功能
- User presents a problem that needs solving - 用户提出需要解决的问题
- Before any code is written for a new feature - 在为新功能写任何代码之前
- When requirements are unclear or incomplete - 当需求不清晰或不完整时

## What to Do - 要做什么

### 1. Ask Clarifying Questions - 提出澄清问题
Before jumping to solutions, ask: - 在急于给出解决方案之前，先问：
- What problem are you really trying to solve? - 你真正想解决的是什么问题？
- Who are the users and what are their pain points? - 用户是谁？他们的痛点是什么？
- What are the success criteria? - 成功的标准是什么？
- Are there any constraints (time, technology, resources)? - 有什么限制吗？（时间、技术、资源）

### 2. Explore Alternatives - 探索替代方案
Present multiple approaches: - 提供多种方法：
- Different architectural choices - 不同的架构选择
- Trade-offs between simplicity and scalability - 简单性和可扩展性之间的权衡
- Build vs buy decisions - 自研还是购买的决策
- Technology options - 技术选项

### 3. Present Design in Sections - 分部分展示设计
Once requirements are clear, present the design in digestible chunks: - 需求明确后，将设计分成易于理解的部分：
- **Overview**: High-level description of what we're building - **概述**：我们正在构建的内容的高级描述
- **Components**: Main parts and their responsibilities - **组件**：主要部分及其职责
- **Data Flow**: How information moves through the system - **数据流**：信息如何在系统中流动
- **Interfaces**: User-facing and API interfaces - **接口**：用户界面和 API 接口
- **Edge Cases**: Error handling and boundary conditions - **边界情况**：错误处理和边界条件

### 4. Get Validation - 获取确认
Wait for explicit user sign-off on each section before proceeding. Do not start implementation until the design is approved. - 在继续之前等待用户对每个部分的明确确认。在设计获得批准之前不要开始实现。

## Output Format - 输出格式
After brainstorming, save a design document that includes: - 头脑风暴后，保存包含以下内容的设计文档：
1. Problem statement - 问题陈述
2. Proposed solution - 提议的解决方案
3. Architecture overview - 架构概述
4. Component breakdown - 组件分解
5. Implementation considerations - 实现考虑因素
6. Open questions (if any) - 未决问题（如有）

## Important - 重要事项
- Never start coding without a clear, approved design - 没有清晰、批准的设计时永远不要开始写代码
- Challenge assumptions and explore edge cases - 挑战假设并探索边界情况
- Keep explanations clear and concise - 保持解释清晰简洁
- Use examples to illustrate complex concepts - 使用示例说明复杂概念
