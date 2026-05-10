my-sass-project/
├── .vscode/
├── apps/
│   ├── react-app/
│   │   └── src/
│   │       ├── components/
│   │       │   ├── AuthGuard.tsx
│   │       │   └── HasPermission.tsx
│   │       ├── designer/
│   │       │   ├── Designer.tsx
│   │       │   ├── CanvasPanel.tsx
│   │       │   ├── MaterialPanel.tsx
│   │       │   └── SettingsPanel.tsx
│   │       ├── editor/
│   │       │   ├── Canvas.tsx
│   │       │   ├── PropsPanel.tsx
│   │       │   ├── OptionsEditor.tsx
│   │       │   ├── propSchemas.ts
│   │       │   └── nodeFactory.ts
│   │       ├── features/asset/
│   │       │   ├── components/
│   │       │   │   ├── VirtualTable.tsx
│   │       │   │   ├── AssetChart.tsx
│   │       │   │   ├── BaseModal.tsx
│   │       │   │   └── TreeItem.tsx
│   │       │   └── pages/
│   │       │       ├── DashboardPage.tsx
│   │       │       └── DataManagerPage.tsx
│   │       ├── renderer/
│   │       │   ├── FormRenderer.tsx
│   │       │   ├── componentMap.tsx
│   │       │   └── fields/
│   │       │       ├── InputField.tsx
│   │       │       ├── SelectField.tsx
│   │       │       └── GroupField.tsx
│   │       └── store/
│   │           ├── useAuthStore.ts
│   │           └── useDesignerStore.ts
│   ├── server/
│   ├── vue-app/
│   │   ├── vite.config.ts          ← 构建优化 / proxy / manualChunks
│   │   └── src/
│   │       ├── components/
│   │       │   ├── BuilderNode.vue   ← 递归组件 (设计器节点)
│   │       │   ├── FormNode.vue      ← 递归组件 (消费端节点)
│   │       │   ├── ComponentConfig.vue  ← 组件属性配置面板
│   │       │   └── FormPreview.vue
│   │       ├── layout/
│   │       │   └── MainLayout.vue
│   │       ├── router/
│   │       │   └── index.ts          ← 静态路由 + 动态路由 + KeepAlive
│   │       ├── types/
│   │       │   └── lowcode.ts        ← FormSchema / FormComponent 类型
│   │       ├── utils/
│   │       │   ├── lowcode.ts        ← getElComponent / 动态验证规则
│   │       │   ├── simpleAstGenerator.ts  ← AST 代码生成器 (核心)
│   │       │   └── validation.ts     ← 11 种验证规则引擎
│   │       └── views/lowcode/
│   │           ├── FormBuilder.vue    ← 表单设计器 (主页面)
│   │           └── FormConsumer.vue   ← 表单消费端 (主页面)
│   └── web/
├── packages/
│   ├── core/                         ← 框架无关核心算法 (已有62个测试)
│   │   └── src/
│   │       ├── asset/
│   │       │   ├── tree.ts            ← arrToTree (平铺 → 树)
│   │       │   ├── business.ts        ← 筛选 / 排序 / 汇总 / CSV导出
│   │       │   ├── statusFlow.ts      ← 状态流转 (transitionStatus)
│   │       │   └── workflow.ts        ← 工作流引擎 (状态机)
│   │       ├── rules/
│   │       │   └── buildRules.ts      ← 必填校验规则生成
│   │       ├── schema/
│   │       │   └── defaultNodes.ts    ← 默认节点定义
│   │       ├── types/
│   │       │   └── schema.ts          ← BaseNode 类型
│   │       └── visibility/
│   │           ├── evaluateExpression.ts  ← 可见性表达式求值
│   │           └── types.ts
│   └── shared/
│       └── src/
│           └── api/
│               └── request.ts        ← Axios 封装 + JWT 拦截器
├── docs/interview/
│   └── 面试话术手册.md              ← 刚才生成的 32 题话术
├── ARCHITECTURE.md                   ← 架构设计文档
├── LOWCODE_README.md                 ← 低代码功能详解
├── vite.workspace.ts
├── pnpm-workspace.yaml
└── package.json
