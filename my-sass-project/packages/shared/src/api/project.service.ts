// packages/shared/src/api/project.service.ts
import request from "./request.js";
import type { AssetProject } from "../types/user.js";

export interface ProjectListResponse {
  total: number;
  list: AssetProject[];
}

export interface Department {
  id: number;
  name: string;
  pid: number;
  children?: Department[];
}

export interface PageParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: string;
  deptId?: number | null;
}

/**
 * 获取资产项目列表
 */
export const getProjectsApi = (params: PageParams): Promise<ProjectListResponse> => {
  return request.get('/projects', { params });
};

/**
 * 获取部门列表
 */
export const getDepartmentsApi = (): Promise<Department[]> => {
  return request.get('/departments');
};

/**
 * 新增资产
 */
export const addProjectApi = (data: Partial<AssetProject>): Promise<AssetProject> => {
  return request.post('/projects', data);
};

/**
 * 更新资产
 */
export const updateProjectApi = (data: AssetProject): Promise<AssetProject> => {
  return request.put(`/projects/${data.id}`, data);
};

/**
 * 批量删除
 */
export const batchDeleteProjectApi = (ids: number[]): Promise<void> => {
  return request.post('/projects/batch-delete', { ids });
};
