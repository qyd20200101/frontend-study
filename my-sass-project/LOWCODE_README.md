# 低代码表单组件系统

## 📋 项目概述

这是一套完整的低代码表单解决方案，包括：
- **FormBuilder** - 表单构建器（设计器）
- **FormConsumer** - 表单消费端（使用者）
- 公共工具库和配置编辑器

## 🎯 功能特性

### FormBuilder（表单构建器）
- ✅ 拖拽添加表单组件
- ✅ 组件排序（拖拽排序）
- ✅ 高级配置编辑器
  - 基础字段配置
  - 输入框配置（最小/最大长度）
  - 选项配置（select、radio、checkbox）
  - 日期配置（格式、类型选择）
- ✅ 动态代码生成
- ✅ 服务器持久化
- ✅ 预览与出码

### FormConsumer（表单消费端）
- ✅ 动态表单渲染
- ✅ 自动表单验证
- ✅ 代码生成与复制
- ✅ 表单提交处理

### 支持的组件类型
- `input` - 单行文本输入
- `select` - 下拉选择
- `radio` - 单选框
- `checkbox` - 复选框
- `switch` - 开关
- `date` - 日期选择器

## 🚀 快速开始

### 1. 访问表单构建器
```
http://localhost:5173/form-builder
```

### 2. 构建表单
1. 从左侧物料库拖拽组件到中间画布
2. 点击组件进行编辑配置
3. 配置表单全局设置

### 3. 发布表单
点击"保存发布"按钮，表单配置会被保存到服务器

### 4. 使用表单
```
http://localhost:5173/form-consumer
```
表单会自动从服务器加载并渲染

### 5. 生成代码
点击"生成模板代码"按钮，获取可复用的Vue组件代码

## 📁 项目结构

```
src/
├── views/lowcode/
│   ├── FormBuilder.vue      # 表单构建器
│   └── FormConsumer.vue     # 表单消费端
├── components/
│   ├── FormPreview.vue      # 表单预览组件
│   └── ComponentConfig.vue  # 组件配置编辑器
├── api/
│   └── form.ts              # 表单API接口
├── types/
│   └── lowcode.ts           # TypeScript类型定义
├── utils/
│   ├── lowcode.ts           # 公共工具函数
│   └── validation.ts        # 验证规则生成器
└── router/
    └── index.ts             # 路由配置
```

## 🔌 API接口

### 保存表单配置
```typescript
POST /forms/save
Body: FormSchema
```

### 获取最新表单配置
```typescript
GET /forms/latest
Response: FormSchema | null
```

## 📝 数据结构

### FormSchema（表单配置）
```typescript
interface FormSchema {
    formId: string;           // 表单ID
    title: string;            // 表单标题
    labelWidth: string;       // 标签宽度
    components: FormComponent[]; // 表单组件列表
}
```

### FormComponent（表单组件）
```typescript
interface FormComponent {
    id: string;              // 组件ID
    type: ComponentType;     // 组件类型
    label: string;           // 组件标签
    field: string;           // 表单字段名
    required: boolean;       // 是否必填
    props: Record<string, any>; // 组件属性
}
```

## 🛠️ 公共工具函数

### getElComponent(type)
获取组件类型对应的Element Plus组件名

```typescript
import { getElComponent } from '@/utils/lowcode';

getElComponent('input')  // 'el-input'
getElComponent('select') // 'el-select'
```

### initFormData(components)
初始化表单数据对象

```typescript
import { initFormData } from '@/utils/lowcode';

const formData = initFormData(schema.components);
```

### generateValidationRules(components)
生成表单验证规则

```typescript
import { generateValidationRules } from '@/utils/lowcode';

const rules = generateValidationRules(schema.components);
```

## 🎨 自定义组件配置

### 添加新组件类型

1. 在 `src/types/lowcode.ts` 更新 `ComponentType`：
```typescript
export type ComponentType = 'input' | 'select' | '新类型';
```

2. 在 `src/utils/lowcode.ts` 更新 `getElComponent` 映射：
```typescript
const map: Record<string, string> = {
    '新类型': 'el-新组件',
    // ...
};
```

3. 在 `src/views/lowcode/FormBuilder.vue` 添加物料：
```typescript
const materialList = ref([
    { type: '新类型', label: '新组件', icon: 'IconName' },
    // ...
]);
```

## 🧪 测试清单

- [ ] 拖拽组件到画布
- [ ] 修改组件配置
- [ ] 删除组件
- [ ] 排序组件
- [ ] 生成代码
- [ ] 保存表单
- [ ] 从消费端加载表单
- [ ] 填写并提交表单
- [ ] 验证表单字段
- [ ] 复制生成的代码

## 📚 扩展功能建议

1. **表单模板库** - 预建模板库
2. **版本管理** - 表单版本历史
3. **权限控制** - 基于角色的访问控制
4. **表单分析** - 提交数据统计
5. **字段绑定** - 表单字段联动
6. **自定义校验** - 高级校验规则
7. **主题定制** - 样式主题配置

## 🐛 已知问题

暂无

## 📞 支持

有问题？提交Issue或联系开发团队

---

**最后更新**: 2026-04-23
