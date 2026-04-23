# 低代码表单系统 - 架构设计文档

## 📐 系统架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         浏览器端 (Frontend)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    Router: /form-builder                           │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │ │
│  │  │   Left Pane  │  │   Canvas     │  │  Right Panel             │ │ │
│  │  │              │  │              │  │  ┌────────────────────┐  │ │
│  │  │  物料库:     │  │  表单设计器  │  │  │  ComponentConfig   │  │ │
│  │  │  - input     │  │              │  │  │                    │  │ │
│  │  │  - select    │  │  拖拽编辑    │  │  │  基础配置:         │  │ │
│  │  │  - radio     │  │  排序        │  │  │  - field          │  │ │
│  │  │  - checkbox  │  │  预览        │  │  │  - label          │  │ │
│  │  │  - switch    │  │              │  │  │  - required       │  │ │
│  │  │  - date      │  │              │  │  │  - props          │  │ │
│  │  │              │  │              │  │  │                    │  │ │
│  │  │ 拖拽出发     │  │  FormSchema  │  │  │ 表单全局配置       │  │ │
│  │  └──────────────┘  │  (内存中)    │  │  └────────────────────┘  │ │
│  │       ↓             │              │  └──────────────────────────┘ │ │
│  │    dragstart        │              │             ↑                  │ │
│  │    setData          │              │         配置更新              │ │
│  │                     │              │                                │ │
│  │                     │   drop       │                                │ │
│  │                     │   ↓          │                                │ │
│  │                     │  addComponent │                               │ │
│  │                     │  到 components│                               │ │
│  │                     │  数组         │                               │ │
│  │                     │              │                                │ │
│  │                     │  预览: ✅    │                                │ │
│  │                     │  生成代码:   │                                │ │
│  │                     │  - Vue 代码  │                                │ │
│  │                     │  - JSON      │                                │ │
│  │                     │              │                                │ │
│  │                     │ saveButton   │                                │ │
│  │                     │    ↓         │                                │ │
│  │                     │  验证        │                                │ │
│  │                     │  序列化      │                                │ │
│  │                     │              │                                │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                              ↓                                            │
│                    saveFormSchemeApi()                                    │
│                              ↓                                            │
├─────────────────────────────────────────────────────────────────────────┤
│                         网络层 (HTTP)                                    │
│                   POST /forms/save                                       │
└─────────────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │   服务器 (Backend)   │
                    │                     │
                    │ Express/Django/...  │
                    │                     │
                    │ Route: POST /forms/ │
                    │ save                │
                    │                     │
                    │ - 验证请求         │
                    │ - 保存到数据库      │
                    │ - 返回成功响应      │
                    └─────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │   数据库 (Database)  │
                    │                     │
                    │ MongoDB/MySQL/...  │
                    │                     │
                    │ Collection: forms   │
                    │ {                   │
                    │   formId: "...",   │
                    │   title: "...",    │
                    │   components: [...] │
                    │ }                   │
                    └─────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         浏览器端 (Frontend)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │              Router: /form-consumer                               │ │
