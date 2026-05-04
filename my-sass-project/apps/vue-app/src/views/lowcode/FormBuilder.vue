<script lang="ts">
export default { name: 'FormBuilder' }
</script>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
// 🚀 确保这里导入的名称与 lowcode.ts 中定义的一致 (FormComponent)
import type { FormComponent, FormSchema } from '../../types/lowcode';
//引入接口
import { saveFormSchemeApi, getFormSchemaApi } from "../../api/form";
import { getElComponent } from "../../utils/lowcode";
import ComponentConfig from '../../components/ComponentConfig.vue';
import BuilderNode from '../../components/BuilderNode.vue';
import { SimpleASTGenerator } from "../../utils/simpleAstGenerator";
// --- 状态管理 ---
const schema = ref<FormSchema>({
    formId: `form_${Date.now()}`,
    title: '未命名表单',
    labelWidth: '100px',
    components: []
});

const materialList = ref([
    { type: 'input', label: '单行文本', icon: 'Edit' },
    { type: 'textarea', label: '多行文本', icon: 'Document' },
    { type: 'number', label: '数字输入', icon: 'Plus' },
    { type: 'select', label: '下拉选择', icon: 'Filter' },
    { type: 'radio', label: '单选框', icon: 'CheckBox' },
    { type: 'checkbox', label: '复选框', icon: 'DocumentCopy' },
    { type: 'switch', label: '开关', icon: 'SwitchButton' },
    { type: 'date', label: '日期选择', icon: 'Calendar' },
    { type: 'time', label: '时间选择', icon: 'Timer' },
    { type: 'group', label: '表单分组', icon: 'Folder' },
    { type: 'grid', label: '栅栏布局', icon: 'Grid' }
]);

const activeComponentId = ref<string | null>(null);
const isPreviewVisible = ref(false);
const generatedVueCode = ref('');
const generatedJsonCode = ref('');

// --- 核心逻辑 ---

const findComponentAndParent = (list: FormComponent[], id: string): { parent: FormComponent[], index: number, comp: FormComponent } | null => {
    for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) return { parent: list, index: i, comp: list[i] };
        if (list[i].list) {
            const result = findComponentAndParent(list[i].list!, id);
            if (result) return result;
        }
        if (list[i].columns) {
            for (let c = 0; c < list[i].columns!.length; c++) {
                if (list[i].columns![c].list) {
                    const result = findComponentAndParent(list[i].columns![c].list!, id);
                    if (result) return result;
                }
            }
        }
    }
    return null;
};

// 🚀 获取当前选中的组件对象 (用于右侧面板展示)
const activeComponent = computed(() => {
    if (!activeComponentId.value) return null;
    const result = findComponentAndParent(schema.value.components, activeComponentId.value);
    return result ? result.comp : null;
});

const handleCanvasDragStart = (e: DragEvent, id: string) => {
    e.dataTransfer?.setData('moveId', id);
};

const handleDragStart = (e: DragEvent, type: string) => {
    e.dataTransfer?.setData('componentType', type);
};

const handleDrop = (e: DragEvent, targetList: FormComponent[], dropIndex: number) => {
    e.stopPropagation();
    const moveId = e.dataTransfer?.getData('moveId');
    const type = e.dataTransfer?.getData('componentType') as any;

    if (moveId) {
        // 内部移动
        const result = findComponentAndParent(schema.value.components, moveId);
        if (result) {
            const item = result.parent.splice(result.index, 1)[0];
            let finalIndex = dropIndex;
            if (result.parent === targetList && dropIndex > result.index) {
                finalIndex--;
            }
            targetList.splice(finalIndex, 0, item);
        }
    } else if (type) {
        // 新增
        const newComp: FormComponent = {
            id: `${type}_${Date.now().toString().slice(-6)}`,
            type: type,
            label: `新建${materialList.value.find(m => m.type === type)?.label || '组件'}`,
            field: `field_${Date.now().toString().slice(-6)}`,
            required: false,
            props: { placeholder: '请输入内容' }
        };
        
        if (type === 'group') newComp.list = [];
        if (type === 'grid') newComp.columns = [{span: 12, list: []}, {span: 12, list: []}];

        targetList.splice(dropIndex, 0, newComp);
        activeComponentId.value = newComp.id;
    }
};

const selectComponent = (id: string) => {
    activeComponentId.value = id;
};

const deleteComponent = (id: string) => {
    const result = findComponentAndParent(schema.value.components, id);
    if (result) {
        result.parent.splice(result.index, 1);
    }
    if (activeComponentId.value === id) activeComponentId.value = null;
};

// --- 出码逻辑 ---
const generateCode = () => {
    if (!schema.value.components.length) return ElMessage.warning('画布为空');
    generatedJsonCode.value = JSON.stringify(schema.value, null, 2);

    try {
        const code = SimpleASTGenerator.generateComponent(schema.value.components);
        const validation = SimpleASTGenerator.validateGeneratedCode(code);
        
        if (validation.valid) {
            generatedVueCode.value = code;
            isPreviewVisible.value = true;
        } else {
            ElMessage.error(`代码生成失败: ${validation.errors.join(', ')}`);
        }
    } catch (error) {
        ElMessage.error('代码生成出错: ' + (error as Error).message);
    }
};

