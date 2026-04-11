import { createRouter,createWebHistory,type RouteRecordRaw } from "vue-router";

//1.静态路由：所有人都可以访问（登录,404）
export const constantRoutes: RouteRecordRaw[] =[
    {
        path:'/login',
        name: 'Login',
        component: () =>import('../views/Login.vue'),
        meta: {title:'登录'}
    },
    {
        path: '/404',
        component: () => import('../views/404.vue'),
        meta: {title: '页面不存在'}
    }
];

//2.动态路由：需要根据角色（roles）过滤后加载
//在meta中定义roles，方便后面过滤
export const asyncRouters: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Dashboard',
        component: () =>import("../components/DataManager.vue"),
        meta: {
            title: '资产管理面板',
            roles: ['admin','editor'] //只有这两个角色能进
        }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes: constantRoutes
})

export default router;