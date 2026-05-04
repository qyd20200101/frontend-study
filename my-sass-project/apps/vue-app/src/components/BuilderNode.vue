<template>
    <div class="canvas-comp-item"
        :class="{ 'is-active': activeComponentId === comp.id }" draggable="true"
        @dragstart.stop="handleDragStart($event, comp.id)" @dragover.prevent
        @drop.stop="handleDropEvent($event, parentList, index)" @click.stop="handleSelect(comp.id)">

        <div class="drag-handler">
            <el-icon><i-ep-rank /></el-icon>
        </div>

        <div class="comp-mask"></div>
        <div class="comp-label" :style="{ width: labelWidth }">
            <span v-if="comp.required" style="color:red">*</span> {{ comp.label }}
        </div>
        
        <div class="comp-content" style="flex: 1;">
            <!-- 分组容器 -->
            <div v-if="comp.type === 'group'" class="builder-group" @dragover.prevent @drop.stop="handleDropEvent($event, comp.list!, comp.list!.length)">
                <div v-if="!comp.list!.length" class="empty-zone">拖拽组件到此分组</div>
                <transition-group name="list">
                    <BuilderNode v-for="(child, cIdx) in comp.list!" :key="child.id"
                        :comp="child" :parent-list="comp.list!" :index="cIdx"
                        :active-component-id="activeComponentId" :label-width="labelWidth"
                        @select="handleSelect" @delete="handleDelete" @dragstart="handleDragStart" @drop="handleDropEvent" />
                </transition-group>
            </div>
            
            <!-- 栅栏容器 -->
            <div v-else-if="comp.type === 'grid'" class="builder-grid">
                <el-row :gutter="20">
                    <el-col v-for="(col, colIdx) in comp.columns!" :key="colIdx" :span="col.span">
                        <div class="grid-col-zone" @dragover.prevent @drop.stop="handleDropEvent($event, col.list!, col.list!.length)">
                            <div v-if="!col.list!.length" class="empty-zone">拖拽到列</div>
                            <transition-group name="list">
                                <BuilderNode v-for="(child, cIdx) in col.list!" :key="child.id"
                                    :comp="child" :parent-list="col.list!" :index="cIdx"
                                    :active-component-id="activeComponentId" :label-width="labelWidth"
                                    @select="handleSelect" @delete="handleDelete" @dragstart="handleDragStart" @drop="handleDropEvent" />
                            </transition-group>
                        </div>
                    </el-col>
                </el-row>
            </div>
            
            <!-- 普通组件 -->
            <div v-else>
                <component :is="getElComponent(comp.type)" v-bind="comp.props" style="width:100%" />
            </div>
        </div>
        
        <div v-if="activeComponentId === comp.id" class="comp-actions">
            <el-button type="danger" circle size="small" @click.stop="handleDelete(comp.id)">
                <el-icon><i-ep-delete /></el-icon>
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getElComponent } from '../utils/lowcode';
import type { FormComponent } from '../types/lowcode';

const props = defineProps<{
    comp: FormComponent;
    parentList: FormComponent[];
    index: number;
    activeComponentId: string | null;
    labelWidth: string;
}>();

const emit = defineEmits<{
    (e: 'select', id: string): void;
    (e: 'delete', id: string): void;
    (e: 'dragstart', event: DragEvent, id: string): void;
    (e: 'drop', event: DragEvent, targetList: FormComponent[], index: number): void;
}>();

const handleSelect = (id: string) => emit('select', id);
const handleDelete = (id: string) => emit('delete', id);
const handleDragStart = (e: DragEvent, id: string) => emit('dragstart', e, id);
const handleDropEvent = (e: DragEvent, targetList: FormComponent[], index: number) => emit('drop', e, targetList, index);
</script>

<script lang="ts">
export default {
    name: 'BuilderNode'
}
</script>

<style scoped>
.canvas-comp-item {
    position: relative;
    padding: 10px;
    border: 1px dashed #dcdfe6;
    margin-bottom: 10px;
    display: flex;
    transition: all 0.2s;
    cursor: pointer;
    background: #fff;
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

.drag-handler {
    display: flex;
    align-items: center;
    color: #909399;
    cursor: move;
    padding-right: 10px;
    opacity: 0.3;
    transition: opacity 0.2s;
}

.canvas-comp-item:hover > .drag-handler {
    opacity: 1;
}

.builder-group {
    border: 1px dashed #409eff;
    border-radius: 4px;
    padding: 15px;
    min-height: 100px;
    background: #fdfdfd;
}

.builder-grid {
    border: 1px dashed #409eff;
    border-radius: 4px;
    padding: 10px;
    min-height: 100px;
}

.grid-col-zone {
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    min-height: 80px;
    padding: 10px;
    background: #fff;
}

.empty-zone {
    color: #909399;
    text-align: center;
    line-height: 60px;
    font-size: 13px;
}
</style>
