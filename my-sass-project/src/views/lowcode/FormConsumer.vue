<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getFormSchemaApi } from "../../api/form";
import type { FormSchema } from "../../types/lowcode";
import { getElComponent, initFormData, generateValidationRules } from "../../utils/lowcode";

const loading = ref(true);
const schema = ref<FormSchema | null>(null);
const formRef = ref();

// 动态表单的数据载体
const formData = ref<Record<string, any>>({});
// 动态校验规则
const formRules = ref<Record<string, any>>({});

// 生成的代码和对话框状态
const generatedCode = ref('');
const showCodeDialog = ref(false);

// 页面加载时拉取云端协议，并动态初始化formData
onMounted(async () => {
    try {
        const data = await getFormSchemaApi();
        if (data && data.components && data.components.length) {
            schema.value = data;
            // 使用工具函数初始化
            formData.value = initFormData(data.components);
            formRules.value = generateValidationRules(data.components);
        }
        loading.value = false;
    } catch (error) {
        ElMessage.error('加载表单配置失败');
        loading.value = false;
    }
});

// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return;
    try {
        await formRef.value.validate();
        console.log('提交数据:', formData.value);
        ElMessage.success('提交成功');
    } catch (error) {
        ElMessage.warning('请检查表单填写');
    }
};

// 重置表单
const handleReset = () => {
    formRef.value?.resetFields();
};

// 生成模板代码
const generateTemplateCode = () => {
    if (!schema.value) return;

    const { labelWidth, components } = schema.value;

    // 生成完整的 Vue 组件代码
    let code = `<template>
  <div class="form-wrapper">
    <el-form 
      ref="formRef" 
      :model="formData" 
      :rules="formRules" 
      label-width="${labelWidth}" 
      label-position="top"
    >
`;

    components.forEach(comp => {
        code += `      <el-form-item label="${comp.label}" prop="${comp.field}">
        <${getElComponent(comp.type)} 
          v-model="formData.${comp.field}"
          ${comp.props?.placeholder ? `placeholder="${comp.props.placeholder}" ` : ''}
          style="width: 100%"
        />
      </el-form-item>
`;
    });

    code += `      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const formRef = ref(null);
const formData = ref({
`;

    components.forEach(comp => {
        const defaultValue = comp.type === 'switch' ? 'false' :
            ['checkbox', 'select', 'radio'].includes(comp.type) ? '[]' : 'null';
        code += `  ${comp.field}: ${defaultValue},\n`;
    });

    code += `});

const formRules = ref({
`;

    components.forEach(comp => {
        if (comp.required) {
            const trigger = ['input'].includes(comp.type) ? 'blur' : 'change';
            code += `  ${comp.field}: [{ required: true, message: '${comp.label}为必填项', trigger: '${trigger}' }],\n`;
        }
    });

    code += `});

const handleSubmit = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
    // 在这里调用提交 API
    console.log('表单数据:', formData.value);
    ElMessage.success('提交成功');
  } catch (error) {
    ElMessage.warning('请检查表单填写');
  }
};

const handleReset = () => {
  formRef.value?.resetFields();
};
<\/script>

<style scoped>
.form-wrapper {
  padding: 20px;
}
</style>`;

    generatedCode.value = code;
    showCodeDialog.value = true;
};

// 复制代码到剪贴板
const copyCode = async () => {
    try {
        await navigator.clipboard.writeText(generatedCode.value);
        ElMessage.success('复制成功');
    } catch (err) {
        ElMessage.error('复制失败');
    }
};
</script>

<template>
    <div class="form-consumer">
        <el-card class="form-card" v-if="schema">
            <template #header>
                <div class="card-header">
                    <span class="form-title">{{ schema.title }}</span>
                </div>
            </template>

            <el-form ref="formRef" :model="formData" :rules="formRules" :label-width="schema.labelWidth"
                label-position="top">
                <el-form-item v-for="comp in schema.components" :key="comp.id" :label="comp.label" :prop="comp.field">
                    <component :is="getElComponent(comp.type)" v-model="formData[comp.field]" v-bind="comp.props"
                        :placeholder="comp.props?.placeholder || '请输入' + comp.label" />
                </el-form-item>
            </el-form>

            <div class="form-actions">
                <el-button type="primary" @click="handleSubmit">提交</el-button>
                <el-button @click="handleReset">重置</el-button>
                <el-button type="info" @click="generateTemplateCode">生成模板代码</el-button>
            </div>
        </el-card>

        <el-empty v-else description="暂无表单配置" />

        <el-dialog v-model="showCodeDialog" title="生成的模板代码" width="700px">
            <pre class="code-preview">{{ generatedCode }}</pre>
            <template #footer>
                <el-button @click="showCodeDialog = false">关闭</el-button>
                <el-button type="primary" @click="copyCode">复制代码</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style scoped>
.form-consumer {
    padding: 20px;
    min-height: 100vh;
    background: #f5f7fa;
}

.form-card {
    max-width: 800px;
    margin: 0 auto;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.form-title {
    font-size: 18px;
    font-weight: 600;
}

.form-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.code-preview {
    background: #282c34;
    color: #abb2bf;
    padding: 15px;
    border-radius: 4px;
    max-height: 500px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 12px;
    line-height: 1.5;
    font-family: 'Courier New', monospace;
}
</style>