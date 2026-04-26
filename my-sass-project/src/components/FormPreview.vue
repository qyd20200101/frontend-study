<template>
    <div class="form-preview">
        <el-card class="preview-card">
            <template #header>
                <div class="preview-header">
                    <span class="preview-title">{{ schema?.title || '表单预览' }}</span>
                    <el-button type="primary" size="small" :loading="submitting" @click="handleSubmit">
                        提交表单
                    </el-button>
                </div>
            </template>

            <el-form v-if="schema" ref="formRef" :model="formData" :rules="formRules" :label-width="schema.labelWidth"
                label-position="top">
                <template v-for="comp in schema.components" :key="comp.id">
                    <FormNode :comp="comp" :form-data="formData" />
                </template>

                <el-form-item>
                    <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>

            <el-empty v-else description="暂无表单配置" />
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormSchema } from '../types/lowcode';
import { submitFormDataApi } from '../api/form';
import { initFormData, generateValidationRules } from '../utils/lowcode';
import FormNode from './FormNode.vue';

const props = defineProps<{
    schema?: FormSchema | null;
}>();

const formRef = ref();
const formData = ref<Record<string, any>>({});
const formRules = ref<Record<string, any>>({});
const submitting = ref(false);

// 监听 schema 变化，重新初始化表单
watch(
    () => props.schema,
    (newSchema) => {
        if (newSchema && newSchema.components) {
            formData.value = initFormData(newSchema.components);
            formRules.value = generateValidationRules(newSchema.components);
        }
    },
    { immediate: true }
);

const handleSubmit = async () => {
    if (!formRef.value || !props.schema) return;
    try {
        submitting.value = true;
        await formRef.value.validate();
        
        // 调用真实 API 提交数据
        await submitFormDataApi(props.schema.formId, formData.value);
        
        console.log('表单数据:', formData.value);
        ElMessage.success('表单提交成功');
    } catch (error) {
        if (error && (error as any).name === 'ValidationError') {
            ElMessage.warning('请检查表单填写');
        } else {
            ElMessage.error('表单提交失败');
            console.error('提交错误:', error);
        }
    } finally {
        submitting.value = false;
    }
};

const handleReset = () => {
    formRef.value?.resetFields();
};
</script>

<style scoped>
.form-preview {
    padding: 20px;
    background: #f5f7fa;
    border-radius: 4px;
    overflow-x: hidden;
}

.preview-card {
    max-width: 600px;
    margin: 0 auto;
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.preview-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    position: relative;
    padding-left: 12px;
}

.preview-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 18px;
    background: #409eff;
    border-radius: 2px;
}

</style>
