# 低代码表单系统 - 快速参考卡

## 🎯 一句话总结
完整的低代码表单解决方案，包括可视化设计器和动态消费端。

## 📍 访问地址

| 功能 | URL | 说明 |
|------|-----|------|
| 表单构建器 | http://localhost:5173/form-builder | 拖拽设计表单 |
| 表单消费端 | http://localhost:5173/form-consumer | 填写并提交表单 |

## 🛠️ 常用导入

```typescript
// 工具函数
import { 
  getElComponent,           // 获取组件名称
  initFormData,             // 初始化表单数据
  generateValidationRules,  // 生成验证规则
  getTriggerType            // 获取触发事件
} from '@/utils/lowcode';

// 验证工具
import {
  generateElValidationRules,  // 生成Element Plus规则
  generateValidationRulesCode // 生成代码
} from '@/utils/validation';

// 组件
import FormPreview from '@/components/FormPreview.vue';
import ComponentConfig from '@/components/ComponentConfig.vue';

// API
import { 
  saveFormSchemeApi,   // POST /forms/save
  getFormSchemaApi     // GET /forms/latest
} from '@/api/form';

// 类型
import type { 
  FormSchema,      // 表单配置类型
  FormComponent    // 表单组件类型
} from '@/types/lowcode';
```

## 📝 常见任务

### 任务 1: 在组件中使用生成的表单

```typescript
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getFormSchemaApi } from '@/api/form';
import FormPreview from '@/components/FormPreview.vue';

const schema = ref(null);

onMounted(async () => {
  schema.value = await getFormSchemaApi();
});
</script>

<template>
  <form-preview :schema="schema" />
</template>
```

### 任务 2: 初始化表单数据和规则

```typescript
import { initFormData, generateValidationRules } from '@/utils/lowcode';

const schema = { components: [...] };
const formData = initFormData(schema.components);
const formRules = generateValidationRules(schema.components);
```

### 任务 3: 获取生成的代码

```typescript
// 在FormConsumer或FormBuilder中
// 点击"生成模板代码"按钮
// 在对话框中复制完整的Vue组件代码
```

### 任务 4: 添加新组件类型

```typescript
// 1. types/lowcode.ts - 添加类型
export type ComponentType = '...existing...' | 'my-component';

// 2. utils/lowcode.ts - 添加映射
const map = { 'my-component': 'el-my-component' };

// 3. FormBuilder.vue - 添加物料
const materialList = [
  { type: 'my-component', label: '我的组件', icon: 'Custom' }
];

// 4. ComponentConfig.vue - 添加配置面板
<template v-else-if="component.type === 'my-component'">
  <!-- 配置UI -->
</template>
```

### 任务 5: 处理表单提交

```typescript
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    const response = await fetch('/api/form-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId: schema.formId,
        data: formData.value
      })
    });
    if (response.ok) {
      ElMessage.success('提交成功');
    }
  } catch (error) {
    ElMessage.error('提交失败');
  }
};
```

## 🔑 关键数据结构

### FormSchema
```typescript
{
  formId: string;        // 表单ID
  title: string;         // 表单标题
  labelWidth: string;    // 标签宽度
  components: [{...}]    // 组件列表
}
```

### FormComponent
```typescript
{
  id: string;                    // 组件ID
  type: 'input'|'select'|...;   // 组件类型
  label: string;                 // 标签
  field: string;                 // 字段名
  required: boolean;             // 是否必填
  props: {                       // 组件属性
    placeholder?: string;
    options?: Array;
    maxLength?: number;
    ...
  }
}
```

## 📊 API 参考

### saveFormSchemeApi(data)
保存表单配置到服务器
```typescript
await saveFormSchemeApi(schema);
// POST /forms/save
```

### getFormSchemaApi()
从服务器获取最新表单配置
```typescript
const schema = await getFormSchemaApi();
// GET /forms/latest
```

## 🎨 组件类型速查表

| 类型 | Element Plus 组件 | 默认值 | 触发事件 |
|------|------------------|--------|---------|
| input | el-input | null | blur |
| select | el-select | [] | change |
| radio | el-radio-group | [] | change |
| checkbox | el-checkbox-group | [] | change |
| switch | el-switch | false | change |
| date | el-date-picker | null | change |

## 💡 常见错误和解决

### 错误: 属性不存在
✅ **解决**: 确保导入了正确的 utils 函数

### 错误: 组件不渲染
✅ **解决**: 检查 schema 是否正确加载

### 错误: 验证规则不生效
✅ **解决**: 确保在表单项上正确设置了 prop 属性

### 错误: 代码生成不完整
✅ **解决**: 检查所有必填字段是否都已配置

## 🚀 性能建议

- 使用 computed 而不是 watch 来处理派生数据
- 对大量组件使用虚拟列表
- 使用 requestAnimationFrame 处理拖拽
- 懒加载 FormBuilder 和 FormConsumer 组件

## 🔗 相关文档

- [完整功能文档](./LOWCODE_README.md)
- [开发者指南](./DEVELOPER_GUIDE.md)
- [使用示例](./src/utils/lowcode-examples.ts)

## 📞 常见问题

**Q: 如何自定义验证规则？**
A: 在 FormComponent 的 props 中添加自定义字段，然后在 validation.ts 中处理

**Q: 如何添加国际化？**
A: 在 label 和 placeholder 中使用 i18n 消息 key

**Q: 如何保存表单草稿？**
A: 将表单数据保存到本地存储，恢复时读取

**Q: 如何生成 TypeScript 接口？**
A: 在代码生成时，基于 FormComponent 自动生成 interface

---

**版本**: 1.0.0 | **最后更新**: 2026-04-23
