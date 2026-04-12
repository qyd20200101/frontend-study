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


/*
TS any类型问题:
解决办法：(类型复用)
1.定义源头：通过export，否则父组件无法复用此类型
2.契约同步：在父组件datamanager通过import type引入该类型
3.强类型约束：处理事件回调时，显示为参数标注类型
*/ 
export interface TreeNode{
    id: number;
    pid: number;
    name: string;
    children?: TreeNode[];
}
//接收树的一个节点
const props = defineProps<{
    //每一个TreeItem只渲染当前这一层数据(node)，
    //如果Node有children就会再次调用自己
    node: TreeNode;
}>();
// 定义点击信号,用于版当前点击的节点对象传给父组件
const emit = defineEmits(['node-click']);

// 控制子树的展开/收起
//树上的每一个节点都有自己独立的isOpen状态
const isOpen = ref(false);
const toggle = () =>{
    //判断是否有子孙
    //props.node.children?.length:可选操作链，
    // children为undefined/null,会直接返回undefined
    if (props.node.children?.length) {
        //自有有子节点时，从切换展开/收起状态
        isOpen.value = !isOpen.value;
    }
    //无论有没有子节点，都向外发出我被点了的信号
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
                <TreeItem :node="child" @node-click="(n:TreeNode) =>emit('node-click',n)"></TreeItem>
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
.empt-icon{
    display: inline-block;
    width: 14px;
}
</style>