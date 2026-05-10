// packages/shared/src/api/project.service.ts
import request from "./request.js";

export interface ProjectListResponse {
  total: number;
  list: any[];
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
export const addProjectApi = (data: any): Promise<any> => {
  return request.post('/projects', data);
};

/**
 * 更新资产
 */
export const updateProjectApi = (data: any): Promise<any> => {
  return request.put(`/projects/${data.id}`, data);
};

/**
 * 批量删除
 */
export const batchDeleteProjectApi = (ids: number[], username?: string): Promise<void> => {
  return request.post('/projects/batch-delete', { ids, username });
};

/**
 * 资产流转 (Workflow)
 */
export const workflowTransitionApi = (id: number, transitionName: string, remark?: string, username?: string): Promise<{ success: boolean; status: string }> => {
  return request.post(`/projects/${id}/workflow`, { transitionName, remark, username });
};

/**
 * 获取审计日志
 */
export const getAuditLogsApi = (params?: { username?: string; action?: string }): Promise<any[]> => {
  return request.get('/audit-logs', { params });
};

/**
 * 获取表单 Schema
 */
export const getSchemaApi = (id: string): Promise<any> => {
  return request.get(`/schemas/${id}`);
};

/**
 * 保存表单 Schema
 */
export const saveSchemaApi = (id: string, data: { name: string; content: any; username?: string }): Promise<void> => {
  return request.post(`/schemas/${id}`, data);
};

/**
 * 获取表单 Schema 版本历史
 */
export const getSchemaVersionsApi = (id: string): Promise<any[]> => {
  return request.get(`/schemas/${id}/versions`);
};

/**
 * 回滚表单 Schema
 */
export const rollbackSchemaApi = (id: string, versionId: number, username?: string): Promise<{ success: boolean; content: any }> => {
  return request.post(`/schemas/${id}/rollback`, { versionId, username });
};

/**
 * 获取看板数据
 */
export const getDashboardAnalyticsApi = (): Promise<any> => {
  return request.get('/analytics/dashboard');
};
