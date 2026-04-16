import { defineStore } from "pinia";
import { ref,computed } from "vue";
import { loginApi,getUserInfoApi } from "../api/user";
import type { RouteRecordRaw } from "vue-router";
// import { resetRouter } from "../router/index";

//使用Setup Store覆盖
export const useUserStore = defineStore('user',() =>{
    // 1.状态（state）
    const token = ref(localStorage.getItem('token')|| '');
    const roles = ref<string[]>([]);//存储接受，如['admin]或['editor]
    const userInfo = ref<any>(null);
    
    //存储过滤后的动态路由树，用于菜单和面包屑渲染
    const menuRoutes = ref<RouteRecordRaw[]>([]);
    //2.计算属性(Getters)
    const isLogin = computed(() => !! token.value);

    //3.动作（Actions）
    const login = async(loginForm: any) =>{
    const data = await loginApi(loginForm);
    token.value = data.token;
    localStorage.setItem('token',data.token);
    };

    //设置并持久化token
    const setToken = (newToken:string) =>{
        token.value = newToken;
        localStorage.setItem('token',newToken);
    }


    //更新路由的方法
    const setRoutes = (routes: RouteRecordRaw[]) =>{
        menuRoutes.value = routes;
    }
    const getUserInfo = async () =>{
        const data = await getUserInfoApi();
        userInfo.value = data;
        roles.value = data.roles; //后端返回的角色列表
        return data;
    };

    const logout = () =>{
        localStorage.removeItem('token');
        token.value = '';
        roles.value =[];
        menuRoutes.value =[];
        userInfo.value = null;
        location.reload();
    };

    return {token,roles,userInfo,isLogin,menuRoutes,setRoutes,setToken,login,getUserInfo,logout};
});