<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getFormSchemaApi, submitFormDataApi } from "../../api/form";
import type { FormSchema } from "../../types/lowcode";
import { 
    initFormData, 
    generateValidationRules
} from "../../utils/lowcode";
import FormNode from "../../components/FormNode.vue";
import { SimpleASTGenerator } from "../../utils/simpleAstGenerator";

const loading = ref(true);
const submitting = ref(false);
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
    if (!formRef.value || !schema.value) return;
    try {
        submitting.value = true;
        await formRef.value.validate();
        
        // 调用真实 API 提交数据
        await submitFormDataApi(schema.value.formId, formData.value);
        
        console.log('提交数据:', formData.value);
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

// 重置表单
const handleReset = () => {
    formRef.value?.resetFields();
};

// 生成模板代码 - 使用 AST 生成器
const generateTemplateCode = () => {
    if (!schema.value) return;

    try {
        // 使用 AST 生成器生成代码
        const generatedCodeContent = SimpleASTGenerator.generateComponent(schema.value.components);
        
        // 验证生成的代码
        const validation = SimpleASTGenerator.validateGeneratedCode(generatedCodeContent);
        
        if (validation.valid) {
            generatedCode.value = generatedCodeContent;
            showCodeDialog.value = true;
            ElMessage.success('代码生成成功');
        } else {
            ElMessage.error(`代码生成失败: ${validation.errors.join(', ')}`);
        }
    } catch (error) {
        ElMessage.error('代码生成出错: ' + (error as Error).message);
    }
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
                <template v-for="comp in schema.components" :key="comp.id">
                    <FormNode :comp="comp" :form-data="formData" />
                </template>
            </el-form>

            <div class="form-actions">
                <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
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
    padding: 30px 20px;
    min-height: calc(100vh - 84px);
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
    overflow-x: hidden;
    display: flex;
    justify-content: center;
}

.form-card {
    width: 100%;
    max-width: 900px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
    border: none;
    transition: all 0.3s ease;
}

.form-card:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 15px;
    border-bottom: 1px solid #ebeef5;
    margin-bottom: 20px;
}

.form-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    position: relative;
    padding-left: 12px;
}

.form-title::before {
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

.form-actions {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px dashed #ebeef5;
    display: flex;
    justify-content: flex-end;
    gap: 15px;
}

.code-preview {
    background: #282c34;
    color: #abb2bf;
    padding: 15px;
    border-radius: 8px;
    max-height: 500px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 13px;
    line-height: 1.6;
    font-family: 'Fira Code', 'Courier New', monospace;
}

</style>