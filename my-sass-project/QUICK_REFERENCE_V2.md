# 低代码表单系统 - 快速参考卡 (v2.0)

## 📦 新增组件类型速查表

| 类型 | Element Plus 组件 | 默认值 | 特殊配置 |
|------|-------------------|-------|---------|
| `input` | el-input | null | maxLength, minLength |
| `textarea` | el-input | null | rows, resize, maxLength |
| `number` | el-input-number | 0 | min, max, step |
| `select` | el-select | [] | options |
| `radio` | el-radio-group | [] | options |
| `checkbox` | el-checkbox-group | [] | options |
| `switch` | el-switch | false | activeText, inactiveText |
| `date` | el-date-picker | null | type, format |
| `time` | el-time-picker | null | format, isRange |

## ✅ 验证规则速查表

| 类型 | 参数 | 说明 | 示例 |
|------|------|------|------|
| `required` | message | 必填项 | `{ type: 'required', message: '必填' }` |
| `email` | message | 邮箱格式 | `{ type: 'email', message: '邮箱格式错误' }` |
| `phone` | message | 手机号 (中国) | `{ type: 'phone', message: '手机号错误' }` |
| `url` | message | URL 格式 | `{ type: 'url', message: 'URL格式错误' }` |
| `pattern` | pattern, message | 正则验证 | `{ type: 'pattern', pattern: '^[0-9]+$', message: '仅数字' }` |
| `minLength` | min, message | 最小长度 | `{ type: 'minLength', min: 6, message: '至少6字符' }` |
| `maxLength` | max, message | 最大长度 | `{ type: 'maxLength', max: 20, message: '最多20字符' }` |
| `min` | min, message | 最小值 | `{ type: 'min', min: 0, message: '最小值为0' }` |
| `max` | max, message | 最大值 | `{ type: 'max', max: 100, message: '最大值为100' }` |
| `custom` | validator, message | 自定义 | `{ type: 'custom', validator: (val) => val.length > 5 }` |

## 🚀 常用代码片段

### 创建基础表单组件

```typescript
// input 组件
{
  type: 'input',
  label: '用户名',
  field: 'username',
  required: true,
  props: { maxLength: 50 }
}

// textarea 组件 (新增)
{
  type: 'textarea',
  label: '描述',
  field: 'description',
  required: true,
  props: { rows: 4, maxLength: 500 }
}

// number 组件 (新增)
{
  type: 'number',
  label: '年龄',
  field: 'age',
  required: true,
  props: { min: 0, max: 120, step: 1 }
}

// time 组件 (新增)
{
  type: 'time',
  label: '时间',
  field: 'time',
  required: true,
  props: { format: 'HH:mm' }
}
```

### 应用验证规则

```typescript
// 方式一：使用预定义模板
import { getValidationTemplate } from '@/utils/validation';

component.validation = getValidationTemplate('email');

// 方式二：自定义验证规则
component.validation = [
  { type: 'required', message: '邮箱必填' },
  { type: 'email', message: '邮箱格式错误' }
];

// 方式三：正则表达式
component.validation = [
  { type: 'pattern', pattern: '^[a-zA-Z0-9]+$', message: '仅支持字母和数字' }
];
```

### 初始化和验证

```typescript
import { 
  initFormData, 
  generateValidationRules 
} from '@/utils/lowcode';

// 初始化表单数据
const formData = initFormData(schema.components);

// 生成验证规则
const formRules = generateValidationRules(schema.components);

// 提交时验证
formRef.value?.validate()
  .then(() => { /* 通过 */ })
  .catch(() => { /* 失败 */ });
```

## 📋 预定义验证模板

```typescript
import { getValidationTemplate } from '@/utils/validation';

// 邮箱
getValidationTemplate('email');
// → [
//   { type: 'required', message: '邮箱不能为空' },
//   { type: 'email', message: '请输入正确的邮箱格式' }
// ]

// 手机号
getValidationTemplate('phone');
// → [
//   { type: 'required', message: '手机号不能为空' },
//   { type: 'phone', message: '请输入正确的手机号' }
// ]

// URL
getValidationTemplate('url');
// → [
//   { type: 'required', message: 'URL不能为空' },
//   { type: 'url', message: '请输入正确的URL' }
// ]

// 身份证号
getValidationTemplate('idcard');
// → [
//   { type: 'required', message: '身份证号不能为空' },
//   { type: 'pattern', pattern: /^[1-9]\d{5}...$/, message: '请输入正确的身份证号' }
// ]

// 邮编
getValidationTemplate('zipcode');
// → [
//   { type: 'required', message: '邮编不能为空' },
//   { type: 'pattern', pattern: /^\d{5,6}$/, message: '请输入5-6位邮编' }
// ]
```

