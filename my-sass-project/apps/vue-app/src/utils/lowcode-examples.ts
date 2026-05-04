/**
 * 低代码表单系统 - 使用示例和集成指南
 */

// ============================================================
// 1. 在Vue组件中使用FormConsumer预览组件
// ============================================================

// MyFormPage.vue
import { ref, onMounted } from 'vue';
import { getFormSchemaApi } from '@/api/form';
import FormPreview from '@/components/FormPreview.vue';

export default {
  components: {
    FormPreview,
  },
  setup() {
    const schema = ref(null);

    onMounted(async () => {
      // 从服务器加载表单配置
      const data = await getFormSchemaApi();
      schema.value = data;
    });

    return {
      schema,
    };
  },
};

// ============================================================
// 2. 使用工具函数生成表单规则
// ============================================================

import { 
  getElComponent, 
  initFormData, 
  generateValidationRules,
  getTriggerType 
} from '@/utils/lowcode';
import { 
  generateValidationRulesCode,
  generateElValidationRules 
} from '@/utils/validation';

// 初始化表单数据
const formData = initFormData(schema.components);

// 生成验证规则
const formRules = generateValidationRules(schema.components);

// 生成代码形式的验证规则
const rulesCode = generateValidationRulesCode(schema.components);

// ============================================================
// 3. 自定义组件配置
// ============================================================

// 创建自定义组件类型
// 1. 在 types/lowcode.ts 中添加类型
export type ComponentType = 'input' | 'select' | 'custom-component';

// 2. 在 utils/lowcode.ts 中添加映射
const componentMap = {
  'custom-component': 'my-custom-component',
};

// 3. 在 FormBuilder.vue 中添加物料
const materialList = [
  { type: 'custom-component', label: '自定义组件', icon: 'Magic' }
];

// ============================================================
// 4. 添加自定义验证规则
// ============================================================

import { generateElValidationRules, ValidationRule } from '@/utils/validation';

const customValidations = [
  {
    field: 'email',
    label: '邮箱',
    type: 'input',
    required: true,
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    message: '请输入有效的邮箱地址'
  },
  {
    field: 'phone',
    label: '电话',
    type: 'input',
    required: true,
    pattern: '^\\d{11}$',
    message: '请输入有效的11位电话号码'
  }
];

const elRules = generateElValidationRules(customValidations);

// ============================================================
// 5. 在后端API中集成表单保存
// ============================================================

// 示例: Express.js 后端
/*
import express from 'express';
import db from './db';

const app = express();

// 保存表单配置
app.post('/forms/save', async (req, res) => {
  try {
    const { formId, title, labelWidth, components } = req.body;
    
    // 保存到数据库
    await db.forms.upsert({
      formId,
      title,
      labelWidth,
      components,
      updatedAt: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取最新表单配置
app.get('/forms/latest', async (req, res) => {
  try {
    const form = await db.forms.findOne({}, { sort: { updatedAt: -1 } });
    res.json(form || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/

// ============================================================
// 6. 处理表单提交
// ============================================================

import { ElMessage } from 'element-plus';

async function handleFormSubmit(formData, formSchema) {
  try {
    // 调用API提交表单数据
    const response = await fetch('/api/form-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formId: formSchema.formId,
        data: formData,
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      ElMessage.success('表单提交成功');
      return true;
    } else {
      ElMessage.error('表单提交失败');
      return false;
    }
  } catch (error) {
    ElMessage.error('提交错误: ' + error.message);
    return false;
  }
}

// ============================================================
// 7. 动态组件渲染示例
// ============================================================

import { defineComponent, h } from 'vue';
import { ElInput, ElSelect, ElSwitch, ElDatePicker } from 'element-plus';

const DynamicForm = defineComponent({
  props: {
    schema: Object,
    modelValue: Object
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const componentMap = {
      'input': ElInput,
      'select': ElSelect,
      'switch': ElSwitch,
      'date': ElDatePicker,
    };

    return () => {
      if (!props.schema) return null;

      return h('div', [
        props.schema.components.map(comp =>
          h('div', { key: comp.id }, [
            h('label', comp.label),
            h(componentMap[comp.type] || ElInput, {
              modelValue: props.modelValue?.[comp.field],
              'onUpdate:modelValue': (value) => {
                emit('update:modelValue', {
                  ...props.modelValue,
                  [comp.field]: value
                });
              }
            })
          ])
        )
      ]);
    };
  }
});

// ============================================================
// 8. 组件配置编辑器集成
// ============================================================

import ComponentConfig from '@/components/ComponentConfig.vue';

// 在 FormBuilder 中使用
/*
<template>
  <div class="form-builder">
    <!-- 组件配置面板 -->
    <component-config 
      :component="selectedComponent" 
      @update="handleComponentUpdate"
    />
  </div>
</template>

<script setup>
import ComponentConfig from '@/components/ComponentConfig.vue';
import { ref } from 'vue';

const selectedComponent = ref(null);

const handleComponentUpdate = (updated) => {
  // 处理组件更新
  console.log('组件已更新:', updated);
};
</script>
*/

// ============================================================
// 9. 表单预览组件集成
// ============================================================

import FormPreview from '@/components/FormPreview.vue';

/*
<template>
  <div class="preview-container">
    <form-preview :schema="currentSchema" />
  </div>
</template>

<script setup>
import FormPreview from '@/components/FormPreview.vue';
import { getFormSchemaApi } from '@/api/form';
import { ref, onMounted } from 'vue';

const currentSchema = ref(null);

onMounted(async () => {
  currentSchema.value = await getFormSchemaApi();
});
</script>
*/

// ============================================================
// 10. 扩展功能：表单模板
// ============================================================

export const FORM_TEMPLATES = {
  // 用户注册表单
  REGISTRATION: {
    title: '用户注册',
    labelWidth: '100px',
    components: [
      {
        id: 'username',
        type: 'input',
        label: '用户名',
        field: 'username',
        required: true,
        props: { placeholder: '请输入用户名' }
      },
      {
        id: 'email',
        type: 'input',
        label: '邮箱',
        field: 'email',
        required: true,
        props: { placeholder: '请输入邮箱地址' }
      },
      {
        id: 'password',
        type: 'input',
        label: '密码',
        field: 'password',
        required: true,
        props: { 
          placeholder: '请输入密码',
          type: 'password'
        }
      }
    ]
  },

  // 反馈表单
  FEEDBACK: {
    title: '用户反馈',
    labelWidth: '100px',
    components: [
      {
        id: 'name',
        type: 'input',
        label: '姓名',
        field: 'name',
        required: true,
        props: { placeholder: '请输入您的姓名' }
      },
      {
        id: 'email',
        type: 'input',
        label: '邮箱',
        field: 'email',
        required: true,
        props: { placeholder: '请输入您的邮箱' }
      },
      {
        id: 'category',
        type: 'select',
        label: '反馈类型',
        field: 'category',
        required: true,
        props: {
          options: [
            { label: '功能建议', value: 'feature' },
            { label: '问题报告', value: 'bug' },
            { label: '其他', value: 'other' }
          ]
        }
      },
      {
        id: 'message',
        type: 'input',
        label: '反馈内容',
        field: 'message',
        required: true,
        props: { 
          placeholder: '请输入您的反馈内容',
          type: 'textarea'
        }
      }
    ]
  }
};

// 使用模板
function useTemplate(templateName) {
  return JSON.parse(JSON.stringify(FORM_TEMPLATES[templateName]));
}

export default {
  FORM_TEMPLATES,
  useTemplate
};
