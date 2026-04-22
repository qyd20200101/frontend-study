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
// --- 状态管理 ---
const schema = ref<FormSchema>({
    formId: `form_${Date.now()}`,
    title: '未命名表单',
    labelWidth: '100px',
    components: []
});

const materialList = ref([
    { type: 'input', label: '单行文本', icon: 'Edit' },
    { type: 'select', label: '下拉选择', icon: 'Filter' },
    { type: 'switch', label: '开关', icon: 'SwitchButton' },
    { type: 'date', label: '日期选择', icon: 'Calendar' }
]);

const activeComponentId = ref<string | null>(null);
const isPreviewVisible = ref(false);
const generatedVueCode = ref('');
const generatedJsonCode = ref('');

// --- 核心逻辑 ---

// 🚀 获取当前选中的组件对象 (用于右侧面板展示)
const activeComponent = computed(() => {
    return schema.value.components.find(c => c.id === activeComponentId.value) || null;
});

//新增：画布内部的拖拽排序逻辑
//记录内部拖拽的起始索引
const handleCanvasDragStart = (e: DragEvent, index: number) => {
    //明确告诉dataTransfer,这是内部移动不是左边新增
    e.dataTransfer?.setData('moveIndex', index.toString());
};

//放置在某个具体组件上时触发
const handleCanvasDrop = (e: DragEvent, dropIndex: number) => {
    //阻止冒泡，防止触发外层大画布的drop
    e.stopPropagation();

    const moveIndexStr = e.dataTransfer?.getData('moveIndex');
    const type = e.dataTransfer?.getData('componentType');

    if (moveIndexStr) {
        //场景A：内部上下拖拽排序
        const dragIndex = parseInt(moveIndexStr);
        if (dragIndex === dropIndex) return;

        //核心思路：把元素从原数组抽出来，塞到新位置
        const draggedItem = schema.value.components.splice(dragIndex, 1)[0];
        schema.value.components.splice(dropIndex, 0, draggedItem);
    } else {
        //场景B：从左侧物料拖进来，但精确插到了某个组件中间
        const newComp: FormComponent = {
            id: `${type}_${Date.now().toString().slice(-6)}`,
            type: type as any,
            label: `新建组件`,
            field: `field_${Date.now().toString().slice(-6)}`,
            required: false,
            props: { placeholder: '请输入' }
        };

        //插入到当前鼠标悬浮的组件位置
        schema.value.components.splice(dropIndex, 0, newComp);
        activeComponentId.value = newComp.id;
    }
};

const handleDragStart = (e: DragEvent, type: string) => {
    e.dataTransfer?.setData('componentType', type);
};
//修复原本大画布的Drop,只处理从左侧拖到画布空白处
const handleDrop = (e: DragEvent) => {
    //如果时内部移动拖到空白处，直接忽略
    if (e.dataTransfer?.getData('moveIndex')) return;
    const type = e.dataTransfer?.getData('componentType') as any;
    if (!type) return;

    const newComp: FormComponent = {
        id: `${type}_${Date.now().toString().slice(-6)}`,
        type: type,
        label: `新建${materialList.value.find(m => m.type === type)?.label}`,
        field: `field_${Date.now().toString().slice(-6)}`,
        required: false,
        props: { placeholder: '请输入内容' }
    };

    schema.value.components.push(newComp);
    // 自动选中新拖入的组件
    activeComponentId.value = newComp.id;
};

const selectComponent = (id: string) => {
    activeComponentId.value = id;
};

const deleteComponent = (id: string) => {
    schema.value.components = schema.value.components.filter(c => c.id !== id);
    if (activeComponentId.value === id) activeComponentId.value = null;
};

const getElComponent = (type: string) => {
    const map: Record<string, string> = {
        'input': 'el-input',
        'select': 'el-select',
        'switch': 'el-switch',
        'date': 'el-date-picker'
    };
    return map[type] || 'el-input';
};

