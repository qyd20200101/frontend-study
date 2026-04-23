# 低代码表单系统 - 开发者指南

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────┐
│          FormBuilder (设计器)                        │
│  ┌────────────┐  ┌─────────────┐  ┌────────────┐   │
│  │  物料库    │  │   画布      │  │  配置面板  │   │
│  └────────────┘  └─────────────┘  └────────────┘   │
│         ↓              ↓                 ↓           │
│         └──────────────┬──────────────────┘           │
│                        ↓                              │
│              FormSchema JSON Schema                   │
│                        ↓                              │
│         saveFormSchemeApi (/forms/save)               │
└─────────────────────────────────────────────────────┘
                        ↓
                   服务器数据库
                        ↓
┌─────────────────────────────────────────────────────┐
│         FormConsumer (消费端)                        │
│  ┌────────────────────────────────────┐              │
│  │  表单动态渲染 + 验证 + 提交         │              │
│  └────────────────────────────────────┘              │
│         ↓              ↓                              │
│   代码生成      表单提交处理                           │
└─────────────────────────────────────────────────────┘
```

## 🔑 核心概念

### FormSchema（表单配置）
表单的完整定义，包括所有组件、验证规则、布局设置等。

```typescript
{
  formId: "form_123456",
  title: "用户信息表单",
  labelWidth: "100px",
  components: [
    // ... FormComponent 数组
  ]
}
```

### FormComponent（表单组件）
单个表单字段的定义，包括类型、验证、属性等。

```typescript
{
  id: "input_001",
  type: "input",
  label: "用户名",
  field: "username",
  required: true,
  props: {
    placeholder: "请输入用户名",
    maxLength: 20
  }
}
```

## 📊 数据流向

### 构建流程
1. 用户在 FormBuilder 中拖拽组件
2. 配置组件属性
3. 点击"保存发布"
4. 通过 `saveFormSchemeApi` 发送到服务器
5. 服务器保存到数据库

### 使用流程
1. FormConsumer 页面加载
2. 通过 `getFormSchemaApi` 从服务器获取配置
3. 使用 `initFormData` 初始化表单数据
4. 使用 `generateValidationRules` 生成验证规则
5. 渲染动态表单
6. 用户填写并提交

## 🛠️ 扩展指南

### 添加新组件类型

#### Step 1: 更新类型定义
```typescript
// src/types/lowcode.ts
export type ComponentType = 
  | 'input' 
  | 'select' 
  | 'radio' 
  | 'checkbox' 
  | 'switch' 
  | 'date'
  | 'textarea'      // 新增
  | 'time'          // 新增
```

#### Step 2: 更新组件映射
```typescript
// src/utils/lowcode.ts
export const getElComponent = (type: string): string => {
  const map: Record<string, string> = {
    'input': 'el-input',
    'select': 'el-select',
    'textarea': 'el-input',  // 新增
    'time': 'el-time-picker', // 新增
    // ...
  };
  return map[type] || 'el-input';
};
```

#### Step 3: 添加默认值处理
```typescript
// src/utils/lowcode.ts
export const getDefaultValue = (type: string): any => {
  switch (type) {
    case 'switch':
      return false;
    case 'checkbox':
    case 'select':
    case 'radio':
      return [];
    case 'time':           // 新增
      return null;
    default:
      return null;
  }
};
```

#### Step 4: 更新验证规则触发器
```typescript
// src/utils/lowcode.ts
export const getTriggerType = (type: string): string => {
  return ['input', 'textarea'].includes(type) ? 'blur' : 'change';
};
```

#### Step 5: 在 FormBuilder 中添加物料
```typescript
// src/views/lowcode/FormBuilder.vue
const materialList = ref([
  { type: 'input', label: '单行文本', icon: 'Edit' },
  { type: 'textarea', label: '多行文本', icon: 'Document' }, // 新增
  { type: 'time', label: '时间选择', icon: 'Clock' }, // 新增
  // ...
]);
```

### 自定义组件配置编辑器

在 `src/components/ComponentConfig.vue` 中添加新组件的配置UI：

```vue
<template>
  <template v-else-if="component.type === 'textarea'">
    <el-divider>多行文本配置</el-divider>
    
    <el-form-item label="行数">
      <el-input-number 
        v-model.number="component.props.rows"
        :min="1"
      />
    </el-form-item>

    <el-form-item label="最大字符数">
      <el-input-number 
        v-model.number="component.props.maxLength"
        :min="0"
      />
    </el-form-item>
  </template>
