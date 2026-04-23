<template>
    <div class="form-preview">
        <el-card class="preview-card">
            <template #header>
                <div class="preview-header">
                    <span class="preview-title">{{ schema?.title || '表单预览' }}</span>
                    <el-button type="primary" size="small" @click="handleSubmit">
                        提交表单
                    </el-button>
                </div>
            </template>

            <el-form v-if="schema" ref="formRef" :model="formData" :rules="formRules" :label-width="schema.labelWidth"
                label-position="top">
                <el-form-item v-for="comp in schema.components" :key="comp.id" :label="comp.label" :prop="comp.field">
                    <component :is="getElComponent(comp.type)" v-model="formData[comp.field]" v-bind="comp.props"
                        :placeholder="comp.props?.placeholder || `请输入${comp.label}`" style="width: 100%" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSubmit">提交</el-button>
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
import type { FormSchema } from '../../types/lowcode';
import { getElComponent, initFormData, generateValidationRules } from '../../utils/lowcode';

const props = defineProps<{
    schema?: FormSchema | null;
}>();

const formRef = ref();
const formData = ref<Record<string, any>>({});
const formRules = ref<Record<string, any>>({});

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
    if (!formRef.value) return;
    try {
        await formRef.value.validate();
        console.log('表单数据:', formData.value);
        ElMessage.success('表单提交成功');
    } catch (error) {
        ElMessage.warning('请检查表单填写');
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
    font-size: 18px;
    font-weight: 600;
}
</style>
