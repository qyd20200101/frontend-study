# 低代码表单系统 — 开发者指南

## 架构概览

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
│         saveFormSchemeApi → POST /forms/save          │
└─────────────────────────────────────────────────────┘
                        ↓
                   服务器存储
                        ↓
┌─────────────────────────────────────────────────────┐
│         FormConsumer (消费端)                        │
│  ┌────────────────────────────────────┐              │
│  │  动态渲染 + 验证 + 提交 + 代码生成  │              │
│  └────────────────────────────────────┘              │
└─────────────────────────────────────────────────────┘
```

---

## 核心数据结构

### FormSchema
```typescript
interface FormSchema {
  formId: string;
  title: string;
  labelWidth: string;
  components: FormComponent[];
  description?: string;
  submitButtonText?: string;
  resetButtonText?: string;
}
```

### FormComponent
```typescript
interface FormComponent {
  id: string;
  type: ComponentType;  // 'input' | 'textarea' | 'number' | 'select' | 'radio' | 'checkbox' | 'switch' | 'date' | 'time'
  label: string;
  field: string;
  required: boolean;
  props: Record<string, any>;
  validation?: ValidationRule[];
  disabled?: boolean;
  help?: string;
  className?: string;
}
```

---

## 组件类型速查

| 类型 | Element Plus 组件 | 默认值 | 特殊配置 |
|------|-------------------|--------|----------|
| `input` | el-input | null | placeholder / maxLength / minLength |
| `textarea` | el-input (type=textarea) | null | rows / resize / maxLength |
| `number` | el-input-number | 0 | min / max / step |
| `select` | el-select | [] | options |
| `radio` | el-radio-group | [] | options |
| `checkbox` | el-checkbox-group | [] | options |
| `switch` | el-switch | false | activeText / inactiveText |
| `date` | el-date-picker | null | type / format |
| `time` | el-time-picker | null | format / isRange |

---

## 工具函数速查

```typescript
import {
  getElComponent,           // type → 组件名
  getDefaultValue,         // type → 默认值
  getTriggerType,          // type → 验证触发事件
  initFormData,            // 组件列表 → 初始 formData
  generateValidationRules, // 组件列表 → Element Plus rules
  formatComponentProps,    // 组件 → 属性字符串
  validateComponentConfig, // 组件 → { valid, errors }
  cloneComponent,          // 深拷贝组件
} from '@/utils/lowcode';

import {
  generateElValidationRules, // 生成完整验证规则
  getValidationTemplate,     // 获取预定义模板
  getTriggerByType,          // 获取触发事件
} from '@/utils/validation';
```

---

## 添加新组件类型（5 步）

### Step 1: 更新类型定义
```typescript
// src/types/lowcode.ts — 扩展 ComponentType
export type ComponentType = 'input' | 'select' | ... | '新类型';
```

### Step 2: 更新组件映射 + 默认值
```typescript
// src/utils/lowcode.ts
// getElComponent: 添加映射
// getDefaultValue: 添加默认值 case
// getTriggerType: 更新触发事件数组
```

### Step 3: 更新 FormBuilder 物料库
```typescript
// views/lowcode/FormBuilder.vue
materialList.value.push({ type: '新类型', label: '标签', icon: 'Icon' });
```

### Step 4: 添加配置面板
在 `ComponentConfig.vue` 中为新类型添加配置表单：
```vue
<template v-else-if="component.type === '新类型'">
  <el-divider>新类型配置</el-divider>
  <!-- 配置项 -->
</template>
```

### Step 5: 更新代码生成器
在 `simpleAstGenerator.ts` 中添加新类型的模板生成逻辑。

---

## AST 代码生成器

### 使用方式
```typescript
import { SimpleASTGenerator } from '@/utils/simpleAstGenerator';

// 生成组件代码
const code = SimpleASTGenerator.generateComponent(schema.value.components);

// 验证生成的代码
const validation = SimpleASTGenerator.validateGeneratedCode(code);
if (!validation.valid) {
  console.error('生成错误:', validation.errors);
}
```

### 旧方案 vs AST 方案

| 特性 | 旧方案（字符串拼接） | AST 方案 |
|------|---------------------|---------|
| 实现方式 | 字符串拼接 | AST 遍历生成 |
| 代码验证 | 无 | 有基础验证 |
| 代码格式化 | 手动 | 自动 |
| 扩展性 | 差 | 好 |
| 维护难度 | 高 | 低 |

### 性能优化
- **缓存结果**: 用 Map 缓存已生成的代码，避免重复生成
- **异步生成**: 大型表单用 `setTimeout` 异步生成，不阻塞 UI

---

## 高级用法

### 条件显示字段
```typescript
{
  id: "other_reason",
  type: "input",
  field: "otherReason",
  visible: (formData) => formData.reason === 'other',
}
```

### 字段联动
```typescript
watch(() => formData.value.categoryId, (newId) => {
  loadSubcategories(newId);
});
```

### 自定义验证
```typescript
{
  validator: (rule, value, callback) => {
    checkUnique(value).then(() => callback()).catch(e => callback(new Error(e)));
  },
  trigger: 'blur'
}
```

---

## 测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { getElComponent, initFormData } from '@/utils/lowcode';

describe('lowcode utils', () => {
  it('getElComponent maps types correctly', () => {
    expect(getElComponent('input')).toBe('el-input');
    expect(getElComponent('select')).toBe('el-select');
    expect(getElComponent('unknown')).toBe('el-input'); // fallback
  });

  it('initFormData initializes values by type', () => {
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

---

## 调试技巧

1. **Vue DevTools** — 查看组件树和 Pinia 状态
2. **打印 Schema**: `console.log(JSON.stringify(schema.value, null, 2))`
3. **监听数据变化**: `watch(() => formData.value, console.log, { deep: true })`
4. **Axios 拦截器调试**: 在 `request.ts` 拦截器中加 `console.log`

---

## 最佳实践

1. **充分利用 TypeScript** — 所有接口定义在 `types/lowcode.ts`
2. **提取通用逻辑到 utils** — 避免 FormBuilder 和 FormConsumer 重复代码
3. **computed 做缓存** — 验证规则、格式化字符串等纯计算用 computed
4. **关键函数加 JSDoc** — 工具函数写清楚入参/返回值
5. **核心逻辑写单元测试** — 用 vitest，跑在 `packages/core`

---

**最后更新**: 2026-04-23
