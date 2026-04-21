
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
// import  Layout  from "../layout/index.vue";
//路由懒加载
const Layout = () => import("../layout/MainLayout.vue");

//常量路由中增加一个对根路径的处理
//1.静态路由：所有人都可以访问（登录,404）
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
    meta: { requiresAuth: false,title: "登录" },
  },
  {
    path: "/404",
    component: () => import("../views/404.vue"),
    meta: { title: "页面不存在" },
  }
];

/*
嵌套路由布局好处：
1.提升用户体验：页面的公共部分（侧边栏，面包屑，顶栏）只会在系统初始化时加载一次，
用户在不同菜单切换时，公共区域不会闪烁或重新渲染，提升操作流畅
2.代码解耦：将页面容器（Layout）与业务逻辑（DataManager）彻底解耦,
Layout负责ui骨架和全局状态，子页面只需要关注自身业务实现
3.状态持久化：配合pinia可以在layout瓜子啊时统一请求用户信息，
layout在路由切换过程一直存在，信息会一直保存在内存中，避免每个子页面都去访问接口
4.动效支持：在Layout的router-view上包裹transition组件，轻松实现页面切换时的动画效果
*/
//2.动态路由：需要根据角色（roles）过滤后加载
//在meta中定义roles，方便后面过滤
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    component: Layout, //核心：父路由时布局组件
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("../components/DataManager.vue"),
        meta: { title: "资产管理面板", roles: ["admin", "editor"] },
      },
      {
        path: "form-builder",
        name: "FormBuilder",
        component: () => import("../views/lowcode/FormBuilder.vue"),
        meta:{
          title: "低代码表单",
          icon: "Edit",
          roles: ['admin','editor'],
          KeepAlive:true
        },
      },
      {
        path: "system",
        name: "System",
        component: () => import("../views/System.vue"),
        meta: { title: "系统设置", roles: ["admin"] },
      },
      {
        path: "profile",
        name: "profile",
        component: () => import("../views/Profile.vue"),
        meta: { title: "个人中心", icon: "User", hidden: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
});
export function resetRouter() {}
export default router;
