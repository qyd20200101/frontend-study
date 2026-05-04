<template>
    <!-- 分组布局 -->
    <div v-if="comp.type === 'group'" v-show="checkCondition(comp.condition, formData)" class="form-group-render">
        <div class="group-title-render">{{ comp.label }}</div>
        <FormNode
            v-for="child in comp.list"
            :key="child.id"
            :comp="child"
            :form-data="formData"
        />
    </div>

    <!-- 栅栏布局 -->
    <el-row v-else-if="comp.type === 'grid'" v-show="checkCondition(comp.condition, formData)" :gutter="20">
        <el-col v-for="(col, idx) in comp.columns" :key="idx" :span="col.span">
            <FormNode
                v-for="child in col.list"
                :key="child.id"
                :comp="child"
                :form-data="formData"
            />
        </el-col>
    </el-row>

    <!-- 普通组件 -->
    <el-form-item v-else v-show="checkCondition(comp.condition, formData)" :label="comp.label" :prop="comp.field">
        <component :is="getElComponent(comp.type)" v-model="formData[comp.field]" v-bind="comp.props"
            :placeholder="comp.props?.placeholder || `请输入${comp.label}`" style="width: 100%" />
    </el-form-item>
</template>

<script setup lang="ts">
import { getElComponent, checkCondition } from '../utils/lowcode';
import type { FormComponent } from '../types/lowcode';

defineProps<{
    comp: FormComponent;
    formData: Record<string, any>;
}>();
</script>

<script lang="ts">
export default {
    name: 'FormNode'
}
</script>

<style scoped>
/* 分组布局优雅样式 */
.form-group-render {
    margin-bottom: 24px;
    padding: 24px;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    background: #ffffff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.02);
    transition: box-shadow 0.3s;
}

.form-group-render:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.06);
    border-color: #dcdfe6;
}

.group-title-render {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
    color: #303133;
    display: flex;
    align-items: center;
}

.group-title-render::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 16px;
    background-color: #409eff;
    margin-right: 10px;
    border-radius: 2px;
}
</style>
