import request from "./request.js";
import type { SystemUser, UserQuery, LoginParams, AuthResponse } from "../types/user.js";

/*
获取所有用户列表
*/
export const getUserApi = (): Promise<SystemUser[]> => {
    return request.get('/users');
}

/*
新增用户
*/
export const addUserApi = (user: SystemUser): Promise<SystemUser> => {
    return request.post('/users', user);
};
/*
更新用户消息
*/
export const updateUserApi = (user: SystemUser): Promise<SystemUser> => {
    return request.put(`/users/${user.id}`, user);
};

/*
删除用户
*/
export const deleteUserApi = (id: number): Promise<void> => {
    return request.delete(`/users/${id}`);
};
/**
 * 用户登录
 */
export const loginApi = (params: LoginParams): Promise<AuthResponse> => {
    return request.post('/auth/login', params);
};

/**
 * 用户退出
 */
export const logoutApi = (): Promise<void> => {
    return request.post('/auth/logout');
};
