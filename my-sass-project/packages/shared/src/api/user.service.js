import request from "./request.js";
/*
获取所有用户列表
*/
export const getUserApi = () => {
    return request.get('/user');
};
/*
新增用户
*/
export const addUserApi = (user) => {
    return request.post('/users', user);
};
/*
更新用户消息
*/
export const updateUserApi = (user) => {
    return request.put(`/users/${user.id}`, user);
};
/*
删除用户
*/
export const deleteUserApi = (id) => {
    return request.delete(`/users/${id}`);
};
/**
 * 用户登录
 */
export const loginApi = (params) => {
    return request.post('/auth/login', params);
};
/**
 * 用户退出
 */
export const logoutApi = () => {
    return request.post('/auth/logout');
};
