<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "../store/user";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

//1.响应式表单数据
const loginForm = reactive({
    username: '',
    password: ''
})

//2.Loading状态，提升用户体验
const loading = ref(false);

//3.登录处理函数
const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
        return alert('请输入账号和密码');
    }
    loading.value = true;
    try {
        //调用Store里面的登录Action(内部调用LoginApi，并存储Token)
        await userStore.login(loginForm);
        console.log('登陆成功，准备跳转');

        /*
        登录成功后，跳转用户之前想去的页面(从redirect获取参数)
        重定向逻辑：
        为了提升用户操作的连贯性
        当用户点击深层链接,router.beforeEach守卫会拦截并重定向到.login
        通过useRoute().query.redirect捕获路径，登录接口返回成功，
        不会简单去到首页，而是通过router.push(redirect)直接到达原本想去的页面
        */
        const redirect = (route.query.redirect as string) || '/dashboard';
        router.push(redirect);
        console.log('登录成功，准备重定向至：', redirect);
    } catch (error) {
        alert('登录失败,请检查用户名或密码');
        console.error(error);
    } finally {
        loading.value = false;
    }
}
</script>
<template>
    <div class="login-container">
        <div class="login-box">
            <h2>企业资产管理系统</h2>
            <p class="subtitle">请登录您的账号</p>

            <div class="form-item">
                <input type="text" v-model="loginForm.username" placeholder="用户名（admin）">
            </div>
            <div class="form-item">
                <input type="text" v-model="loginForm.password" placeholder="密码" @keyup.enter="handleLogin">
            </div>

            <button :disabled="loading" class="login-btn" @click="handleLogin">
                {{ loading ? '正在验证身份...' : '立即登录' }}
            </button>

            <div class="tips">
                <p>测试账号:admin(管理员)|editor(普通用户)</p>
            </div>
        </div>
    </div>
</template>
<style scoped>
.login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #1890ff 0%, #001529 100%);
}

.login-box {
    width: 400px;
    padding: 40px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, .2);
    text-align: center;
}

h2 {
    margin-bottom: 8px;
    color: #333;
}

.subtitle {
    margin-bottom: 30px;
    color: #999;
    font-size: 14px;
}

.form-item {
    margin-bottom: 20px;
}

input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
}

.login-btn {
    width: 100%;
    padding: 12px;
    background: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background .3s;
}

.login-btn:disabled {
    background: #bae7ff;
    cursor: not-allowed;
}

.tip {
    margin-top: 20px;
    padding-top: 10px;
    font-size: 12px;
    color: #999;
    border-top: 1px solid #eee;

}
</style>