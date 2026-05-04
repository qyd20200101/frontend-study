import request from "../utils/request";
import type { Project } from "../types/asset";

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

//定义标准的分页请求参数
export interface PageParms {
    page:number;
    pageSize: number;
    keyword?:string;
    category?: string;
    deptId?:number| null;
}
//获取项目接口数据
// export const getProjectsApi = (params?:any) =>{
//     return request<Project []>({
//         url: '/projects',
//         method: 'get',
//         params
//     } as any);//主页：由于Axios类型限制，这里有时需要as any或者包装一下config
// };

// 获取统计数据接口
export const getStatusApi = () =>{
    return request<{totalProjects:number;activeBudget:number}>({
        url: '/stats',
        method: 'get'
    } as any);
};
//新增/更新项目接口
// export const updateProjectApi = (data:any) =>{
//     return request({
//         url: '/projects/update',
//         method: 'post',
//         data //将修改后的副本传给后端
//     })
// }
//定义标准的分页返回结果
export interface PageResult<T>{
   list: T[];
   total: number;
}
//改造获取列表接口：支持分页和条件过滤
export const getProjectsApi = (params: PageParms) =>{
    return request<PageResult<Project>>({
        url:'/projects/page',
        method: 'GET',
        params
    });
}

//更新/新增接口
export const updateProjectApi = (data:Partial<Project>) =>{
    return request<Project> ({
        url:data.id?`/projects/${data.id}`:'/projects',
        method: data.id? "PUT":"POST",
        data
    });
};

//新增：单挑删除接口
export const deleteProjectApi = (id: number) =>{
    return request({
        url: `/projects/${id}`,
        method: "DELETE"
    });
};

//新增：批量删除接口
export const batchDeleteProjectApi = (ids: number[]) =>{
    return request ({
        url: '/projects/batch',
        method: "DELETE",
        data: {ids} //弹窗批量删除把id数组放到Body里
    });
};

