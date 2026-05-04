import type { Directive } from "vue";
import { useUserStore } from "../store/user";

export const permission: Directive ={
    //当被绑定的元素插入到DOM中
    mounted(el,binding){
        const{value} = binding;
        const userStore = useUserStore();
        const roles = userStore.roles;

        if (value && Array.isArray(value) && value.length>0) {
            //判定用户是否拥有指令要求的角色
            const hasPermission = roles.some(role => value.includes(role));

            //如果没有权限，直接从DOM中移除该元素
            if (!hasPermission) {
                el.parentNode && el.parentNode.removeChild(el);
            }
        }else{
            throw new Error(`使用方式错误！请参考：v-permission=['admin','editor']`)
        }
    }
};