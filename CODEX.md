# CODEX.md — study 仓库 Codex 使用指南

## 这是什么仓库

个人学习仓库，两条主线：

1. **Vue3 源码 + JS/TS 底层深度学习**（reactivity / compiler / runtime / scheduler / diff / TS 类型系统）
2. **my-sass-project 低代码 SaaS 实战**（Vue3 + React 双端 + NestJS 后端）

Codex 的职责：快速读代码、改代码、跑命令、启动服务、排查问题。**信息密度 > 友好程度**。

---

## 一、工具使用优先级

| 操作       | 首选                            | 备选                 |
| ---------- | ------------------------------- | -------------------- |
| 读文件     | Shell: `type` / `rg`            | 让用户粘贴           |
| 搜索代码   | Shell: `rg "pattern" --type ts` | `findstr`            |
| 改文件     | `apply_patch`                   | 让用户手动改         |
| 规划步骤   | `update_plan`                   | —                    |
| 打开浏览器 | `browser-use` skill             | 让用户外部浏览器打开 |
| 并行读文件 | 同一轮 shell 多条命令           | —                    |

**Windows 约束**：不要用 `cat/grep/find/ls`；用 `cmd /c type`、`rg`、`dir /b`。路径用正斜杠或双反斜杠。

---

## 二、固定文件位置

| 内容                     | 路径                                             |
| ------------------------ | ------------------------------------------------ |
| 每日学习日报             | `2026/MM_DD学习日报.md`                          |
| 每日自评（权威来源）     | `my-sass-project/docs/self-review/YYYY-MM-DD.md` |
| Vue3 源码笔记 + 手写实现 | `js/day30-js底层/Vue3从项目学源码/`              |
| 手写缩微 ref             | `js/day30-js底层/Vue3从项目学源码/Mini_ref.ts`   |
| 学习指南汇总             | `docs/study-guide/`                              |

引用这些文件时用 `[text](relative/path)` markdown 链接（IDE 可点击跳转）。

---

## 三、回答学习类问题的规则

1. **先读当天 self-review**，不读直接答 = 错
2. **只展开 🟡🔴**，🟢 一笔带过
3. 知识点用 **「一句话核心 + 关键代码/链路/表格」三件套**，不写长段落
4. 自评里概念错误**必须明确指出**并给正确版本
5. 不写完整教程、不做"完整性补充"、未经请求不新建 .md

### 加固输出模板（每个 🔴🟡 项强制套用）

```
### 🔴/🟡N — [知识点名称]

**核心**：[一句话说清本质]

[表格 或 对比代码块 — 用最短形式展示差异/流程]

> 易错点：[踩过的坑 / 容易记反的地方]

**场景**：[什么时候用到 / 项目里哪段代码对应]
```

输出完所有项后，**必须回写自评文件**：把分析写入对应 🔴🟡 项下面，替换原始描述。

### 自评回写规范

- 🔴 项 → 替换为加固模板完整内容（含表格/代码块）
- 🟡 项 → 同上，额外标注「仍需巩固：xxx」
- 🟢 项 → 不动
- 自评里发现事实错误 → 在「今天纠正的错误」段追加纠正记录
- 回写同时输出给用户看，不另开新文件

---

## 四、已知反复盲区

| 错误模式                                 | 正解                                               |
| ---------------------------------------- | -------------------------------------------------- |
| 静态提升 / patchFlag / 事件缓存归入 diff | 这是**编译期**优化，不是 diff                      |
| Vue2 Object.defineProperty 是"代理"      | 是**劫持**；Vue3 Proxy 才是代理                    |
| computed = watch + 缓存                  | computed 返回值+惰性+有缓存；watch 无返回值+副作用 |
| ref 不能存对象                           | 可以，内部用 reactive 包                           |

TS 给最小够用集，不堆类型体操。

---

## 五、提效规则

- **批量并行**：独立的 shell 命令放同一轮并行执行
- **不预读已编辑文件**：apply_patch 后用 `update_plan` 标记完成，不回头读验证
- **先探索再操作**：不确定路径时先 `dir /b` 或 `rg --files`，不凭记忆编路径
- **用 update_plan 管理多步骤**：编译错误、多文件改动、启动+测试等场景
- **不放中间产物**：分析/计划留对话上下文，不落盘临时 .md

---

## 六、提准规则

- **memory 是过去快照**：今天回答前看**今天**的 self-review
- **代码引用先验证**：推荐文件/函数前用 rg/grep 确认存在
- **概念混淆零容忍**：响应式 ≠ 编译期 ≠ 运行时 ≠ 调度，分不清宁可说"我再确认"
- **不编造 API**：不确定就说"不确定，需要查文档"

---

## 七、my-sass-project 命令速查

包管理器：**pnpm@9**（workspace 单仓多包）；根目录在 [my-sass-project/](my-sass-project/)。

### 启动服务

```powershell
# 根目录启动 react-app（默认前端）
pnpm dev

# 单独启各端
pnpm --filter vue-app dev          # Vue 前端 → http://localhost:5173
pnpm --filter react-app dev        # React 前端 → http://localhost:5173
pnpm --filter @my-sass/server dev  # NestJS 后端 → http://localhost:3000
```

---

## 八、本地代理配置 (Standalone Proxy)

已实现本地代理独立运行，无需依赖 VS Code：

- **服务地址**：`http://127.0.0.1:11435/v1`
- **底层模型**：DeepSeek (deepseek-v4-pro)
- **开机自启**：已通过 `silent_start_proxy.vbs` 加入 Windows Startup (启动目录)。
- **环境变量**：已在 `.gemini/.env` 中全局配置 `GOOGLE_BASE_URL`。
- **管理方式**：代理在后台静默运行，若需手动重启，可运行 `C:\Users\Administrator\.gemini\antigravity\scratch\start-deepseek-proxy.bat`。
