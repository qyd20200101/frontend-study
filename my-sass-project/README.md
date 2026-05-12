# my-sass-project | 企业级低代码动态表单引擎

![Vue3](https://img.shields.io/badge/Vue.js-3.5-4fc08d?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff?logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?logo=typescript)
![Element Plus](https://img.shields.io/badge/Element_Plus-2.8-409eff?logo=element-plus)

## 项目简介

基于 **Vue 3 + Vite + TypeScript** 的高性能低代码表单渲染引擎，覆盖可视化拖拽设计、动态 JSON 渲染到标准 Vue 3 SFC 源码生成的全链路闭环。

**核心价值**：通过配置化方式极速提升中后台表单开发效率。

---

## 技术栈

### 前端
- **核心框架**: Vue 3 (Composition API)
- **构建工具**: Vite 6 — 毫秒级热更新
- **状态管理**: Pinia 3 — 模块化 + 持久化
- **UI 组件库**: Element Plus 2.x
- **工程化**: `unplugin-auto-import` / `unplugin-vue-components` / `unplugin-icons`

### 后端
- **服务框架**: Node.js + Express 5
- **鉴权**: JWT 体系 + 无感 Token 刷新

---

## 功能亮点

1. **可视化表单设计器**: 支持 9 种组件（input / textarea / number / select / radio / checkbox / switch / date / time）+ 容器（栅格、分组）自由拖拽
2. **递归动态渲染引擎**: 组件递归调用支持无限极嵌套表单结构
3. **AST 源码生成器**: JSON 配置实时转换为符合企业规范的 Vue 3 SFC 源码（template + script setup + style）
4. **动态校验体系**: 11 种验证类型，自动解析 JSON Schema 规则生成 Element Plus 校验逻辑
5. **企业级网络层**: Axios 深度封装，401 自动 Token 续期 + 请求队列挂起

---

## 快速开始

```bash
# 环境要求: Node.js >= 18.0.0

# 安装依赖
npm install

# 启动前端
npm run dev

# 启动后端 (可选)
node ./server/server.js
```

| 功能 | URL |
|------|-----|
| 表单构建器（设计器） | http://localhost:5173/form-builder |
| 表单消费端（使用者） | http://localhost:5173/form-consumer |

---

## 项目结构

```
my-sass-project/
├── apps/
│   ├── vue-app/          # Vue 3 前端（低代码 Builder 主战场）
│   │   └── src/
│   │       ├── views/lowcode/    # FormBuilder.vue / FormConsumer.vue
│   │       ├── components/       # BuilderNode.vue / FormNode.vue
│   │       ├── hooks/            # useForm.ts / useTable.ts
│   │       ├── store/            # Pinia stores
│   │       ├── api/              # 接口层
│   │       ├── types/            # TypeScript 类型定义
│   │       └── utils/            # lowcode.ts / validation.ts
│   ├── react-app/        # React 19 前端（系统管理/审计模块）
│   └── server/           # Express + SQLite 后端
├── packages/
│   ├── core/             # 框架无关的纯逻辑共享层（状态机/校验规则/AST 核心）
│   └── shared/           # 工具/类型/API 共享层
├── pnpm-workspace.yaml
└── docs/                 # 架构/开发指南/使用示例/版本日志
```

## 文档导航

| 文档 | 说明 |
|------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 架构设计 + 技术栈分析 |
| [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | 开发者指南 + AST 集成 |
| [CHANGELOG.md](./CHANGELOG.md) | 版本升级日志 |
| [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) | 使用示例 + 快速参考 |

## 许可证

[MIT License](LICENSE)
