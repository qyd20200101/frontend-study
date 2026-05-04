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
            <template v-else-if="component.type === 'grid'">
                <el-divider>栅栏列配置</el-divider>
                
                <el-form-item label="栅栏列编辑">
                    <div v-for="(col, idx) in component.columns" :key="idx" class="grid-col-config">
                        <div class="col-header">
                            <span>第 {{ idx + 1 }} 列</span>
                            <el-button type="danger" link @click="removeGridColumn(idx)" :disabled="!component.columns || component.columns.length <= 1">删除</el-button>
                        </div>
                        <el-form-item label="跨度 (span 1-24)">
                            <el-slider v-model="col.span" :min="1" :max="24" show-input />
                        </el-form-item>
                    </div>
                    <el-button type="primary" plain class="w-full mt-2" @click="addGridColumn">
                        + 添加列
                    </el-button>
                </el-form-item>
            </template>
        </el-form>

        <!-- 高级校验规则配置 -->
        <template v-if="component && !['group', 'grid'].includes(component.type)">
            <el-divider>高级校验规则</el-divider>
            <div class="validation-config">
                <div v-for="(rule, idx) in component.validation || []" :key="idx" class="validation-item">
                    <div class="rule-header">
                        <span>规则 {{ idx + 1 }}</span>
                        <el-button type="danger" link @click="removeValidationRule(idx)">删除</el-button>
                    </div>
                    <el-form label-position="top">
                        <el-form-item label="规则类型">
                            <el-select v-model="rule.type">
                                <el-option label="邮箱格式" value="email" />
                                <el-option label="手机号格式" value="phone" />
                                <el-option label="URL链接" value="url" />
                                <el-option label="自定义正则" value="pattern" />
                            </el-select>
                        </el-form-item>
                        <el-form-item v-if="rule.type === 'pattern'" label="正则表达式">
                            <el-input v-model="rule.pattern" placeholder="例如: ^[A-Za-z]+$" />
                        </el-form-item>
                        <el-form-item label="错误提示">
                            <el-input v-model="rule.message" placeholder="校验失败的提示文字" />
                        </el-form-item>
                    </el-form>
                </div>
                <el-button type="primary" plain class="w-full mt-2" @click="addValidationRule">
                    + 添加校验规则
                </el-button>
            </div>
        </template>

        <!-- 显隐联动配置 -->
        <template v-if="component">
            <el-divider>组件显隐联动</el-divider>
            <div class="linkage-config">
                <el-form label-position="top">
                    <el-form-item label="开启条件显示">
                        <el-switch v-model="hasCondition" @change="toggleCondition" />
                    </el-form-item>
                    <template v-if="hasCondition && component.condition">
                        <el-form-item label="当依赖字段">
                            <el-input v-model="component.condition.field" placeholder="例如: userType" />
                        </el-form-item>
                        <el-form-item label="等于以下值时显示">
                            <el-input v-model="component.condition.value" placeholder="例如: admin" />
                        </el-form-item>
                    </template>
                </el-form>
            </div>
        </template>

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
import type { FormComponent } from '../types/lowcode';

const props = defineProps<{
    component: FormComponent | null;
}>();

const showOptionsDialog = ref(false);
const editingOptions = ref<Array<{ label: string; value: string }>>([]);

// 联动显隐控制
const hasCondition = ref(false);
const toggleCondition = (val: boolean) => {
    if (props.component) {
        if (val) {
            props.component.condition = { field: '', value: '' };
        } else {
            delete props.component.condition;
        }
    }
};

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
            hasCondition.value = !!newComp.condition;
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

// 栅栏布局相关方法
const addGridColumn = () => {
    if (props.component && props.component.type === 'grid') {
        if (!props.component.columns) props.component.columns = [];
        props.component.columns.push({ span: 12, list: [] });
    }
};

const removeGridColumn = (idx: number) => {
    if (props.component && props.component.type === 'grid' && props.component.columns) {
        props.component.columns.splice(idx, 1);
    }
};

// 校验规则相关方法
const addValidationRule = () => {
    if (props.component) {
        if (!props.component.validation) {
            props.component.validation = [];
        }
        props.component.validation.push({
            type: 'email',
            message: '格式不正确'
        });
    }
};

const removeValidationRule = (idx: number) => {
    if (props.component && props.component.validation) {
        props.component.validation.splice(idx, 1);
    }
};
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

/* 栅栏配置样式 */
.grid-col-config {
    background: #f8f9fa;
    border: 1px solid #ebeef5;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 10px;
}

.grid-col-config .col-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 13px;
    color: #606266;
}

/* 校验规则样式 */
.validation-config {
    margin-bottom: 20px;
}

.validation-item {
    background: #fdfdfd;
    border: 1px dashed #dcdfe6;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 12px;
}

.validation-item .rule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-weight: bold;
    font-size: 13px;
    color: #409eff;
}

.w-full {
    width: 100%;
}
.mt-2 {
    margin-top: 8px;
}
</style>
