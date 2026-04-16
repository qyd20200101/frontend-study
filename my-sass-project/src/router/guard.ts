import { useUserStore } from "../store/user";
import router, { asyncRoutes } from "../router/index"; 
import type { RouteRecordRaw } from "vue-router";
import nProgress from "nprogress";
import 'nprogress/nprogress.css';

//白名单：不需要登陆就能进入的页面
const whiteList = ['/login','/404'];
/*
1.助手函数：判断当前用户是否有权访问该路由
*/ 
function hasPermission(roles:string[],route:RouteRecordRaw) {
    // 如果路由没有定义meta或meta.roles，说明该路由是公开的，默认允许访问
    if (route.meta && route.meta.roles) {
        // 只要有用户的角色列表中，有一个角色在路由要求的roles数组里，就返回true
        return roles.some(role =>(route.meta?.roles as string[]).includes(role));
    }else{
        return true;
    }
}
// 2.核心方法：递归过滤异步路由表
export function generateAsyncRoutes(routes:RouteRecordRaw[],roles:string[]): RouteRecordRaw[] {
    const res: RouteRecordRaw[] =[];
    routes.forEach(route =>{
    // 浅拷贝一份路由对象，避免修改原始路由表
    const tmp= {...route};
    //如果有权限访问当前路由
    if (hasPermission(roles,tmp)) {
        // 关键：处理嵌套子路由，递归
        if (tmp.children) {
            // 递归过滤子路由，并将过滤后的结构重新赋给子路由属性
            tmp.children = generateAsyncRoutes(tmp.children,roles);
        }
        //将符合条件的路由（及其子路由）加入结果数组
        res.push(tmp);
    }
    });
    return res;
}
router.beforeEach(async(to,_from) =>{
    nProgress.start();//开启进度条
    //必须在钩子内部调用Store
    const userStore = useUserStore();

    if (userStore.token) {
        if (to.path === '/login') {
            return '/';
        }else{
            // 关键：判断是否已经获取过用户信息和权限
            if (userStore.roles.length === 0) {
                try {
                    //获取用户信息和角色
                    const {roles} = await userStore.getUserInfo();
                    //根据角色生成动态路由
                    //假设generateAsyncRoutes是过滤函数
                    const accessRoutes = generateAsyncRoutes(asyncRoutes,roles);

                    //在accessRoutes生成后，立马存入pinia
                    userStore.setRoutes(accessRoutes);
                    //动态添加到路由表
                    accessRoutes.forEach(route => {
                        router.addRoute(route);
                    });
                    router.addRoute({
                        path: '/:pathMatch(.*)*',
                        redirect: '/404'
                    })
                    return({...to,replace:true});
                    // 确保动态路由已挂载完成
                } catch (error) {
                    userStore.logout();
                    return(`/login?redirect=${to.path}`);
                }
            }else{
                return true;//已经有了权限直接过
            }
        }
    }else{
        //白名单直接进入，无token
        if (whiteList.includes(to.path)) {
            return true;
        }else{
            //否则跳到登录页
            return(`/login?redirect=${to.path}`)
        }
    }
});

router.afterEach(() =>{
    nProgress.done();
})