│  │                                                                    │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │                FormConsumer 组件                             │ │ │
│  │  │                                                              │ │ │
│  │  │  onMounted() {                                              │ │ │
│  │  │    getFormSchemaApi() ←─ 获取表单配置                       │ │ │
│  │  │      ↓                                                       │ │ │
│  │  │    initFormData()    ←─ 初始化表单数据                      │ │ │
│  │  │      ↓                                                       │ │ │
│  │  │    generateValidationRules() ←─ 生成验证规则                │ │ │
│  │  │      ↓                                                       │ │ │
│  │  │    schema.value = data                                      │ │ │
│  │  │  }                                                           │ │ │
│  │  │                                                              │ │ │
│  │  │  ┌──────────────────────────────────────────────────────┐  │ │ │
│  │  │  │  El-Form 组件                                        │  │ │ │
│  │  │  │  :model="formData"                                   │  │ │ │
│  │  │  │  :rules="formRules"                                  │  │ │ │
│  │  │  │                                                       │  │ │ │
│  │  │  │  v-for comp in schema.components                     │  │ │ │
│  │  │  │    El-Form-Item                                      │  │ │ │
│  │  │  │      :is="getElComponent(comp.type)"                 │  │ │ │
│  │  │  │      v-model="formData[comp.field]"                  │  │ │ │
│  │  │  │                                                       │  │ │ │
│  │  │  │  El-Button                                           │  │ │ │
│  │  │  │    @click="handleSubmit"                             │  │ │ │
│  │  │  │    @click="handleReset"                              │  │ │ │
│  │  │  │    @click="generateTemplateCode"                     │  │ │ │
│  │  │  └──────────────────────────────────────────────────────┘  │ │ │
│  │  │                                                              │ │ │
│  │  │  提交流程:                                                  │ │ │
│  │  │    handleSubmit()                                           │ │ │
│  │  │      ↓                                                       │ │ │
│  │  │    formRef.validate()                                       │ │ │
│  │  │      ↓                                                       │ │ │
│  │  │    POST /api/form-submit                                    │ │ │
│  │  │      ↓                                                       │ │ │
│  │  │    ElMessage.success()                                      │ │ │
│  │  │                                                              │ │ │
│  │  │  生成代码:                                                  │ │ │
│  │  │    generateTemplateCode()                                   │ │ │
│  │  │      ↓                                                       │ │ │
│  │  │    生成 Vue 完整代码                                         │ │ │
│  │  │      ↓                                                       │ │ │
│  │  │    显示在 Dialog 中                                         │ │ │
│  │  │      ↓                                                       │ │ │
│  │  │    copyCode()                                               │ │ │
│  │  │      ↓                                                       │ │ │
│  │  │    navigator.clipboard.writeText()                          │ │ │
│  │  │                                                              │ │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │ │
│  │                                                                  │ │ │
│  └────────────────────────────────────────────────────────────────┘ │ │
│                                                                      │ │
└─────────────────────────────────────────────────────────────────────┘
```

## 🗂️ 模块化设计

```
┌─────────────────────────────────────────────────────────────────┐
│                     类型定义层 (types/)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ lowcode.ts                                               │  │
│  │  - ComponentType                                         │  │
│  │  - FormComponent                                         │  │
│  │  - FormSchema                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   工具函数层 (utils/)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ lowcode.ts (核心工具)                                    │  │
│  │  - getElComponent()         → 组件映射                  │  │
│  │  - getDefaultValue()        → 默认值                    │  │
│  │  - getTriggerType()         → 触发事件                  │  │
│  │  - initFormData()           → 初始化数据                │  │
│  │  - generateValidationRules()→ 验证规则                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ validation.ts (验证工具)                                │  │
│  │  - generateElValidationRules()  → Element Plus 规则     │  │
│  │  - generateValidationRulesCode()→ 代码形式规则          │  │
│  │  - getTriggerByType()           → 触发事件              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   API 层 (api/)                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ form.ts                                                  │  │
│  │  - saveFormSchemeApi(data)  → POST /forms/save          │  │
│  │  - getFormSchemaApi()       → GET /forms/latest         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  组件层 (components/)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ FormPreview.vue                                          │  │
│  │  - 接收 schema prop                                      │  │
│  │  - 渲染表单                                              │  │
│  │  - 处理提交                                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ComponentConfig.vue                                      │  │
│  │  - 接收 component prop                                   │  │
│  │  - 编辑组件配置                                          │  │
│  │  - 支持类型特定配置                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 视图层 (views/lowcode/)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ FormBuilder.vue                                          │  │
│  │  - 左侧物料库                                            │  │
│  │  - 中间画布（核心设计器）                                │  │
│  │  - 右侧配置面板                                          │  │
│  │  - 生成代码与预览                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ FormConsumer.vue                                         │  │
│  │  - 加载表单配置                                          │  │
│  │  - 动态渲染表单                                          │  │
│  │  - 验证与提交                                            │  │
│  │  - 生成代码                                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 数据流向

### 构建流程 (Building Flow)
```
用户操作
  ↓
FormBuilder 组件状态更新
  ↓
schema.value 更新
  ↓
画布重新渲染
  ↓
用户点击"保存发布"
  ↓
saveFormSchemeApi() 调用
  ↓
HTTP POST /forms/save
  ↓
服务器保存到数据库
  ↓
返回成功消息
  ↓
ElMessage.success()
```

### 消费流程 (Consuming Flow)
```
FormConsumer 页面加载
  ↓
onMounted 触发
  ↓
getFormSchemaApi() 获取配置
  ↓
initFormData() 初始化表单数据
  ↓
generateValidationRules() 生成验证规则
  ↓
schema.value 赋值
  ↓
el-form 组件渲染
  ↓
v-for 循环 components
  ↓
动态创建 el-form-item
  ↓
用户填写表单
  ↓
点击提交
  ↓
formRef.validate() 验证
  ↓
验证通过 → POST /api/form-submit
  ↓
显示成功消息
```

## 📦 组件依赖图

```
FormBuilder.vue
├── ComponentConfig.vue (右侧配置面板)
├── El-Card
├── El-Form
├── El-Tabs
├── El-Button
└── import: getElComponent, getTriggerType

FormConsumer.vue
├── FormPreview.vue (可选)
├── El-Card
├── El-Form
├── El-Dialog
├── El-Button
└── import: getElComponent, initFormData, generateValidationRules

ComponentConfig.vue
├── El-Form
├── El-FormItem
├── El-Input
├── El-InputNumber
├── El-Select
├── El-Switch
├── El-Dialog
├── El-Button
└── El-Tag

FormPreview.vue
├── El-Card
├── El-Form
├── El-FormItem
├── El-Button
├── El-Empty
└── import: getElComponent, initFormData, generateValidationRules
```

## 🔗 状态管理流

```
FormBuilder (左)
├── schema (ref<FormSchema>)
│   ├── formId
│   ├── title
│   ├── labelWidth
│   └── components[]
├── materialList (ref)
├── activeComponentId (ref)
├── activeComponent (computed from activeComponentId)
└── 方法
    ├── handleDragStart()
    ├── handleDrop()
    ├── selectComponent()
    ├── deleteComponent()
    ├── generateCode()
    └── handleSave()

ComponentConfig (右)
├── component (props)
├── showOptionsDialog (ref)
├── editingOptions (ref)
└── 方法
    ├── addOption()
    ├── confirmOptions()
    └── watch: 监听 showOptionsDialog

FormConsumer
├── schema (ref<FormSchema | null>)
├── formData (ref<Record>)
├── formRules (ref<Record>)
├── generatedCode (ref)
├── showCodeDialog (ref)
├── 方法
    ├── handleSubmit()
    ├── handleReset()
    ├── generateTemplateCode()
    └── copyCode()
```

---

**版本**: 1.0.0 | **最后更新**: 2026-04-23
