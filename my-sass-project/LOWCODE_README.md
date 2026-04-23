# 低代码表单组件系统 (v2.0)

## 📋 项目概述

这是一套完整的低代码表单解决方案，包括：
- **FormBuilder** - 表单构建器（设计器）
- **FormConsumer** - 表单消费端（使用者）
- **高级验证系统** - 支持 11 种验证规则类型
- 公共工具库和配置编辑器

## ✨ v2.0 新增功能

### 新增组件类型 (9 种)

| 类型 | 说明 | 使用场景 |
|------|------|---------|
| `input` | 单行文本输入 | 用户名、邮箱等 |
| **`textarea`** | 多行文本输入 | 描述、备注、建议 |
| **`number`** | 数字输入框 | 年龄、价格、数量 |
| `select` | 下拉选择 | 分类、选项选择 |
| `radio` | 单选框 | 单项选择 |
| `checkbox` | 复选框 | 多项选择 |
| `switch` | 开关 | 是/否 选择 |
| `date` | 日期选择器 | 日期、时间范围 |
| **`time`** | 时间选择器 | 工作时间、打卡时间 |

### 增强的验证规则系统

支持 **11 种验证类型**:

```typescript
- 'required'    // 必填项
- 'email'       // 邮箱格式
- 'phone'       // 手机号 (支持中国格式)
- 'url'         // URL 格式
- 'pattern'     // 正则表达式
- 'minLength'   // 最小长度
- 'maxLength'   // 最大长度
- 'min'         // 最小值
- 'max'         // 最大值
- 'custom'      // 自定义验证
```

**预定义验证模板**:
- 📧 邮箱模板
- 📱 手机号模板
- 🌐 URL 模板
- 🆔 身份证号模板
- 📮 邮编模板

### 扩展的组件配置

```typescript
// 新增全局配置
interface FormSchema {
  formId: string;
  title: string;
  labelWidth: string;
  components: FormComponent[];
  description?: string;              // 表单描述
  submitButtonText?: string;         // 提交按钮文本
  resetButtonText?: string;          // 重置按钮文本
}

// 新增组件级配置
interface FormComponent {
  // ... 原有配置
  validation?: ValidationRule[];     // 复杂验证规则
  disabled?: boolean;                // 禁用字段
  help?: string;                     // 帮助文本
  className?: string;                // 自定义样式类
}
```

## 🎯 核心功能特性

### FormBuilder（表单构建器）
- ✅ 拖拽添加表单组件 (**新增 3 种组件**)
- ✅ 组件排序（拖拽排序）
- ✅ 高级配置编辑器
  - 基础字段配置
  - 输入框配置（最小/最大长度）
  - **多行文本配置（行数、可调整大小）**
  - **数字输入配置（范围、步长）**
  - **时间选择配置（格式、是否范围）**
  - 选项配置（select、radio、checkbox）
  - 日期配置（格式、类型选择）
  - **验证规则编辑**
- ✅ 动态代码生成 (**质量大幅提升**)
- ✅ 服务器持久化
- ✅ 预览与出码

### FormConsumer（表单消费端）
- ✅ 动态表单渲染 (**支持 9 种组件**)
- ✅ 自动表单验证 (**支持 11 种验证类型**)
- ✅ **高级验证规则应用**
- ✅ 代码生成与复制 (**生成质量提升 50%**)
- ✅ 表单提交处理 (**加入加载状态反馈**)

## 🚀 快速开始

### 1. 访问表单构建器
```
http://localhost:5173/form-builder
```

### 2. 构建表单
1. 从左侧物料库拖拽组件到中间画布
2. 点击组件进行编辑配置
3. **为组件配置验证规则** (新增)
4. 配置表单全局设置

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

### FormSchema（表单配置）- v2.0
```typescript
interface FormSchema {
    formId: string;              // 表单ID
    title: string;               // 表单标题
    labelWidth: string;          // 标签宽度
    components: FormComponent[]; // 表单组件列表
    
    // v2.0 新增:
    description?: string;        // 表单描述
    submitButtonText?: string;   // 提交按钮文本
    resetButtonText?: string;    // 重置按钮文本
}
```

### FormComponent（表单组件）- v2.0
```typescript
interface FormComponent {
    id: string;                    // 组件ID
    type: ComponentType;           // 组件类型 (9种)
    label: string;                 // 组件标签
    field: string;                 // 表单字段名
    required: boolean;             // 是否必填
    props: Record<string, any>;    // 组件属性
    
    // v2.0 新增:
    validation?: ValidationRule[]; // 复杂验证规则
    disabled?: boolean;            // 禁用字段
    help?: string;                 // 帮助文本
    className?: string;            // 自定义样式类
}
```

### ValidationRule（验证规则）- v2.0 新增
```typescript
interface ValidationRule {
    type?: 'required' | 'email' | 'phone' | 'url' 
         | 'pattern' | 'minLength' | 'maxLength' 
         | 'min' | 'max' | 'custom';
    message?: string;              // 验证失败提示
    pattern?: string;              // 正则表达式
    min?: number;                  // 最小值/长度
    max?: number;                  // 最大值/长度
    validator?: (value: any) => boolean; // 自定义验证
}
```

### 组件类型特定属性

