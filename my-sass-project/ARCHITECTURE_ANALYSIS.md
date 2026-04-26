# my-sass-project 整体架构分析报告

基于项目的文件结构、依赖包以及业务代码，本项目是一个典型的**前后端全栈应用**。前端采用 **Vue 3 + Vite + TypeScript** 现代化技术栈，核心业务为一个**动态表单低代码（Low-Code）引擎**；后端使用 **Node.js (Express)** 提供接口服务。

---

## 1. 技术栈选型 (Technology Stack)

### 前端 (Frontend)
*   **核心框架**: Vue 3 (Composition API) + TypeScript
*   **构建工具**: Vite 8 (搭配 `vite-plugin-compression` 等插件进行构建优化)
*   **UI 组件库**: Element Plus 2.x
*   **路由管理**: Vue Router 4
*   **状态管理**: Pinia 3 + `pinia-plugin-persistedstate` (支持状态持久化)
*   **网络请求**: Axios 1.x
*   **CSS 预处理器**: Sass
*   **工程化插件**: `unplugin-auto-import`, `unplugin-vue-components`, `unplugin-icons` (按需自动导入 API、组件和图标，大幅减少样板代码)

### 后端 (Backend)
*   **服务器**: Node.js + Express 5.x
*   **中间件**: `cors` (处理跨域)

---

## 2. 目录结构设计 (Directory Structure)

项目主要分为 `src` (前端源码) 和 `server` (后端服务) 两部分。遵循了良好的“关注点分离”原则：

```text
my-sass-project/
├── server/                     # 后端服务目录
│   └── server.js               # Express 服务端入口文件 (处理表单存储、鉴权等接口)
├── src/                        # 前端源码目录
│   ├── api/                    # 接口声明层 (按业务模块划分，如 form.ts, user.ts)
│   ├── assets/                 # 静态资源 (图片、全局样式等)
│   ├── components/             # 公共组件库
│   │   ├── BuilderNode.vue     # 低代码：设计时画板递归渲染器
│   │   ├── FormNode.vue        # 低代码：运行时表单递归渲染器
│   │   ├── ComponentConfig.vue # 低代码：右侧组件属性高级配置面板
│   │   └── FormPreview.vue     # 低代码：预览组件
│   ├── directive/              # 自定义 Vue 指令
│   ├── hooks/                  # 公用 Composition API hooks (如 useAuth 等)
│   ├── layout/                 # 页面整体布局组件 (如侧边栏、顶导、主容器)
│   ├── router/                 # 路由配置中心
│   ├── store/                  # Pinia 状态管理模块
│   ├── types/                  # TypeScript 全局类型声明 (如 lowcode.ts 定义了低代码核心类型)
│   ├── utils/                  # 工具函数库
│   │   ├── request.ts          # Axios 二次封装 (无感刷新、全局异常处理)
│   │   ├── lowcode.ts          # 低代码通用工具 (生成默认值、校验规则)
│   │   └── simpleAstGenerator.ts # 低代码 AST 代码生成器引擎
│   ├── views/                  # 业务视图页面
│   │   └── lowcode/            
│   │       ├── FormBuilder.vue # 表单设计器页面 (核心)
│   │       └── FormConsumer.vue# 表单消费者页面 (核心运行时展示)
│   ├── App.vue                 # 根组件
│   └── main.ts                 # Vue 实例入口
├── vite.config.ts              # Vite 构建配置 (配置别名、代理、插件)
├── package.json                # 项目依赖清单
└── tsconfig.json               # TypeScript 编译配置
```

---

## 3. 核心业务模块分析 (Core Modules)

本项目最核心的业务是**低代码表单引擎**，分为三大子系统：

### 3.1 设计时引擎 (Design-Time Engine)
*   **入口**: `views/lowcode/FormBuilder.vue`
*   **机制**: 基于 HTML5 拖拽 API (`dragstart`, `drop`)。左侧为物料库，中间为画布。
*   **递归嵌套**: 依赖 `components/BuilderNode.vue`，支持 `group` (分组)、`grid` (栅格) 组件的无限极递归嵌套，并在画板中响应选择、拖拽和删除。
*   **动态配置**: 右侧 `ComponentConfig.vue` 实时监听选中的节点，修改组件的字段、显隐联动、正则校验等属性。

### 3.2 运行时引擎 (Runtime Engine)
*   **入口**: `views/lowcode/FormConsumer.vue` (线上使用) / `components/FormPreview.vue` (即时预览)
*   **机制**: 利用 `components/FormNode.vue` 递归渲染 Vue 模板。结合 `<component :is="...">` 动态挂载 Element Plus 基础组件。
*   **数据流**: 在组件加载时，从后端拉取 JSON Schema，通过 `utils/lowcode.ts` 中的 `initFormData` 和 `generateValidationRules` 动态生成响应式数据载体和 Element Plus 表单校验规则。
*   **真实提交**: 通过 `api/form.ts` 中的 `submitFormDataApi` 发起真实网络请求。

### 3.3 出码引擎 (Code Generation)
*   **核心模块**: `utils/simpleAstGenerator.ts`
*   **机制**: 遍历内存中的 JSON Schema（支持嵌套递归），将数据结构转换为标准的 Vue 3 (`<template>`, `<script setup>`, `<style>`) 源码，支持一键复制，实现从配置到物理代码的无缝转换。

---

## 4. 架构设计亮点 (Architectural Highlights)

1.  **高度类型安全**: 
    在 `types/lowcode.ts` 中严格定义了 `FormComponent`、`FormSchema` 接口，保证了从右侧配置面板、画板渲染、再到 AST 代码生成器的数据结构一致性。
2.  **强大的网络层封装**: 
    `utils/request.ts` 是一大亮点。内置了 **Promise 队列控制和控制反转**，实现了优雅的 **Token 无感刷新**。并且结合 `InternalAxiosRequestConfig` 做了拦截器层面的强类型推导。
3.  **零样板代码开发体验**: 
    通过 Vite 的 `unplugin` 系列插件自动引入 Element Plus 组件和 Vue API (如 `ref`, `reactive`)，避免了文件中出现大量的 `import` 语句。
4.  **递归与 AST 结合**: 
    低代码系统突破了单层扁平列表的限制，通过 `BuilderNode` 和 `FormNode` 实现了视图递归，通过 `generateItem` 实现了 AST 源码生成的递归，满足了复杂中后台表单的真实业务需求。
