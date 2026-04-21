<script lang="ts">
export default { name: 'FormBuilder' }
</script>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
// 🚀 确保这里导入的名称与 lowcode.ts 中定义的一致 (FormComponent)
import type { FormComponent, FormSchema } from '../../types/lowcode';

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

const handleDragStart = (e: DragEvent, type: string) => {
    e.dataTransfer?.setData('componentType', type);
};

const handleDrop = (e: DragEvent) => {
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
        tpl += `    <el-form-item label="${c.label}">\n      <${getElComponent(c.type)} v-model="form.${c.field}" />\n    </el-form-item>\n`;
    });
    tpl += `  </el-form>\n</template>`;
    
    generatedVueCode.value = tpl;
    isPreviewVisible.value = true;
};

const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    ElMessage.success('已复制代码');
};
</script>

<template>
    <div class="lc-container">
        <header class="lc-header">
            <div class="logo">Form Engine Pro</div>
            <div class="actions">
                <el-button type="primary" plain @click="generateCode">预览与出码</el-button>
                <el-button type="success">保存发布</el-button>
            </div>
        </header>

        <main class="lc-main">
            <aside class="lc-sidebar left">
                <div class="panel-title">基础组件</div>
                <div class="material-grid">
                    <div v-for="item in materialList" :key="item.type" class="material-item" draggable="true"
                        @dragstart="handleDragStart($event, item.type)">
                        <el-icon><component :is="item.icon" /></el-icon>
                        <span>{{ item.label }}</span>
                    </div>
                </div>
            </aside>

            <section class="lc-canvas">
                <div class="canvas-paper">
                    <div class="canvas-header">
                        <el-input v-model="schema.title" class="form-title-input" />
                    </div>
                    <div class="canvas-body" :class="{ 'empty-hint': !schema.components.length }"
                        @dragover.prevent @drop="handleDrop">
                        <p v-if="!schema.components.length">从左侧拖拽组件至此</p>
                        <transition-group name="list">
                            <div v-for="comp in schema.components" :key="comp.id" class="canvas-comp-item"
                                :class="{ 'is-active': activeComponentId === comp.id }"
                                @click.stop="selectComponent(comp.id)">
                                
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
.lc-container { height: 100vh; display: flex; flex-direction: column; overflow: hidden; background: #f5f7fa; }
.lc-header { height: 50px; background: #242424; color: white; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
.lc-main { flex: 1; display: flex; overflow: hidden; }
.lc-sidebar { width: 300px; background: white; flex-shrink: 0; display: flex; flex-direction: column; border: 1px solid #e4e7ed; }
.lc-canvas { flex: 1; padding: 20px; overflow-y: auto; display: flex; justify-content: center; }
.canvas-paper { width: 800px; background: white; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); min-height: 100%; }
.canvas-comp-item { position: relative; padding: 10px; border: 1px dashed #dcdfe6; margin-bottom: 10px; display: flex; transition: all 0.2s; cursor: pointer; }
.canvas-comp-item.is-active { border: 2px solid #409eff; background: #ecf5ff; }
.comp-mask { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 5; }
.comp-label { width: 100px; flex-shrink: 0; font-size: 14px; }
.comp-content { flex: 1; }
.comp-actions { position: absolute; right: -10px; top: -10px; z-index: 10; }
.material-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 15px; }
.material-item { background: #f4f6f8; border: 1px solid #e4e7ed; padding: 8px; border-radius: 4px; cursor: grab; display: flex; align-items: center; gap: 5px; font-size: 13px; }
.attr-panel { padding: 20px; }
.code-box { background: #282c34; color: #98c379; padding: 15px; border-radius: 4px; overflow: auto; max-height: 500px; }
.form-title-input :deep(.el-input__inner) { font-size: 20px; font-weight: bold; text-align: center; }
</style>