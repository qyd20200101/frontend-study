// packages/shared/src/api/project.service.ts
import request from "./request.js";
/**
 * 获取资产项目列表
 */
export const getProjectsApi = (params) => {
    return request.get('/projects', { params });
};
/**
 * 获取部门列表
 */
export const getDepartmentsApi = () => {
    return request.get('/departments');
};
/**
 * 新增资产
 */
export const addProjectApi = (data) => {
    return request.post('/projects', data);
};
/**
 * 更新资产
 */
export const updateProjectApi = (data) => {
    return request.put(`/projects/${data.id}`, data);
};
/**
 * 批量删除
 */
export const batchDeleteProjectApi = (ids, username) => {
    return request.post('/projects/batch-delete', { ids, username });
};
/**
 * 资产流转 (Workflow)
 */
export const workflowTransitionApi = (id, transitionName, remark, username) => {
    return request.post(`/projects/${id}/workflow`, { transitionName, remark, username });
};
/**
 * 获取审计日志
 */
export const getAuditLogsApi = (params) => {
    return request.get('/audit-logs', { params });
};
/**
 * 获取表单 Schema
 */
export const getSchemaApi = (id) => {
    return request.get(`/schemas/${id}`);
};
/**
 * 保存表单 Schema
 */
export const saveSchemaApi = (id, data) => {
    return request.post(`/schemas/${id}`, data);
};
/**
 * 获取表单 Schema 版本历史
 */
export const getSchemaVersionsApi = (id) => {
    return request.get(`/schemas/${id}/versions`);
};
/**
 * 回滚表单 Schema
 */
export const rollbackSchemaApi = (id, versionId, username) => {
    return request.post(`/schemas/${id}/rollback`, { versionId, username });
};
/**
 * 获取看板数据
 */
export const getDashboardAnalyticsApi = () => {
    return request.get('/analytics/dashboard');
};
