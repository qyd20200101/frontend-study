# 低代码表单系统 — 架构设计文档

## 技术栈

### 前端
- **核心框架**: Vue 3 (Composition API) + TypeScript
- **构建工具**: Vite 6（`vite-plugin-compression` Gzip 压缩）
- **UI 组件库**: Element Plus 2.x
- **路由管理**: Vue Router 4
- **状态管理**: Pinia 3 + `pinia-plugin-persistedstate`
- **网络请求**: Axios 1.x（二次封装：Token 无感刷新 + 请求队列控制）
- **工程化**: `unplugin-auto-import` / `unplugin-vue-components` / `unplugin-icons`（零样板代码导入）

### 后端
- **服务框架**: Node.js + Express 5
- **中间件**: `cors`
- **鉴权**: JWT 体系

---

## 目录结构

```
my-sass-project/
├── apps/
│   ├── vue-app/src/                # Vue 3 前端（低代码主战场）
│   │   ├── views/lowcode/          # FormBuilder.vue / FormConsumer.vue
│   │   ├── components/
│   │   │   ├── BuilderNode.vue     # 设计时画板递归渲染器
│   │   │   ├── FormNode.vue        # 运行时表单递归渲染器
│   │   │   ├── ComponentConfig.vue # 右侧组件属性配置面板
│   │   │   └── FormPreview.vue     # 预览组件
│   │   ├── hooks/                  # useForm.ts / useTable.ts / useAuth
│   │   ├── store/                  # Pinia 状态管理
│   │   ├── api/                    # 接口声明层（form.ts / user.ts）
│   │   ├── types/                  # 低代码核心类型（lowcode.ts）
│   │   ├── utils/
│   │   │   ├── request.ts          # Axios 封装（Token 刷新 + 全局异常）
│   │   │   ├── lowcode.ts          # 低代码工具（默认值 / 校验规则生成）
│   │   │   └── simpleAstGenerator.ts # AST 代码生成引擎
│   │   ├── router/                 # 路由配置
│   │   └── layout/                 # 页面布局组件
│   ├── react-app/                  # React 19 前端
│   └── server/                     # Express 后端
├── packages/
│   ├── core/                       # 框架无关纯逻辑共享层
│   └── shared/                     # 工具/类型/API 共享层
├── pnpm-workspace.yaml
├── vite.config.ts
├── package.json
└── tsconfig.json
```

---

## 核心业务模块

### 设计时引擎 (Design-Time Engine)
- **入口**: `views/lowcode/FormBuilder.vue`
- **机制**: HTML5 拖拽 API（`dragstart` / `drop`），左侧物料库，中间画布
- **递归嵌套**: `BuilderNode.vue` 支持 `group`（分组）、`grid`（栅格）组件的无限极递归嵌套
- **动态配置**: `ComponentConfig.vue` 实时监听选中节点，修改字段/显隐联动/正则校验

### 运行时引擎 (Runtime Engine)
- **入口**: `FormConsumer.vue`（线上使用）/ `FormPreview.vue`（即时预览）
- **机制**: `FormNode.vue` 递归渲染 + `<component :is="...">` 动态挂载 Element Plus 组件
- **数据流**: 拉取 JSON Schema → `initFormData` 初始化数据 → `generateValidationRules` 生成校验规则

### 出码引擎 (Code Generation)
- **核心模块**: `utils/simpleAstGenerator.ts`
- **机制**: 遍历 JSON Schema（支持嵌套递归）→ 转换为标准 Vue 3 SFC 源码（template + script setup + style）

---

## 数据流

### 构建流程
```
用户拖拽操作 → schema.value 更新 → 画布重新渲染
  → 点击"保存发布" → saveFormSchemeApi() → POST /forms/save → 服务器存储
```

### 消费流程
```
FormConsumer 加载 → onMounted → getFormSchemaApi()
  → initFormData() → generateValidationRules()
  → el-form 渲染 → 用户填写 → validate() → POST 提交
```

---

## 架构亮点

1. **高度类型安全**: `types/lowcode.ts` 严格定义 `FormComponent` / `FormSchema`，保证配置面板→画板渲染→AST 代码生成的数据一致性
2. **网络层封装**: `request.ts` 内置 Promise 队列控制 + 控制反转，Token 无感刷新
3. **零样板代码**: `unplugin` 系列自动导入，无需手动 `import` Element Plus 组件和 Vue API
4. **递归 + AST 结合**: 视图递归（BuilderNode/FormNode）+ AST 代码生成递归，突破单层扁平列表限制

---

**最后更新**: 2026-04-23
