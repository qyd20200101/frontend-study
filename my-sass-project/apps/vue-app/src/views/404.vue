<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () =>{
    router.push('/');
};
</script>
<template>
    <div class="not-found">
        <div class="content">
            <h1>404</h1>
            <div class="error-img">🚀</div>
            <h2>抱歉，您访问的页面不存在或暂无权限</h2>
            <p>请检查输入的网址是否正确，或联系系统管理员分配权限。</p>
            <button class="back-btn" @click="goHome">返回系统首页</button>
        </div>
    </div>
</template>
<style scoped>
.not-found{
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f0f2f5;
    text-align: center;
}
h1{
    margin: 0;
    color: #1890ff;
    font-size: 12px;
}
.error-img{
    margin: 29px 0;
    font-size: 80px;
}
h2{
    margin-bottom: 10px;
    color: #333;
}
p{
    margin-bottom: 30px;
    color: #666;
}
.back-btn{
    padding: 10px 25px;
    background: 1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
</style>