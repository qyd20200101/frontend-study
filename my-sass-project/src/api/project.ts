import request from "../utils/request";

// 定义数据类型(Model)

export interface ProjectItem{
    id:number;
    name: string;
    budget: number;
}

//获取项目接口数据
export const getProjectsApi = () =>{
    return request<ProjectItem>({
        url: '/api/projects',
        method: 'get'
    } as any);//主页：由于Axios类型限制，这里有时需要as any或者包装一下config
};

// 获取统计数据接口
export const getStatusApi = () =>{
    return request<{totalProjects:number;activeBudget:number}>({
        url: '/api/stats',
        method: 'get'
    } as any);
};

