import { request } from "../api/request";

export interface PageParams {
    page: number;
    pageSize: number;
    keyword?: string;
    category?: string;
    deptId?: number | null;
}

export interface PageResult<T> {
    list: T[];
    total: number;
}

export const getProjectsApi = (params: PageParams) =>
    request.get<PageResult<any>>("/projects/page", { params });

export const updateProjectApi = (data: Partial<any>) =>
    request({
        url: data.id ? `/projects/${data.id}` : "/projects",
        method: data.id ? "PUT" : "POST",
        data,
    });

export const batchDeleteProjectApi = (ids: number[]) =>
    request({
        url: "/projects/batch",
        method: "DELETE",
        data: { ids },
    });

export const getDepartmentsApi = () => request.get<any[]>("/departments");
