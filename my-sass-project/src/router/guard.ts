import { useUserStore } from "../store/user";
import router, { asyncRoutes } from "../router/index";
import type { RouteRecordRaw } from "vue-router";
import nProgress from "nprogress";
import "nprogress/nprogress.css";

const whiteList = ["/login", "/404"];

/**
 * 核心：导出 setupRouterGuard 函数供 main.ts 调用
 * 解决 Pinia 还没挂载就执行守卫导致的白屏/报错问题
 */
export function setupRouterGuard() {
  
  router.beforeEach(async (to, _from, next) => {
    nProgress.start();
    const userStore = useUserStore();
    
    // 1. 处理 Token（去除空格干扰）
    const token = userStore.token ? userStore.token.trim() : '';
    const hasToken = !!token;

    // 2. 情况 A：有 Token
    if (hasToken) {
      if (to.path === "/login") {
        next({ path: "/" });
        nProgress.done();
      } else {
        // 检查 Pinia 中是否有角色信息
        const hasRoles = userStore.roles && userStore.roles.length > 0;
        
        if (hasRoles) {
          // 有角色，说明路由已加载，直接放行
          next();
        } else {
          // 【关键】没有角色：通常发生在 F5 刷新页面时
          try {
            // 1) 重新获取用户信息（包含角色）
            const { roles } = await userStore.getUserInfo();
            
            // 2) 根据角色过滤出动态路由
            const accessRoutes = generateAsyncRoutes(asyncRoutes, roles);
            
            // 3) 将过滤后的路由动态添加到路由表
            accessRoutes.forEach((route) => {
              router.addRoute(route);
            });

            // 4) 重要：把 404 捕获路由加在最后，防止刷新时先匹配到 404
            router.addRoute({ 
              path: "/:pathMatch(.*)*", 
              redirect: "/404", 
              name: 'Any' 
            });

            // 5) 更新 Pinia 里的菜单路由（用于侧边栏显示）
            userStore.setRoutes(accessRoutes);

            // 6) 【核心修正】中断当前导航，改用新路由表重新匹配
            // replace: true 确保刷新后不产生多余的历史记录
            next({ ...to, replace: true });
            
          } catch (error) {
            console.error('获取用户信息失败:', error);
            userStore.logout();
            next(`/login?redirect=${to.path}`);
            nProgress.done();
          }
        }
      }
    } else {
      // 3. 情况 B：没有 Token
      if (whiteList.includes(to.path)) {
        // 在白名单里，直接放行
        next();
      } else {
        // 不在白名单，强制跳回登录
        next(`/login?redirect=${to.path}`);
        nProgress.done();
      }
    }
  });

  router.afterEach(() => {
    nProgress.done();
  });
}

/**
 * 辅助函数：判断是否有权限访问该路由
 */
function hasPermission(roles: string[], route: RouteRecordRaw) {
  if (route.meta && route.meta.roles) {
    return roles.some((role) => (route.meta?.roles as string[]).includes(role));
  }
  return true;
}

/**
 * 辅助函数：递归生成可访问的动态路由表
 */
export function generateAsyncRoutes(
  routes: RouteRecordRaw[],
  roles: string[]
): RouteRecordRaw[] {
  const res: RouteRecordRaw[] = [];
  routes.forEach((route) => {
    const tmp = { ...route };
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = generateAsyncRoutes(tmp.children, roles);
      }
      res.push(tmp);
    }
  });
  return res;
}

router.afterEach(() => {
  nProgress.done();
});