// --- 出码逻辑 ---
const generateCode = () => {
    if (!schema.value.components.length) return ElMessage.warning('画布为空');
    generatedJsonCode.value = JSON.stringify(schema.value, null, 2);

    // 生成简单的 Vue 模板
    let tpl = `<template>\n  <el-form label-width="${schema.value.labelWidth}">\n`;
    schema.value.components.forEach(c => {
        tpl += `    <el-form-item label="${c.label}" prop="${c.field}">\n      <${getElComponent(c.type)} v-model="form.${c.field}" />\n    </el-form-item>\n`;
    });
    tpl += `  </el-form>\n</template>`;
    // 组装 Script 
    let script = `<script setup>\nimport { ref } from 'vue';\n\nconst formRef = ref(null);\nconst form = ref({\n`;
    let rulesStr = `const rules = ref({\n`;

    schema.value.components.forEach(c => {
        script += `  ${c.field}: ${c.type === 'switch' ? 'false' : 'null'},\n`;
        // 如果右侧配置了必填，自动生成 Element Plus 校验规则代码！
        if (c.required) {
            const trigger = ['input'].includes(c.type) ? 'blur' : 'change';
            rulesStr += `  ${c.field}: [{ required: true, message: '此项为必填项', trigger: '${trigger}' }],\n`;
        }
    });
    generatedVueCode.value = tpl;
    isPreviewVisible.value = true;
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
                        @drop="handleDrop">
                        <p v-if="!schema.components.length">从左侧拖拽组件至此</p>
                        <transition-group name="list">
                            <div v-for="(comp, index) in schema.components" :key="comp.id" class="canvas-comp-item"
                                :class="{ 'is-active': activeComponentId === comp.id }" draggable="true"
                                @dragstart="handleCanvasDragStart($event, index)" @dragover.prevent
                                @drop="handleCanvasDrop($event, index)" @click.stop="selectComponent(comp.id)">

                                <div class="drag-handler">
                                    <el-icon><i-ep-rank /></el-icon>
                                </div>

                                <div class="comp-mask"></div>
                                <div class="comp-label" :style="{ width: schema.labelWidth }">
                                    <span v-if="comp.required" style="color:red">*</span> {{ comp.label }}
                                </div>
                                <div class="comp-content">
                                    <component :is="getElComponent(comp.type)" v-bind="comp.props" style="width:100%" />
                                </div>
                                <div v-if="activeComponentId === comp.id" class="comp-actions">
                                    <el-button type="danger" circle size="small" @click.stop="deleteComponent(comp.id)">
                                        <el-icon><i-ep-delete /></el-icon>
                                    </el-button>
                                </div>
                            </div>
                        </transition-group>
                    </div>
                </div>
            </section>

            <aside class="lc-sidebar right">
                <el-tabs type="border-card" class="config-tabs">
                    <el-tab-pane label="组件属性">
                        <div v-if="activeComponent" class="attr-panel">
                            <el-form label-position="top">
                                <el-form-item label="组件字段 (Field)">
                                    <el-input v-model="activeComponent.field" placeholder="例如: username" />
                                </el-form-item>
                                <el-form-item label="标题文字 (Label)">
                                    <el-input v-model="activeComponent.label" />
                                </el-form-item>
                                <el-form-item label="是否必填">
                                    <el-switch v-model="activeComponent.required" />
                                </el-form-item>
                                <el-form-item label="占位提示" v-if="activeComponent.props.placeholder !== undefined">
                                    <el-input v-model="activeComponent.props.placeholder" />
                                </el-form-item>
                            </el-form>
                        </div>
                        <el-empty v-else description="请先在画布中选中组件" :image-size="80" />
                    </el-tab-pane>
                    <el-tab-pane label="全局配置">
                        <div class="attr-panel">
                            <el-form label-position="top">
                                <el-form-item label="标签宽度">
                                    <el-input v-model="schema.labelWidth" />
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

.canvas-comp-item {
    position: relative;
    padding: 10px;
    border: 1px dashed #dcdfe6;
    margin-bottom: 10px;
    display: flex;
    transition: all 0.2s;
    cursor: pointer;
}

.canvas-comp-item.is-active {
    border: 2px solid #409eff;
    background: #ecf5ff;
}

.comp-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 5;
}

.comp-label {
    width: 100px;
    flex-shrink: 0;
    font-size: 14px;
}

.comp-content {
    flex: 1;
}

.comp-actions {
    position: absolute;
    right: -10px;
    top: -10px;
    z-index: 10;
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

/* 🚀 拖拽手柄样式 */
.drag-handler {
    display: flex;
    align-items: center;
    color: #909399;
    cursor: move;
    padding-right: 10px;
    opacity: 0.3;
    transition: opacity 0.2s;
}

.canvas-comp-item:hover .drag-handler {
    opacity: 1;
    /* 鼠标悬浮时才显示出明显的拖拽手柄 */
}
</style>