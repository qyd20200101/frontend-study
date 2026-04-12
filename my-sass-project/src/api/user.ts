import request from "../utils/request";

/*
定义这么多interface：（七月驱动开发）
1.全链路类型提示：在API定义UserInfo和LoginResult后续在pinia（userstore）中调用时，
返回的data或自动拥有roles,username等属性补全,减少拼写错误的Bug
2.后端解耦：后端如果修改字段名，自需要在interface进行修改，
整个项目调用接口的位置都会报错，便于查找修改
3.RBAC核心：在权限系统中，roles数组时路由守卫和权限指令的源头，在API层明确类型
可以确保权限判断逻辑的严谨
*/ 
//登录请求参数
export interface LoginData {
    username: string;
    password?: string; //可选，模拟用
}

//登录成功返回的数据
export interface LoginResult{
    token: string;
}

//用户详细信息（包含权限角色）
export interface UserInfo{
    id:number;
    username: string;
    avatar: string;
    roles: string[];
}

// 编写API接口
export const loginApi = (data: LoginData) =>{
    return request<LoginResult>({
        url: '/login',
        method: 'post',
        data
    })
}

//获取当前用户信息接口
export const getUserInfoApi = () =>{
    return request<UserInfo> ({
        url: '/user/info',
        method: 'get'
    });
};
