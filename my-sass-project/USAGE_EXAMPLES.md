# 低代码表单系统 — 使用示例 & 快速参考

## 快速参考

### 组件类型速查

| 类型 | Element Plus 组件 | 默认值 | 触发事件 | 特殊配置 |
|------|-------------------|--------|---------|----------|
| `input` | el-input | null | blur | placeholder / maxLength / minLength |
| `textarea` | el-input | null | blur | rows / resize / maxLength |
| `number` | el-input-number | 0 | change | min / max / step |
| `select` | el-select | [] | change | options |
| `radio` | el-radio-group | [] | change | options |
| `checkbox` | el-checkbox-group | [] | change | options |
| `switch` | el-switch | false | change | activeText / inactiveText |
| `date` | el-date-picker | null | change | type / format |
| `time` | el-time-picker | null | change | format / isRange |

### 验证规则速查

| 类型 | 参数 | 示例 |
|------|------|------|
| `required` | message | `{ type: 'required', message: '必填' }` |
| `email` | message | `{ type: 'email', message: '邮箱格式错误' }` |
| `phone` | message | `{ type: 'phone', message: '手机号错误' }` |
| `url` | message | `{ type: 'url', message: 'URL格式错误' }` |
| `pattern` | pattern, message | `{ type: 'pattern', pattern: '^[0-9]+$', message: '仅数字' }` |
| `minLength` | min, message | `{ type: 'minLength', min: 6, message: '至少6字符' }` |
| `maxLength` | max, message | `{ type: 'maxLength', max: 20, message: '最多20字符' }` |
| `min` | min, message | `{ type: 'min', min: 0, message: '最小值为0' }` |
| `max` | max, message | `{ type: 'max', max: 100, message: '最大值为100' }` |
| `custom` | validator, message | `{ type: 'custom', validator: (val) => val > 5 }` |

### 预定义验证模板

```typescript
import { getValidationTemplate } from '@/utils/validation';

getValidationTemplate('email');    // 邮箱
getValidationTemplate('phone');    // 手机号
getValidationTemplate('url');      // URL
getValidationTemplate('idcard');   // 身份证
getValidationTemplate('zipcode');  // 邮编
```

### 常用导入

```typescript
// 工具函数
import { getElComponent, initFormData, generateValidationRules, getTriggerType,
         formatComponentProps, validateComponentConfig, cloneComponent
} from '@/utils/lowcode';

// 验证工具
import { generateElValidationRules, getValidationTemplate, getTriggerByType
} from '@/utils/validation';

// API
import { saveFormSchemeApi, getFormSchemaApi } from '@/api/form';

// 类型
import type { FormSchema, FormComponent } from '@/types/lowcode';
```

### 工具函数速查

| 函数 | 输入 | 输出 | 用途 |
|-----|------|------|------|
| `getElComponent(type)` | string | string | 获取 ElPlus 组件名 |
| `getDefaultValue(type)` | string | any | 获取默认值 |
| `initFormData(components)` | Component[] | Object | 初始化表单数据 |
| `generateValidationRules(components)` | Component[] | Object | 生成 Element Plus rules |
| `getTriggerByType(type)` | string | 'blur'\|'change' | 获取验证触发事件 |
| `validateComponentConfig(comp)` | Component | {valid, errors} | 验证配置完整性 |
| `formatComponentProps(comp)` | Component | string | 格式化属性字符串 |
| `getValidationTemplate(type)` | string | ValidationRule[] | 获取验证模板 |

### FormConsumer 动态渲染模板

```vue
<template>
  <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
    <el-form-item v-for="comp in schema.components" :key="comp.id" :label="comp.label" :prop="comp.field">
      <component :is="getElComponent(comp.type)" v-model="formData[comp.field]" v-bind="comp.props" />
    </el-form-item>
  </el-form>
</template>
```

---

## 完整示例

### 示例 1: 用户注册表单（全组件演示）