## 🎯 FormBuilder 组件配置

### 物料库列表（FormBuilder 左侧）

```typescript
const materialList = [
  { type: 'input', label: '单行文本', icon: 'Edit' },
  { type: 'textarea', label: '多行文本', icon: 'Document' },  // 新增
  { type: 'number', label: '数字输入', icon: 'Plus' },       // 新增
  { type: 'select', label: '下拉选择', icon: 'Filter' },
  { type: 'radio', label: '单选框', icon: 'CheckBox' },
  { type: 'checkbox', label: '复选框', icon: 'DocumentCopy' },
  { type: 'switch', label: '开关', icon: 'SwitchButton' },
  { type: 'date', label: '日期选择', icon: 'Calendar' },
  { type: 'time', label: '时间选择', icon: 'Timer' }         // 新增
];
```

## 📱 FormConsumer 渲染

### 动态生成表单

```vue
<template>
  <el-form 
    ref="formRef" 
    :model="formData" 
    :rules="formRules" 
    label-width="120px"
  >
    <!-- 自动为每种组件类型生成对应的渲染 -->
    <el-form-item 
      v-for="comp in schema.components" 
      :key="comp.id" 
      :label="comp.label" 
      :prop="comp.field"
    >
      <!-- 渲染对应的组件 -->
      <component 
        :is="getElComponent(comp.type)" 
        v-model="formData[comp.field]"
        v-bind="comp.props"
      />
    </el-form-item>
  </el-form>
</template>
```

## 🔧 工具函数速查

| 函数 | 输入 | 输出 | 用途 |
|-----|------|------|------|
| `getElComponent(type)` | string | string | 获取 ElPlus 组件名 |
| `getDefaultValue(type)` | string | any | 获取默认值 |
| `initFormData(components)` | Component[] | Object | 初始化表单数据 |
| `generateValidationRules(components)` | Component[] | Object | 生成验证规则 |
| `getTriggerByType(type)` | string | 'blur'\|'change' | 获取触发事件 |
| `validateComponentConfig(component)` | Component | {valid, errors} | 验证配置完整性 |
| `formatComponentProps(component)` | Component | string | 格式化属性 |
| `generateOptionsTemplate(component)` | Component | string | 生成选项模板 |
| `getValidationTemplate(type)` | string | ValidationRule[] | 获取验证模板 |

## 💾 保存/加载表单

```typescript
import { saveFormSchemeApi, getFormSchemaApi } from '@/api/form';

// 保存表单
await saveFormSchemeApi(schema);
// POST /forms/save

// 加载表单
const schema = await getFormSchemaApi();
// GET /forms/latest
```

## 🎨 组件配置示例对比

### v1.0 配置
```typescript
{
  id: 'input_001',
  type: 'input',
  label: '用户名',
  field: 'username',
  required: true,
  props: { placeholder: '请输入' }
}
```

### v2.0 配置 (增强)
```typescript
{
  id: 'input_001',
  type: 'input',
  label: '用户名',
  field: 'username',
  required: true,
  disabled: false,                    // 新增
  help: '4-20 个字符',               // 新增
  props: { 
    placeholder: '请输入',
    maxLength: 20
  },
  validation: [                       // 新增
    { type: 'minLength', min: 4, message: '最少4字符' },
    { type: 'maxLength', max: 20, message: '最多20字符' }
  ]
}
```

## 🐛 常见问题速查

| 问题 | 解决方案 |
|------|---------|
| 验证规则不生效 | 检查 `required` 或 `validation` 是否配置 |
| 下拉框选项不显示 | 检查 `props.options` 是否有值 |
| 日期格式错误 | 检查 `props.format` 是否正确 |
| 代码生成不完整 | 检查组件配置是否完整 (field, label) |
| 表单无法保存 | 确保后端 `/forms/save` 接口正常 |

## 📚 相关文档

- 📖 [LOWCODE_README.md](LOWCODE_README.md) - 完整功能文档
- 🚀 [UPGRADE_CHANGELOG.md](UPGRADE_CHANGELOG.md) - 版本升级说明
- 💡 [USAGE_EXAMPLES_V2.md](USAGE_EXAMPLES_V2.md) - 使用示例
- 👨‍💻 [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - 开发者指南

---

**版本**: 2.0  
**更新日期**: 2026-04-23  

💡 **提示**: 将本页面加入浏览器书签以便快速查阅！
