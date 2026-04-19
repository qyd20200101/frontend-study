import request from "../utils/request";

// 定义数据类型(Model)
// 可选性冲突：status为固定值，?:可能没有值，导致页面方法调用时ts防止崩溃报错
//解决办法：去掉interface的?:检查api,mock数据
export interface ProjectItem{
    id:number;
    name: string;
    budget: number;
    status: 'active'| 'archived'| 'repair',
    category:string,
}

//获取项目接口数据
export const getProjectsApi = (params?:any) =>{
    return request<ProjectItem []>({
        url: '/projects',
        method: 'get',
        params
    } as any);//主页：由于Axios类型限制，这里有时需要as any或者包装一下config
};

// 获取统计数据接口
export const getStatusApi = () =>{
    return request<{totalProjects:number;activeBudget:number}>({
        url: '/stats',
        method: 'get'
    } as any);
};
//新增/更新项目接口
export const updateProjectApi = (data:any) =>{
    return request({
        url: '/projects/update',
        method: 'post',
        data //将修改后的副本传给后端
    })
}

