<template>
    <div class="component-config">
        <el-form v-if="component" label-position="top" :model="component">
            <!-- 基础配置 -->
            <el-divider>基础配置</el-divider>

            <el-form-item label="组件字段 (Field)">
                <el-input v-model="component.field" placeholder="例如: username" clearable />
            </el-form-item>

            <el-form-item label="标签文字 (Label)">
                <el-input v-model="component.label" clearable />
            </el-form-item>

            <el-form-item label="是否必填">
                <el-switch v-model="component.required" />
            </el-form-item>

            <!-- 根据组件类型显示不同的配置 -->
            <template v-if="component.type === 'input'">
                <el-divider>输入框配置</el-divider>

                <el-form-item label="占位提示">
                    <el-input v-model="component.props.placeholder" placeholder="请输入占位符" />
                </el-form-item>

                <el-form-item label="最小长度">
                    <el-input-number v-model.number="component.props.minLength" :min="0" />
                </el-form-item>

                <el-form-item label="最大长度">
                    <el-input-number v-model.number="component.props.maxLength" :min="0" />
                </el-form-item>
            </template>

            <template v-else-if="component.type === 'textarea'">
                <el-divider>多行文本配置</el-divider>

                <el-form-item label="占位提示">
                    <el-input v-model="component.props.placeholder" placeholder="请输入占位符" />
                </el-form-item>

                <el-form-item label="最小长度">
                    <el-input-number v-model.number="component.props.minLength" :min="0" />
                </el-form-item>

                <el-form-item label="最大长度">
                    <el-input-number v-model.number="component.props.maxLength" :min="0" />
                </el-form-item>

                <el-form-item label="行数">
                    <el-input-number v-model.number="component.props.rows" :min="2" :max="20" />
                </el-form-item>

                <el-form-item label="是否可调整大小">
                    <el-switch v-model="component.props.resize" />
                </el-form-item>
            </template>

            <template v-else-if="component.type === 'number'">
                <el-divider>数字输入配置</el-divider>

                <el-form-item label="最小值">
                    <el-input-number v-model.number="component.props.min" />
                </el-form-item>

                <el-form-item label="最大值">
                    <el-input-number v-model.number="component.props.max" />
                </el-form-item>

                <el-form-item label="步长">
                    <el-input-number v-model.number="component.props.step" :min="0.1" :step="0.1" />
                </el-form-item>

                <el-form-item label="占位提示">
                    <el-input v-model="component.props.placeholder" placeholder="请输入占位符" />
                </el-form-item>
            </template>

            <template v-else-if="['select', 'radio', 'checkbox'].includes(component.type)">
                <el-divider>选项配置</el-divider>

                <el-form-item label="选项列表">
                    <el-button size="small" @click="showOptionsDialog = true">
                        编辑选项
                    </el-button>
                    <div v-if="component.props.options?.length" class="options-preview">
                        <el-tag v-for="(opt, idx) in component.props.options" :key="idx" closable
                            @close="component.props.options.splice(idx, 1)">
                            {{ opt.label }}
                        </el-tag>
                    </div>
                </el-form-item>
            </template>

            <template v-else-if="component.type === 'date'">
                <el-divider>日期配置</el-divider>

                <el-form-item label="日期格式">
                    <el-select v-model="component.props.format">
                        <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                        <el-option label="YYYY/MM/DD" value="YYYY/MM/DD" />
                        <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
                        <el-option label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss" />
                    </el-select>
                </el-form-item>

                <el-form-item label="选择类型">
                    <el-select v-model="component.props.type">
                        <el-option label="日期" value="date" />
                        <el-option label="周" value="week" />
                        <el-option label="月份" value="month" />
                        <el-option label="年" value="year" />
                        <el-option label="日期时间" value="datetime" />
                    </el-select>
                </el-form-item>
            </template>

            <template v-else-if="component.type === 'time'">
                <el-divider>时间配置</el-divider>

                <el-form-item label="时间格式">
                    <el-select v-model="component.props.format">
                        <el-option label="HH:mm" value="HH:mm" />
                        <el-option label="HH:mm:ss" value="HH:mm:ss" />
                    </el-select>
                </el-form-item>

                <el-form-item label="是否为范围">
                    <el-switch v-model="component.props.isRange" />
                </el-form-item>
            </template>
        </el-form>

        <!-- 编辑选项对话框 -->
        <el-dialog v-model="showOptionsDialog" title="编辑选项" width="500px">
            <el-form label-position="top">
                <div v-for="(opt, idx) in editingOptions" :key="idx" class="option-item">
                    <el-row :gutter="10">
                        <el-col :span="12">
                            <el-form-item label="选项标签">
                                <el-input v-model="opt.label" placeholder="选项显示文字" />
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="选项值">
                                <el-input v-model="opt.value" placeholder="选项值" />
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-button type="danger" size="small" @click="editingOptions.splice(idx, 1)">
                        删除
                    </el-button>
                </div>

                <el-button type="primary" size="small" @click="addOption" plain>
                    + 添加选项
                </el-button>
            </el-form>

            <template #footer>
                <el-button @click="showOptionsDialog = false">取消</el-button>
                <el-button type="primary" @click="confirmOptions">确认</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { FormComponent } from '../../types/lowcode';

const props = defineProps<{
    component: FormComponent | null;
}>();

const showOptionsDialog = ref(false);
const editingOptions = ref<Array<{ label: string; value: string }>>([]);

// 初始化不同类型组件的默认属性
const initializeComponentProps = (component: FormComponent) => {
    if (!component.props) {
        component.props = {};
    }

    switch (component.type) {
        case 'input':
            component.props.placeholder ??= '请输入';
            component.props.maxLength ??= 100;
            component.props.minLength ??= 0;
            break;
        case 'textarea':
            component.props.placeholder ??= '请输入';
            component.props.maxLength ??= 500;
            component.props.minLength ??= 0;
            component.props.rows ??= 4;
            component.props.resize ??= true;
            break;
        case 'number':
            component.props.min ??= undefined;
            component.props.max ??= undefined;
            component.props.step ??= 1;
            component.props.placeholder ??= '请输入数字';
            break;
        case 'select':
        case 'radio':
        case 'checkbox':
            component.props.options ??= [];
            break;
        case 'date':
            component.props.format ??= 'YYYY-MM-DD';
            component.props.type ??= 'date';
            break;
        case 'time':
            component.props.format ??= 'HH:mm:ss';
            component.props.isRange ??= false;
            break;
        case 'switch':
            component.props.activeText ??= '是';
            component.props.inactiveText ??= '否';
            break;
    }
};

watch(
    () => props.component,
    (newComp) => {
        if (newComp) {
            initializeComponentProps(newComp);
        }
    },
    { immediate: true }
);

const addOption = () => {
    editingOptions.value.push({ label: '', value: '' });
};

const confirmOptions = () => {
    if (props.component) {
        props.component.props.options = editingOptions.value;
    }
    showOptionsDialog.value = false;
};

watch(
    () => showOptionsDialog.value,
    (isOpen) => {
        if (isOpen && props.component?.props?.options) {
            editingOptions.value = JSON.parse(JSON.stringify(props.component.props.options));
        }
    }
);
</script>

<style scoped>
.component-config {
    padding: 15px;
}

.options-preview {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.option-item {
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
}
</style>
