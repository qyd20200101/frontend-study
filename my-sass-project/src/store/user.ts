import { defineStore } from "pinia";
import { ref,computed } from "vue";
import { loginApi,getUserInfoApi } from "../api/user";

//使用Setup Store覆盖
export const useUserStore = defineStore('user',() =>{
    // 1.状态（state）
    const token = ref(localStorage.getItem('token')|| '');
    const roles = ref<string[]>([]);//存储接受，如['admin]或['editor]
    const userInfo = ref<any>(null);
    
    //2.计算属性(Getters)
    const isLogin = computed(() => !! token.value);

    //3.动作（Actions）
    const login = async(loginForm: any) =>{
    const data = await loginApi(loginForm);
    token.value = data.token;
    localStorage.setItem('token',data.token);
    };

    const getUserInfo = async () =>{
        const data = await getUserInfoApi();
        userInfo.value = data;
        roles.value = data.roles; //后端返回的角色列表
        return data;
    };

    const logout = () =>{
        token.value = ' ';
        roles.value =[];
        userInfo.value = null;
        localStorage.removeItem('token');
    };

    return {token,roles,userInfo,isLogin,login,getUserInfo,logout};
});