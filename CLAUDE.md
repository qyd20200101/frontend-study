# CLAUDE.md — study 仓库使用指南

## 这是什么仓库

个人学习仓库，主线两条：

1. **Vue3 源码 + JS/TS 底层深度学习**（当前 Day12 左右：reactivity / compiler / runtime / scheduler / diff / TS 类型系统）
2. **my-sass-project 低代码 SaaS 实战**（Vue3 + React 双端，作为源码知识的应用场）

---

## 一、固定文件位置（不要问、不要找）

|内容|路径|
|---|---|
|每日学习日报|`2026/MM_DD学习日报.md`|
|每日自评（🟢🟡🔴）**权威来源**|`docs/self-review/YYYY-MM-DD.md`|
|Vue3 源码笔记 + 手写迷你实现|`js/day30-js底层/Vue3从项目学源码/`|
|手写缩微 ref（对照真实源码用）|`js/day30-js底层/Vue3从项目学源码/Mini_ref.ts`|
|学习指南汇总|`docs/study-guide/`|
|面试冲刺计划 + 五级掌握标准|`docs/0512学习计划.md`|
|面试话术材料|`docs/interview/`|
|低代码实战（provide/inject 等）|`my-sass-project/apps/vue-app/`|

引用这些文件时**必须**用 `[text](relative/path)` markdown 链接格式（VSCode 可点击跳转），不要用反引号包裹路径。

---

## 二、回答学习类问题的强制流程

用户说"总结今天"/"我对 X 模糊"/"自评做完了"时：

1. **必读当天 self-review**（`docs/self-review/YYYY-MM-DD.md`），不读直接答 = 错
2. **只展开 🟡🔴**，🟢 项一笔带过或跳过 — 不要复述已掌握内容
3. 每个知识点用 **「一句话核心 + 关键代码/链路/表格」三件套**，禁止长段落叙述
4. 自评里有概念错误（方向反了、归类错了）**必须**明确指出"这条记反了"并给正确版本
5. 引用 `Mini_ref.ts` 等用户自己的代码作为锚点，把缩微版和真实源码对应

**不做**：写完整教程从头讲、对 🟢 项做"完整性补充"、未经请求主动新建 .md 文件。

### 加固输出模板（每个 🔴🟡 项强制套用）

```
### 🔴/🟡N — [知识点名称]

**核心**：[一句话说清本质]

[表格 或 对比代码块 — 用最短形式展示差异/流程]

> 易错点：[踩过的坑 / 容易记反的地方]

**场景**：[什么时候用到 / 项目里哪段代码对应]
```

输出完所有项后，**必须回写自评文件**：把分析写入对应 🔴🟡 项的下面（替换原始一行描述），格式同上。

### 自评回写规范

- 🔴 项 → 替换为上面的加固模板完整内容（含表格/代码块）
- 🟡 项 → 同上，额外标注「仍需巩固：xxx」
- 🟢 项 → 不动
- 自评里有事实错误 → 在「今天纠正的错误」段追加纠正记录
- 回写的同时输出给用户看，**不另开新文件**

---

## 三、已知反复盲区（命中即警觉）

|错误模式|正解|
|---|---|
|把 **静态提升 / patchFlag / 事件缓存** 归入 diff|这是**编译期**优化，不是 diff|
|Vue2 用 Object.defineProperty 是"代理"|是**劫持**；Vue3 的 Proxy 才是代理|
|computed = watch 加缓存|不对：computed 返回值、惰性、有缓存；watch 是副作用、立即/惰性可配、无返回值|
|ref 不能存对象|可以，内部会用 reactive 包|

TS 给最小够用集，不堆类型体操；用户自认"一窍不通"。

---

## 四、提效规则（避免来回试探）

- **批量并行**：独立的 Read/Glob/Grep 必须放同一条消息里并行
- **不预读已编辑文件**：Edit/Write 后不要再 Read 验证
- **不臆造文件**：路径不确定先 Glob，不要凭印象写路径
- **大范围探索用 Agent (Explore)**：>3 次 grep/glob 的开放性搜索委托给 Explore 子代理
- **Bash 限制**：Windows 环境优先 PowerShell；不要用 `cat/grep/find/ls` —— 用 Read/Grep/Glob
- **不写中间产物文件**：分析、计划、临时笔记走对话上下文，不要落盘 .md

---

## 五、提准规则（避免幻觉）

- **memory 是过去快照**：MEMORY.md 里说"用户 🟡 X"是 2026-05-10 的状态，今天回答前要看**今天**的 self-review
- **代码引用先验证存在**：要推荐某文件/函数/flag 前用 Glob/Grep 确认；不能凭记忆说"在 xxx.ts 里"
- **概念混淆零容忍**：Vue 源码概念严禁混用（响应式 vs 编译期 vs 运行时 vs 调度），分不清宁可说"这块我再确认"
- **不编造 API**：Vue3 / TS 的 API 名称、签名、行为不确定时直接说不确定，不要编

---

## 六、协作风格

- **中文回答**（用户母语 + 笔记语言）
- **简洁直接**：不复述问题、不寒暄、不写"很好的问题"
- **改代码不必反复确认**；新建 .md / 改 settings 等**会持久化**的操作要先确认（除非用户明说"写到日报/自评里"）
- 用户每日 3-4h 学习节奏紧凑：**信息密度 > 友好程度**

---

## 七、my-sass-project 命令速查

包管理器：**pnpm@9**（workspace 单仓多包）；根目录在 [my-sass-project/](my-sass-project/)。

根目录脚本：

|命令|作用|
|---|---|
|`pnpm dev`|启动 react-app（默认前端）|
|`pnpm -r build`|递归构建所有包|
|`pnpm -r lint`|递归 lint|

子包（用 `pnpm --filter <name> <script>`）：

|包|路径|关键脚本|
|---|---|---|
|`vue-app`|`apps/vue-app`|`dev` (vite) / `build` (vue-tsc + vite) / `preview`|
|`react-app`|`apps/react-app`|`dev` / `build` (tsc + vite) / `lint` (eslint) / `preview`|
|`@my-sass/server`|`apps/server`|`dev` (tsx watch) / `build` (tsc) / `start`|
|`@my-sass/core`|`packages/core`|`test` (vitest) / `test:watch` / `test:ui` / `test:coverage`|
|`@my-sass/shared`|`packages/shared`|工具/类型/api 共享层|

常用组合：

```powershell
# 启 Vue 前端
pnpm --filter vue-app dev
# 启后端 server
pnpm --filter @my-sass/server dev
# 跑 core 单测（监听）
pnpm --filter @my-sass/core test:watch
# 单独构建某包
pnpm --filter vue-app build
```

技术栈定位：

- **vue-app**：Vue3.5 + Pinia + ElementPlus + ECharts + 自动导入插件 — 低代码 Builder 主战场
- **react-app**：React19 + AntD + zustand + react-query + dnd-kit — 系统管理/审计模块
- **server**：Express + better-sqlite3 + JWT — 本地 SQLite 数据在 `apps/server/database.sqlite`
- **core**：vitest 单测 — 学习单元测试 + 纯逻辑沉淀的地方
