<script setup lang="ts">
import { useUserStore } from "../store/user";
import { computed } from "vue";

/*
声明式权限管理(权限闭环)：
1.权限高内聚：当要增加权限码判定，只需要修改此文件
2.代码间接性：<AuthButton role="admin">比一长串v-if要易读
3.属性穿透：使用v-bind="$attrs"完美继承el-button所有功能，无损封装
4.指令强制性：v-permission指令通过removeChild操作DOM安全性更高
*/ 
const props = defineProps<{
    role?: string| string[];
    type?: string;
}>();

const userStore = useUserStore();

//核心逻辑：当前用户是否满足按钮要求的角色
const hasPermission = computed(() =>{
    if (!props.role) return true;//没传角色要求，默认显示
    const userRoles = userStore.roles;//从pinia拿当前用户角色
    const requiredRoles = Array.isArray(props.role)? props.role: [props.role];
    return userRoles.some(role => requiredRoles.includes(role));
}) ;
</script>
<template>
    <!-- 如果有全新才渲染el-button,并将所有属性($attrs)转发下去 -->
     <el-button v-if="hasPermission" v-bind="$attrs">
        <slot/>
     </el-button>
</template>