</template>
```

## 🔄 高级用法

### 1. 条件显示字段

添加 `visible` 属性到 FormComponent：

```typescript
{
  id: "other_reason",
  type: "input",
  label: "其他原因",
  field: "otherReason",
  visible: (formData) => formData.reason === 'other',
  props: { placeholder: "请说明原因" }
}
```

在渲染时检查：
```vue
<el-form-item 
  v-if="!comp.visible || comp.visible(formData)"
  :label="comp.label"
>
  <!-- ... -->
</el-form-item>
```

### 2. 字段联动

在 FormConsumer 中监听字段变化：

```typescript
watch(
  () => formData.value.categoryId,
  (newCategoryId) => {
    // 根据分类加载子类别
    loadSubcategories(newCategoryId);
  }
);
```

### 3. 动态选项加载

```typescript
// 异步加载select选项
const loadOptions = async (fieldName: string) => {
  const options = await fetchOptions(fieldName);
  const component = schema.components.find(c => c.field === fieldName);
  if (component) {
    component.props.options = options;
  }
};
```

### 4. 自定义验证规则

```typescript
const customRules = {
  email: [
    { 
      required: true, 
      message: '邮箱为必填项', 
      trigger: 'blur' 
    },
    {
      validator: (rule, value, callback) => {
        // 自定义异步验证
        checkEmailUnique(value).then(() => {
          callback();
        }).catch(() => {
          callback(new Error('邮箱已被使用'));
        });
      },
      trigger: 'blur'
    }
  ]
};
```

## 🧪 测试建议

### 单元测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { getElComponent, initFormData } from '@/utils/lowcode';

describe('lowcode utils', () => {
  it('should map component types correctly', () => {
    expect(getElComponent('input')).toBe('el-input');
    expect(getElComponent('select')).toBe('el-select');
    expect(getElComponent('unknown')).toBe('el-input');
  });

  it('should initialize form data correctly', () => {
    const components = [
      { type: 'input', field: 'name' },
      { type: 'switch', field: 'active' },
    ];
    const data = initFormData(components);
    expect(data.name).toBe(null);
    expect(data.active).toBe(false);
  });
});
```

### 集成测试示例

```typescript
describe('FormBuilder Integration', () => {
  it('should build form and save to server', async () => {
    // 1. 创建表单
    const schema = createTestSchema();
    
    // 2. 保存表单
    await saveFormSchemeApi(schema);
    
    // 3. 验证是否保存成功
    const saved = await getFormSchemaApi();
    expect(saved.formId).toBe(schema.formId);
    expect(saved.components.length).toBe(schema.components.length);
  });
});
```

## 📈 性能优化

### 1. 组件懒加载
```typescript
const FormBuilder = () => import('@/views/lowcode/FormBuilder.vue');
const FormConsumer = () => import('@/views/lowcode/FormConsumer.vue');
```

### 2. 列表虚拟化（大量组件时）
使用 `el-virtual-list` 包装组件列表

### 3. 数据记忆化
```typescript
const memoizedValidationRules = computed(() => {
  return generateValidationRules(schema.value.components);
}, {
  compare: (a, b) => JSON.stringify(a) === JSON.stringify(b)
});
```

### 4. 代码分割
```typescript
// 只在需要时加载验证工具
import { generateValidationRules } from '@/utils/validation';
```

## 🐛 调试技巧

### 1. 启用 Vue DevTools
在浏览器中使用 Vue DevTools 查看组件树和状态

### 2. 打印表单配置
```typescript
// 在 FormBuilder 控制台
console.log(JSON.stringify(schema.value, null, 2));
```

### 3. 监听表单数据变化
```typescript
watch(
  () => formData.value,
  (newData) => {
    console.log('表单数据:', newData);
  },
  { deep: true }
);
```

### 4. API请求调试
```typescript
// 在 network 标签页查看请求
// 或使用 axios 拦截器
import axios from 'axios';

axios.interceptors.request.use(config => {
  console.log('API Request:', config);
  return config;
});
```

## 📚 相关资源

- [Vue 3 文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)

## 🎯 最佳实践

1. **类型安全** - 充分利用 TypeScript
2. **代码复用** - 提取通用逻辑到 utils
3. **错误处理** - 完善的 try-catch 和错误提示
4. **性能优化** - 使用 computed 和 watch 优化
5. **代码注释** - 关键函数添加 JSDoc 注释
6. **测试覆盖** - 关键逻辑编写单元测试

---

**最后更新**: 2026-04-23
