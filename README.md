企业级资产管理中台 (Enterprise Asset Management Dashboard)
本项目是一套基于 Vue 3 + TypeScript + Vite 构建的工业级 SaaS 后端管理系统。项目不仅实现了核心业务流，更在权限架构（RBAC）、逻辑抽象（Hooks）、高性能递归算法以及工程化调优等方面进行了深度实践。

🚀 技术栈选型
核心框架：Vue 3 (Composition API) + TypeScript 5.x
构建工具：Vite 6.x (具备极致的 HMR 体验)
状态管理：Pinia (支持持久化与模块化)
路由管理：Vue Router 4 (集成动态权限拦截)
UI 组件库：Element Plus (按需引入方案)
可视化：Echarts 5.x (响应式封装)
网络请求：Axios (全链路类型契约封装)
✨ 项目核心亮点 (2.5年经验硬实力体现)
1. 严密的 RBAC 权限系统
动态路由挂载：弃用简单的 v-if 隐藏菜单，采用 router.addRoute 在路由守卫中根据用户角色（admin/editor）动态注入路由表。
安全闭环：实现“非法路径不存在”机制，未授权用户直接访问 URL 会命中 404 捕获，且配合 v-permission 自定义指令实现 DOM 级的按钮权限控制。
2. 高阶逻辑抽离 (Custom Hooks)
useTable：高度封装了列表加载、分页、防抖搜索及 Loading 状态锁，将业务组件样板代码减少了 60%。
useForm：集成工业级深拷贝（解决循环引用），构建“沙盒编辑”模式。支持编辑未保存时的自动状态回滚，确保单向数据流的纯粹性。
3. 无限层级组织架构架构
高性能转换：通过 O(n) 时间复杂度的 Map 映射算法，将后端扁平数据（pid 结构）高效转换为递归树形结构。
递归组件：手写 TreeItem 递归组件，处理复杂的事件冒泡与层级缩进，支持无限深度的部门管理。
4. 数据可视化与性能监控
响应式图表：对 Echarts 进行组件化封装，集成 ResizeObserver 自动缩放，并严格执行 dispose 销毁机制，彻底规避单页应用中的内存泄漏风险。
实时数据流：模拟轮询机制实现看板数据的平滑补间动画更新。
5. 工程化调优 (Performance)
极致瘦身：配置 manualChunks 分包策略，将重型库（Echarts/ElementPlus）抽离，配合 Gzip 预压缩，首屏加载体积减小 70%。
代码规范：遵循 Angular 提交规范（feat/fix/perf），集成 TypeScript 严格模式，实现零 any 编码。
📦 项目运行
环境准备
Node.js 18+
npm 9+
快速启动
安装依赖
BASH
npm install
启动后端模拟服务 (Mock Server)
BASH
node server/server.js
启动前端开发环境
BASH
npm run dev
📂 目录结构规范
TEXT
src/
├── api/            # 接口契约层 (定义全链路 TS 类型)
├── components/     # 公共 UI 组件 (BaseModal, AuthButton等)
├── directives/     # 全局自定义指令 (permission等)
├── hooks/          # 高阶逻辑抽离 (useTable, useForm)
├── layout/         # 嵌套布局容器
├── router/         # 路由配置与全局权限守卫
├── store/          # Pinia 状态管理中心
├── utils/          # 底层工具库 (engine.ts 算法集)
└── views/          # 业务页面模块