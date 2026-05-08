// apps/server/src/mockData.ts
import type { SystemUser, AssetProject } from '@my-sass/shared';

// 1. 用户数据
export const MOCK_USERS: SystemUser[] = [
  { id: 1, username: 'admin', role: 'admin', roles: ['admin'], status: 'active' },
  { id: 2, username: 'editor', role: 'editor', roles: ['editor'], status: 'active' },
  { id: 3, username: 'viewer', role: 'viewer', roles: ['viewer'], status: 'active' }
];

// 2. 部门数据（组织架构）
export const MOCK_DEPARTMENTS = [
  { id: 1, name: '总公司', pid: 0 },
  { id: 2, name: '研发部', pid: 1 },
  { id: 3, name: '市场部', pid: 1 },
  { id: 4, name: '前端组', pid: 2 },
  { id: 5, name: '后端组', pid: 2 },
];

// 3. 资产项目数据
export const MOCK_PROJECTS: AssetProject[] = [
  { 
    id: 1, 
    name: 'MacBook Pro M3 - 研发部专用', 
    budget: 18000, 
    category: 'Hardware', 
    status: 'active',
    deptId: 4 
  },
  { 
    id: 2, 
    name: '阿里云服务器集群 (H6)', 
    budget: 150000, 
    category: 'Infrastructure', 
    status: 'active',
    deptId: 5 
  },
  { 
    id: 3, 
    name: 'JetBrains 全家桶年度授权', 
    budget: 5000, 
    category: 'Software', 
    status: 'active',
    deptId: 2 
  },
  { 
    id: 4, 
    name: '办公楼中央空调维护', 
    budget: 2500, 
    category: 'Maintenance', 
    status: 'repair',
    deptId: 1 
  },
  { 
    id: 5, 
    name: '设计组绘图平板', 
    budget: 8500, 
    category: 'Hardware', 
    status: 'active',
    deptId: 3 
  }
];
