<script setup lang="ts">
import { ref } from 'vue';

/*
递归组件核心：必须定义name或者在steup中自调用
注意点：
1.数据预处理：后端返回的是扁平数组，利用map映射表将其转化为树形结构，
而不是使用双重循环
2.事件冒泡：在递归组件中，每一层都要把事件往上传递emit，
层级过深考虑使用provide/inject或者全局事件总线
避免繁琐事件逐层转发
3.性能优化:树节点达到万级，引入虚拟滚动技术，只渲染可视区域系欸但
使用v-show或v-if控制展开，减少初始渲染dom数量
4.规范化：使用ts定义treenode接口，确保每一层递归的数据结构都是稳健的
*/ 

interface TreeNode{
    id: number;
    name: string;
    children?: TreeNode[];
}

const props = defineProps<{
    node: TreeNode;
}>();

const emit = defineEmits(['node-click']);

// 控制子树的展开/收起
const isOpen = ref(false);
const toggle = () =>{
    if (props.node.children?.length) {
        isOpen.value = !isOpen.value;
    }
    emit('node-click',props.node);
};
</script>
<template>
    <div class="tree-item">
        <div class="label" @click="toggle">
            <!-- 如果有子节点，显示图标 -->
             <span v-if="node.children?.length">{{  isOpen ? '▼' : '▶' }}</span>
             <span v-else class="empt-icon"></span>
             {{ node.name }}
        </div>

        <!-- 递归调用点：如果展开且有子节点，就渲染自己 -->
         <ul v-if="isOpen && node.children?.length" class="children">
            <li v-for="child in node.children" :key="child.id">
                <TreeItem :node="child" @node-click="(n) =>emit('node-click',n)"></TreeItem>
            </li>
         </ul>
    </div>
</template>
<style scoped>
.tree-item{
    list-style: none;
    text-align: left;
}
.label{
    padding: 5px;
    transition: background .2s;
    cursor: pointer;
}
.label:hover{
    background: #f0f7ff;
    color: #1890ff;
}
.children{
    margin-left: 20px;
    padding-left: 10px;
    border-left: 1px dashed #000;
}
.empty-icon{
    display: inline-block;
    width: 14px;
}
</style>