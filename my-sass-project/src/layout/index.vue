<script setup lang="ts">
import { useUserStore } from "../store/user";
const userStore = useUserStore();

//退出登录逻辑
const handleLogout = async () => {
    userStore.logout();
    // router.push切换页面，大量的全局状态闭包，未解绑的事件监听不会被去重
    // router.replace('/login');
    window.location.href = '/login';
    console.log('退出');
    
};
</script>
<template>
    <div class="app-wrapper">
        <!-- 1.左侧固定侧边栏 -->
        <aside class="sidebar">
            <div class="logo">资产管理系统</div>
            <nav class="menu">
                <router-link to="/" class="menu-item">📊 资产面板</router-link>
                <router-link v-if="userStore.roles.includes('admin')" to="/system" class="menu-item">⚙️
                    系统设置</router-link>
            </nav>
        </aside>

        <!-- 2.右侧主体区域 -->
        <div class="main-container">
            <!-- 顶部信息栏 -->
            <header class="header">
                <div class="breadcrumb">首页 /{{ $route.meta.title }}</div>
                <div class="user-info">
                    <span>欢迎您,{{ userStore.userInfo?.username }}</span>
                    <button @click="handleLogout" class="logout-btn">退出</button>
                </div>
            </header>

            <!-- 核心内容区：这是子路由渲染的地方 -->
            <main>
                <router-view v-slot="{ Component }" class="app-main">
                    <transition name="fade-transform" mode="out-in">
                        <component :is="Component"/>
                    </transition>
                </router-view>
            </main>
        </div>
    </div>
</template>
<style scoped>
.app-wrapper {
    display: flex;
    height: 100vh;
    width: 100vw;
}

/* 侧边栏样式 */
.sidebar {
    width: 210px;
    background: #001529;
    color: #fff;
    display: flex;
    flex-direction: column;
}

.logo {
    height: 60px;
    line-height: 60px;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    background: #002140;
}

.menu {
    flex: 1;
    padding: 10px 0;
}

.menu-item {
    display: block;
    padding: 15px 20px;
    color: #a6adb4;
    text-decoration: none;
    transition: 0.3s;
}

.menu-item:hover,
.router-link-active {
    color: #fff;
    background: #1890ff;
}

/* 主体内容样式 */
.main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: auto;
}

.header {
    height: 60px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, .08);
}

.app-main {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: #f0f2f5;
}

.logout-btn {
    margin-left: 15px;
    padding: 4px 10px;
    cursor: pointer;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
}

/* 页面切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
    transition: all .3s;
}

.fade-transform-enter-from {
    opacity: 0;
    transform: translateX(-30px);
}

.fade-transform-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
</style>