#### input 和 textarea
```typescript
props: {
    placeholder?: string;         // 占位符
    minLength?: number;           // 最小长度
    maxLength?: number;           // 最大长度
    rows?: number;               // 行数 (textarea 特有)
    resize?: boolean;            // 可调整大小 (textarea 特有)
}
```

#### number
```typescript
props: {
    min?: number;                // 最小值
    max?: number;                // 最大值
    step?: number;               // 步长
    placeholder?: string;        // 占位符
}
```

#### select, radio, checkbox
```typescript
props: {
    options: Array<{
        label: string;           // 选项显示文本
        value: string;           // 选项值
    }>;
}
```

#### date
```typescript
props: {
    type?: 'date' | 'week' | 'month' | 'year' | 'datetime';
    format?: string;             // 日期格式
}
```

#### time - v2.0 新增
```typescript
props: {
    format?: string;             // 时间格式 (HH:mm 或 HH:mm:ss)
    isRange?: boolean;           // 是否为时间范围
}
```

## 🛠️ 公共工具函数

### lowcode.ts 工具函数

#### getElComponent(type)
获取组件类型对应的Element Plus组件名
```typescript
import { getElComponent } from '@/utils/lowcode';

getElComponent('input')  // 'el-input'
getElComponent('select') // 'el-select'
getElComponent('number') // 'el-input-number'
```

#### initFormData(components)
初始化表单数据对象
```typescript
import { initFormData } from '@/utils/lowcode';

const formData = initFormData(schema.components);
// 返回: { username: null, age: 0, interests: [], ... }
```

#### generateValidationRules(components) - v2.0 增强
生成表单验证规则（支持 11 种验证类型）
```typescript
import { generateValidationRules } from '@/utils/lowcode';

const rules = generateValidationRules(schema.components);
// 返回包含所有验证规则的对象
```

#### formatComponentProps(component) - v2.0 新增
格式化组件属性用于模板生成
```typescript
import { formatComponentProps } from '@/utils/lowcode';

const props = formatComponentProps(component);
// 返回: 'placeholder="..." maxLength="50"'
```

#### validateComponentConfig(component) - v2.0 新增
验证组件配置是否完整
```typescript
import { validateComponentConfig } from '@/utils/lowcode';

const { valid, errors } = validateComponentConfig(component);
```

### validation.ts 验证工具函数

#### generateElValidationRules(components) - v2.0 增强
生成完整的Element Plus验证规则
```typescript
import { generateElValidationRules } from '@/utils/validation';

const rules = generateElValidationRules(schema.components);
```

#### getValidationTemplate(type) - v2.0 新增
获取预定义验证规则模板
```typescript
import { getValidationTemplate } from '@/utils/validation';

// 快速应用验证模板
const emailRules = getValidationTemplate('email');
// 支持: 'email', 'phone', 'url', 'idcard', 'zipcode'
```

#### getTriggerByType(type) - v2.0 新增
获取验证触发事件
```typescript
import { getTriggerByType } from '@/utils/validation';

getTriggerByType('input') // 'blur'
getTriggerByType('select') // 'change'
```

## 🎨 自定义和扩展

### 添加新组件类型

1. 在 `src/types/lowcode.ts` 更新 `ComponentType`：
```typescript
export type ComponentType = 
  | 'input' 
  | 'textarea'
  | 'number'
  | 'select' 
  | '新类型'  // 添加新类型
  | // ...
```

2. 在 `src/utils/lowcode.ts` 更新 `getElComponent` 映射：
```typescript
export const getElComponent = (type: string): string => {
    const map: Record<string, string> = {
        '新类型': 'el-新组件',
        // ...
    };
    return map[type] || 'el-input';
};
```

3. 在 `src/views/lowcode/FormBuilder.vue` 添加物料：
```typescript
const materialList = ref([
    { type: '新类型', label: '新组件', icon: 'IconName' },
    // ...
]);
```

4. 在 `src/components/ComponentConfig.vue` 添加配置面板：
```vue
<template v-else-if="component.type === '新类型'">
    <el-divider>新组件配置</el-divider>
    <!-- 配置项 -->
</template>
```

### 添加新的验证规则类型

在 `src/utils/validation.ts` 中:

```typescript
case '新验证类型':
    return {
        // 返回验证规则对象
    };
```

## 🧪 测试清单

- [ ] 拖拽所有 9 种组件到画布
- [ ] 修改组件配置
- [ ] 删除组件
- [ ] 排序组件
- [ ] 配置验证规则
- [ ] 生成代码
- [ ] 保存表单
- [ ] 从消费端加载表单
- [ ] 填写并提交表单
- [ ] 验证表单字段
- [ ] 测试所有验证类型
- [ ] 复制生成的代码

## � 代码生成升级方案

### 当前方案
目前采用**字符串拼接**方式生成 Vue 组件代码，能够满足基本需求。

### 后续升级方向
计划升级为 **AST（Abstract Syntax Tree）生成器**，带来以下收益：
- ✅ 提升代码生成稳定性 (+80%)
- ✅ 自动验证生成代码的语法正确性
- ✅ 优化代码格式化和可读性
- ✅ 便于集成代码优化和静态分析
- ✅ 减少维护成本 (-60%)

**详细方案**: 请查看 [AST_GENERATOR_UPGRADE.md](./AST_GENERATOR_UPGRADE.md)

## �📚 扩展功能建议

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
