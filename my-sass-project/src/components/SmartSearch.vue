<script setup lang="ts">
/*
1. 顶层执行环境:函数和ref,reactive和普通函数都在同一个作用域下
由于闭包，函数内部可以访问外部的参数
2.响应式proxy:抛弃了Object.definedProtitype,改用ES6的Proxy
vue2数据挂载到this,实际上访问this.msg访问被拦截的属性
vue3 ref本身就是响应式对象，修改msg.value触发的是对象自身的ste拦截
*/

import { ref,onUnmounted } from "vue";

const query = ref('');
const status = ref('待输入...');
const timerId = ref<number| null>(null);

// 模拟原生js闭包的this丢失陷阱
const startMockPolling = () =>{
    status.value = '正在搜索中';

    //模拟一个旧时代的setInterval陷阱
    //在普通function中，setInterval的this指向的是window
    timerId.value = window.setInterval(function () {
        console.log('当前搜索词：',query.value);
        // 在vue3<script setup>中，这里能访问query吗？
        //答案是肯定的,因为query在外部作用域闭包，不需要this
    },2000);
}

/*
思考：在vue2的mothods里写上面的代码
必须写成const self = this;或者.bind(this);
*/ 

const stopPolling = () =>{
    if (timerId.value) {
        clearInterval(timerId.value);
        status.value = '搜索已停止';
    }
};

onUnmounted(() => stopPolling());
</script>
<template>
    <div class="search-box">
        <input  v-model="query" placeholder="输入搜索内容"/>
        <div class="controls">
            <button @click="startMockPolling">开启轮询监控</button>
            <button @click="stopPolling">停止</button>
        </div>
        <p>状态：{{ status }}</p>
        <div class="tip">
            * 观察控制台：由于 Vue3 组合式 API 利用了闭包特性，
        我们不再需要通过 bind(this) 来解决异步回调里的数据访问问题
        </div>
    </div>
</template>
<style scoped>
.search-box{
    padding: 20px;
    border: 1px dashed #666;
}
.controls{
    margin: 10px 0;
    display: flex;
    gap: 10px;
}
.tip{
    font-size: 12px;
    color: #999;
    margin-top: 15px;
}
</style>