```typescript
import type { FormSchema } from '@/types/lowcode';

export const userRegistrationForm: FormSchema = {
  formId: 'user_registration_form',
  title: '用户注册表单',
  description: '请填写以下信息完成注册',
  labelWidth: '120px',
  submitButtonText: '注册',
  resetButtonText: '清空',
  components: [
    {
      id: 'input_username', type: 'input', label: '用户名', field: 'username',
      required: true,
      props: { placeholder: '请输入用户名', minLength: 4, maxLength: 20 },
      validation: [{ type: 'minLength', min: 4, message: '用户名至少 4 个字符' }],
    },
    {
      id: 'input_email', type: 'input', label: '邮箱地址', field: 'email',
      required: true,
      props: { placeholder: 'example@email.com' },
      validation: [{ type: 'email', message: '请输入有效的邮箱地址' }],
    },
    {
      id: 'input_phone', type: 'input', label: '手机号', field: 'phone',
      required: true,
      props: { placeholder: '请输入11位手机号' },
      validation: [{ type: 'phone', message: '请输入正确的手机号' }],
    },
    {
      id: 'textarea_bio', type: 'textarea', label: '个人简介', field: 'bio',
      required: false,
      props: { placeholder: '请输入个人简介', rows: 4, maxLength: 500 },
    },
    {
      id: 'number_age', type: 'number', label: '年龄', field: 'age',
      required: true,
      props: { min: 18, max: 100, step: 1 },
      validation: [{ type: 'min', min: 18, message: '年龄必须大于 18 岁' }],
    },
    {
      id: 'select_gender', type: 'select', label: '性别', field: 'gender',
      required: true,
      props: { options: [
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
      ]},
    },
    {
      id: 'date_birthday', type: 'date', label: '出生日期', field: 'birthday',
      required: true,
      props: { type: 'date', format: 'YYYY-MM-DD' },
    },
    {
      id: 'time_register', type: 'time', label: '参考报到时间', field: 'registerTime',
      required: true,
      props: { format: 'HH:mm', isRange: false },
    },
    {
      id: 'checkbox_interests', type: 'checkbox', label: '兴趣爱好', field: 'interests',
      required: false,
      props: { options: [
        { label: '阅读', value: 'reading' },
        { label: '运动', value: 'sports' },
        { label: '游戏', value: 'gaming' },
      ]},
    },
    {
      id: 'switch_agree', type: 'switch', label: '同意用户协议', field: 'agreeTerms',
      required: true,
      props: { activeText: '已同意', inactiveText: '未同意' },
    },
  ],
};
```

### 示例 2: 商品发布表单

```typescript
export const productPublishForm: FormSchema = {
  formId: 'product_publish_form',
  title: '商品发布',
  labelWidth: '100px',
  submitButtonText: '发布商品',
  components: [
    { id: 'name', type: 'input', label: '商品名称', field: 'productName', required: true, props: { maxLength: 50 } },
    {
      id: 'price', type: 'number', label: '价格（元）', field: 'price', required: true,
      props: { min: 0, max: 999999, step: 0.01 },
      validation: [{ type: 'min', min: 0.01, message: '价格必须大于 0' }],
    },
    {
      id: 'stock', type: 'number', label: '库存', field: 'stock', required: true,
      props: { min: 0, max: 99999, step: 1 },
    },
    {
      id: 'category', type: 'select', label: '分类', field: 'category', required: true,
      props: { options: [
        { label: '服装', value: 'clothing' },
        { label: '电子', value: 'electronics' },
      ]},
    },
    {
      id: 'desc', type: 'textarea', label: '描述', field: 'description', required: true,
      props: { rows: 6, maxLength: 2000 },
    },
    { id: 'pdate', type: 'date', label: '发布日期', field: 'publishDate', required: true,
      props: { type: 'date', format: 'YYYY-MM-DD' } },
    { id: 'recommend', type: 'switch', label: '推荐商品', field: 'isRecommended', required: false,
      props: { activeText: '是', inactiveText: '否' } },
  ],
};
```

### 示例 3: 快速验证模板使用

```typescript
import { getValidationTemplate } from '@/utils/validation';

// 一键应用
const emailComp = { type: 'input', field: 'email', label: '邮箱',
  validation: getValidationTemplate('email') };

const phoneComp = { type: 'input', field: 'phone', label: '手机号',
  validation: getValidationTemplate('phone') };

const idCardComp = { type: 'input', field: 'idCard', label: '身份证',
  validation: getValidationTemplate('idcard') };
```

### 示例 4: 动态生成 + 提交

```typescript
import { initFormData, generateValidationRules } from '@/utils/lowcode';

const schema = getUserForm();
const formData = initFormData(schema.components);
const rules = generateValidationRules(schema.components);

const handleSubmit = async (formRef) => {
  try {
    await formRef.validate();
    console.log('验证通过:', formData);
  } catch {
    console.log('验证失败');
  }
};
```

---

## 添加新组件（4 步速查）

```typescript
// 1. types/lowcode.ts — 扩展类型
export type ComponentType = '...existing...' | 'my-component';

// 2. utils/lowcode.ts — 添加映射
const map = { 'my-component': 'el-my-component' };

// 3. FormBuilder.vue — 添加物料
materialList.push({ type: 'my-component', label: '我的组件', icon: 'Custom' });

// 4. ComponentConfig.vue — 添加配置面板
<template v-else-if="component.type === 'my-component'">
  <!-- 配置UI -->
</template>
```

---

## 最佳实践

- **选型**: 短文本用 `input`，长文本用 `textarea`，数值用 `number`，日期用 `date`/`time`，选项用 `select`/`radio`/`checkbox`
- **验证**: 具体明确的消息（"请输入有效的邮箱地址"），避免模糊的"必填"
- **属性**: 为 input/textarea 设置合理的 `maxLength`，为 number 设置范围
- **性能**: 用 computed 处理派生数据，避免不必要的 watch

---

**版本**: 2.0 | **最后更新**: 2026-04-23
