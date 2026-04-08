<script setup lang="ts">
import { ref,reactive } from "vue";

// 使用ref定义第一个响应式字符串
const username = ref('张三');

// 使用reactive定义一个响应式对象
const userInfo = reactive({
    age:25,
    city:'西安',
    skills:['JavaScript','Vue']
});

// 定义一个方法，当按钮被点击时，这个方法会被调用
function updateUser() {
    username.value += '!'; //修改ref定义的数据，必须提供.value
    userInfo.age++; //直接修改reactive定义的对象属性
    userInfo.skills.push('TypeScript'); //也能侦测到数组的变化
    console.log('用户信息已更新!');
}
</script>

<template>
    <div class="user-card">
        <h2>用户信息卡片</h2>
        <p>姓名:{{ username }}</p>
        <p>年龄:{{ userInfo.age }}</p>
        <p>城市:{{ userInfo.city }}</p>
        <p>技能:{{ userInfo.skills }}</p>
        <button @click="updateUser">更新用户信息</button>
    </div>
</template>

<style scoped>
/*scoped意味着这里的样式只对当前组件生效，不会污染其他组件*/
.user-card{
    padding: 20px;
    width: 300px;
    text-align: left;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
button{
    margin-top: 10px;
    padding: 8px 15px;
    cursor: pointer;
}
</style>