<script setup lang="ts">
import { ref,reactive } from "vue";

//使用ref定义一个响应式的字符串
const username = ref('张三');

//使用reactive定义一个响应式的对象
const userInfo = reactive({
    age: 25,
    city: '西安',
    skills: ['JavaScript','Vue']
});

//定义一个方法，当按钮被点击时，这个方法会被调用
function updateUser() {
    username.value += '!'; //修改ref定义的数据，必须通过.value
    userInfo.age++;
    userInfo.skills.push('TypeScript');//也能侦测到数组的变化
    console.log('用户信息更新');
}
</script>
<template>
    <div class="user-card">
        <h2>用户信息卡片</h2>
        <p>姓名：{{ username }}</p>
        <p>年龄: {{ userInfo.age }}</p>
        <p>城市：{{ userInfo.city }}</p>
        <p>技能：{{ userInfo.skills }}</p>
        <button @click="updateUser">更新用户信息</button>
    </div>
</template>
<style scoped>
.user-card {
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    width: 300px;
    text-align: left;
}
button {
    margin-top: 10px;
    padding: 8px 15px;
    cursor: pointer;
}
</style>