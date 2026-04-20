<!-- src/layout/MainLayout.vue -->
<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "../store/user";
const router = useRouter();
const route = useRoute(); // 引入 route 获取 meta 信息
const userStore = useUserStore();

const handleCommand = (command: string) => {
    if (command === 'goProfile') {
        router.push('/profile');
    } else if (command === 'logout') {
        userStore.logout();
        router.push('/login');
    }
};

</script>

<template>
    <el-container class="layout-container">
        <!-- 侧边栏 -->
        <el-aside width="220px" class="aside">
            <div class="logo">SaaS Admin</div>
            <el-menu :default-active="route.path" router background-color="#304156" text-color="#bfcbd9"
                active-text-color="#409EFF">
                <el-menu-item index="/dashboard">
                    <el-icon><i-ep-odometer /></el-icon>
                    <span>控制台</span>
                </el-menu-item>
                <!-- 如果有系统管理路由，也加上 -->
                <el-menu-item v-if="userStore.roles.includes('admin')" index="/system">
                    <el-icon><i-ep-list /></el-icon>
                    <span>系统管理</span>
                </el-menu-item>
            </el-menu>
        </el-aside>

        <el-container>
            <!-- 顶部栏 -->
            <el-header class="header">
                <div class="header-left">
                    <el-breadcrumb separator="/" v-if="route.meta">
                        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                        <el-breadcrumb-item>{{ route.meta?.title }}</el-breadcrumb-item>
                    </el-breadcrumb>
                </div>
                <div class="header-right">
                    <el-dropdown @command="handleCommand">
                        <span class="user-info">
                            <!-- 加上可选链防止报错 -->
                            <el-avatar :size="32" :src="userStore.userInfo?.avatar" />
                            <span class="username">{{ userStore.userInfo?.username }}</span>
                            <el-icon><i-ep-arrowDown /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="goProfile">个人中心</el-dropdown-item>
                                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </el-header>
            
            <!-- 内容区 -->
            <el-main class="main-content">
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<style scoped>
.layout-container { height: 100vh; }
.aside { background-color: #304156; }
.logo { height: 60px; line-height: 60px; text-align: center; color: #fff; font-weight: bold; font-size: 18px; }
.header { border-bottom: 1px solid #e6e6e6; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; background: #fff;}
.user-info { display: flex; align-items: center; cursor: pointer; outline: none; }
.username { margin: 0 8px; font-size: 14px; color: #666; }
.main-content { background-color: #f0f2f5; padding: 20px; }
</style>