const handleSave = async () => {
    if (schema.value.components.length === 0) {
        return ElMessage.warning('不能发布空表单！请先拖入组件');
    }
    try {
        await saveFormSchemeApi(schema.value);
        ElMessage.success('表单配置已成功持久化到服务器');
    } catch (error) {
        ElMessage.error('保存失败');
    }
}
const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    ElMessage.success('已复制代码');
};

onMounted(async () => {
    try {
        const res = await getFormSchemaApi();
        //如果后端有数据（不是null）,就覆盖本地初始化的空画布
        if (res && res.components) {
            schema.value = res;
            ElMessage.success('已从服务器恢复上传保存的表单状态');
        }
    } catch (error) {
        console.error('拉取表单状态失败', error);
    }
});
</script>

<template>
    <div class="lc-container">
        <header class="lc-header">
            <div class="logo">Form Engine Pro</div>
            <div class="actions">
                <el-button type="primary" plain @click="generateCode">预览与出码</el-button>
                <el-button type="success" @click="handleSave">保存发布</el-button>
            </div>
        </header>

        <main class="lc-main">
            <aside class="lc-sidebar left">
                <div class="panel-title">基础组件</div>
                <div class="material-grid">
                    <div v-for="item in materialList" :key="item.type" class="material-item" draggable="true"
                        @dragstart="handleDragStart($event, item.type)">
                        <el-icon>
                            <component :is="item.icon" />
                        </el-icon>
                        <span>{{ item.label }}</span>
                    </div>
                </div>
            </aside>

            <section class="lc-canvas">
                <div class="canvas-paper">
                    <div class="canvas-header">
                        <el-input v-model="schema.title" class="form-title-input" />
                    </div>
                    <div class="canvas-body" :class="{ 'empty-hint': !schema.components.length }" @dragover.prevent
                        @drop="handleDrop($event, schema.components, schema.components.length)">
                        <p v-if="!schema.components.length">从左侧拖拽组件至此</p>
                        <transition-group name="list">
                            <BuilderNode v-for="(comp, index) in schema.components" :key="comp.id"
                                :comp="comp" :parent-list="schema.components" :index="index"
                                :active-component-id="activeComponentId" :label-width="schema.labelWidth"
                                @select="selectComponent" @delete="deleteComponent"
                                @dragstart="handleCanvasDragStart" @drop="handleDrop" />
                        </transition-group>
                    </div>
                </div>
            </section>

            <aside class="lc-sidebar right">
                <el-tabs type="border-card" class="config-tabs">
                    <el-tab-pane label="组件属性">
                        <component-config :component="activeComponent" />
                    </el-tab-pane>
                    <el-tab-pane label="全局配置">
                        <div class="attr-panel">
                            <el-form label-position="top">
                                <el-form-item label="表单标题">
                                    <el-input v-model="schema.title" />
                                </el-form-item>
                                <el-form-item label="标签宽度">
                                    <el-input v-model="schema.labelWidth" />
                                </el-form-item>
                                <el-form-item label="表单 ID">
                                    <el-input v-model="schema.formId" disabled />
                                </el-form-item>
                            </el-form>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </aside>
        </main>

        <el-drawer v-model="isPreviewVisible" title="引擎出码预览" size="50%">
            <el-tabs type="border-card">
                <el-tab-pane label="Vue 3 源码">
                    <el-button size="small" @click="copyCode(generatedVueCode)">复制</el-button>
                    <pre class="code-box">{{ generatedVueCode }}</pre>
                </el-tab-pane>
                <el-tab-pane label="JSON Schema">
                    <el-button size="small" @click="copyCode(generatedJsonCode)">复制</el-button>
                    <pre class="code-box">{{ generatedJsonCode }}</pre>
                </el-tab-pane>
            </el-tabs>
        </el-drawer>
    </div>
</template>

<style scoped>
.lc-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #f5f7fa;
}

.lc-header {
    height: 50px;
    background: #242424;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
}

.lc-main {
    flex: 1;
    display: flex;
    overflow: hidden;
}

.lc-sidebar {
    width: 300px;
    background: white;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid #e4e7ed;
}

.lc-canvas {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    justify-content: center;
}

.canvas-paper {
    width: 800px;
    background: white;
    padding: 40px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    min-height: 100%;
}

.material-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 15px;
}

.material-item {
    background: #f4f6f8;
    border: 1px solid #e4e7ed;
    padding: 8px;
    border-radius: 4px;
    cursor: grab;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
}

.attr-panel {
    padding: 20px;
}

.code-box {
    background: #282c34;
    color: #98c379;
    padding: 15px;
    border-radius: 4px;
    overflow: auto;
    max-height: 500px;
}

.form-title-input :deep(.el-input__inner) {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
}
</style>