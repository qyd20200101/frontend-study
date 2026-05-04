# my-sass-project | 企业级低代码动态表单引擎

![Vue3](https://img.shields.io/badge/Vue.js-3.5-4fc08d?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript)
![Element Plus](https://img.shields.io/badge/Element_Plus-2.8-409eff?logo=element-plus)

## 🚀 项目简介

本项目是一个基于 **Vue 3 + Vite + TypeScript** 打造的高性能、可扩展的**低代码（Low-Code）表单渲染引擎**。它涵盖了从可视化拖拽设计、动态 JSON 渲染到标准 Vue 3 源码生成的全链路闭环，旨在通过配置化的方式极速提升中后台系统的开发效率。

---

## 🛠️ 技术方案

### 前端技术栈
- **核心框架**: Vue 3 (Composition API) - 利用 `script setup` 极致的开发体验。
- **构建工具**: Vite 6 - 毫秒级热更新与高效的生产构建。
- **状态管理**: Pinia 3 - 模块化状态流转，支持持久化存储。
- **UI 组件库**: Element Plus - 深度定制的表单组件体系。
- **工程化优化**: 
  - `unplugin-auto-import` / `unplugin-vue-components`: 实现 API 与组件的零导入开发。
  - `unplugin-icons`: 按需引入海量图标库。

### 后端技术栈
- **服务框架**: Node.js + Express 5 - 轻量级 RESTful API 服务。
- **安全保障**: 基于 JWT 的鉴权体系与无感 Token 刷新机制。

---

## ✨ 业务功能亮点

1. **可视化表单设计器**: 支持基础物料（输入框、选择器、日期）与高级容器（栅格、分组）的自由拖拽，实时配置组件属性。
2. **递归动态渲染引擎**: 突破扁平化限制，通过组件递归调用完美支持“无限极”嵌套表单结构（如栅格嵌套分组、分组嵌套栅格）。
3. **AST 源码生成器**: 内置一套高效的 AST 转换算法，能将 JSON 配置实时转换为符合企业规范的 Vue 3 SFC 源码（包含模板、逻辑与样式）。
4. **动态校验体系**: 自动解析 JSON Schema 规则，动态生成 Element Plus 校验逻辑，支持正则验证与显隐联动。

---

## 🧠 技术深度与架构设计

### 1. 递归视图驱动设计
在低代码引擎中，`BuilderNode` 与 `FormNode` 采用**自顶向下的递归渲染模式**。这种设计使得复杂的业务表单（如多级嵌套子表单）能够像处理简单表单一样自然，保证了引擎的表达上限。

### 2. AST 代码生成引擎 (`SimpleASTGenerator`)
项目并未采用简单的字符串拼接，而是通过**抽象语法树（AST）的思想**遍历组件树。它负责：
- **数据扁平化处理**: 自动提取嵌套组件中的 `v-model` 绑定字段。
- **代码校验**: 在生成源码后进行基础语法合法性检查。
- **样板代码收口**: 统一生成 `script setup` 逻辑，确保生成的代码可直接运行。

### 3. 企业级网络层架构
基于 Axios 的深度封装（`utils/request.ts`），实现了**控制反转与 Promise 队列管理**：
- **无感刷新 Token**: 当检测到 401 状态码时，自动挂载后续请求，静默完成 Token 续期并重新发起失败请求。
- **强类型推导**: 全链条泛型支持，从接口层到组件层均有精准的属性补全。

---

## ⚡ 性能优化

- **构建体积优化**: 通过 `vite-plugin-compression` 生成 Gzip 压缩包，生产环境加载速度提升 70% 以上。
- **按需加载战略**: 配合 `unplugin` 系列插件，实现 Element Plus 的组件级 Tree-shaking，显著降低首屏 JS 体积。
- **响应式数据精简**: 在 Pinia 中仅维护必要的 Schema 节点，避免大规模响应式对象带来的内存负担。
- **静态资源预处理**: 采用 Sass 全局变量与 Mixins，减少冗余 CSS 的产生。

---

## 📦 快速开始

### 1. 环境准备
确保您的 Node.js 版本 >= 18.0.0

### 2. 安装依赖
```bash
npm install
```

### 3. 启动项目
```bash
# 前端服务
npm run dev

# 后端服务 (可选，见 server 目录说明)
node ./server/server.js
```

### 4. 生产构建
```bash
npm run build
```

---

## 📜 许可证

[MIT License](LICENSE)
