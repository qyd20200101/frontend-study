<script setup lang="ts">
import { ref } from "vue";
import type { FormComponet,FormSchema } from "../../types/lowcode";

//初始化一份空的表单协议数据，这是画板的大脑
const schema = ref<FormSchema>({
    formId: `form_${Date.now()}`,
    title: '未命名表单',
    labelWidth: '100px',
    components: []
});

//左侧物料区：预设可以拖拽的组件包
const materiaList = ref([
    {type:'input',label:'单行文本',icon:'Edit'},
    {type:'select',label:'下拉选择',icon:'Filter'},
    {type:'switch',label:'开关',icon:'SwitchButton'},
    {type:'date',label:'日期选择',icon:'Calendar'},
]);
</script>
<template>
    <div class="lc-container">
        <header class="lc-header">
            <div class="logo">Form Engine Pro</div>
            <div class="actions">
                <el-button type="primary">预览</el-button>
                <el-button type="success">保存发布</el-button>
            </div>
        </header>
        <main class="lc-main">
            <aside class="lc-sidebar" left>
                <div class="apnel-title">基础组件</div>
                <div class="material-grid">
                    <div v-for="item in materiaList" :key="item.type" class="material-item">
                        <el-icon><component :is="item.icon"/></el-icon>
                        <span>{{ item.label }}</span>
                    </div>
                </div>
            </aside>

            <section class="lc-canvas">
                <div class="canvas-paper">
                    <el-input v-model="schema.title" class="form-title-input"/>
                </div>
                <div class="canvas-body" empty-hint>
                    <p>请从左侧拖拽组件自此</p>
                </div>
            </section>

            <aside class="lc-sidebar" right>
                <el-tabs type="border-card" class="config-tabs">
                    <el-tab-pane label="组件属性">
                        <el-empty description="请先在画布中选中一个组件" :image-size="80"/>
                    </el-tab-pane>
                    <el-tab-pane label="表单全局设置">
                        <el-form label-position="top">
                            <el-form-item label="标签宽度">
                                <el-input v-model="schema.labelWidth"/>
                            </el-form-item>
                        </el-form>
                    </el-tab-pane>
                </el-tabs>
            </aside>
        </main>
    </div>
</template>
<style scoped>
.lc-container{
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f0f2f5;
    overflow: hidden;
}
.lc-header{
    padding: 0 20px;
    height: 50px;
    background: #242424;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}
.lc-header .logo{
    font-weight: bold;
    font-size: 16px;
    letter-spacing: 1px;
}
.lc-main{
    flex:1;
    display: flex;
    /* 防止三栏被挤破 */
    overflow: hidden;
}

/* 左右侧栏统一样式 */
.lc-sidebar{
    width: 300px;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    background: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, .05);
    z-index: 10;
}

/* 左侧无聊区特点样式 */
.panel-title{
    padding: 15px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}
.material-item{
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f4f6f8;
    border: 1px solid #e1e4e8;
    border-radius: 4px;
    cursor: grab;
    font-size: 13px;
    transition: all .2s;
}
.material-item:hover{
    border-color: #409eff;
    color: #409eff;
}
/* 中间无限画布区域 */
.lc-canvas{
    flex: 1;
    padding: 20px;
    overflow-y: ayto;
    display: flex;
    justify-content: center;
}

.canvas-paper{
    width: 800px;
    min-height: 600px;
    background: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
    border-radius: 8px;
    padding: 30px;
    display: flex;
    flex-direction: column;
}

.form-title-input{
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
}

/* 深度穿透去掉input边框 */
:deep(.form-title-input .el-input__wrapper){
    box-shadow: none !important;
    padding: 0;
}
:deep(.form-title-input .el-input__inner){
    text-align: center;
    font-size: 24px;
    font-weight: bold;
}

.canvas-body{
    flex: 1;
    border: 2px dashed #ebeef5;
    border-radius: 6px;
    transition: background-color .3s;
}
.empty-hint{
    display: flex;
    justify-content: center;
    align-items: center;
    color: #909399;
    font-size: 14px;
}
</style>
