// src/types/asset.ts

/**
 * 资产状态枚举（严格约束）
 */
export type AssetStatus = 'active' | 'archived' | 'repair' | 'pending' | 'scrapped';

/**
 * 资产变更日志（审计追踪）
 */
export interface AssetLog {
    time: string;
    operator: string;
    action: string;
    remark?: string;
}

/**
 * 核心领域模型：资产/项目
 * 我们在这里定义最完整的模型，包含业务逻辑所需的 deptId 和 history
 */
export interface Project {
    id: number;
    name: string;
    budget: number;
    status: AssetStatus;
    category: string;
    deptId?: number;
    history?: AssetLog[];
    [key: string]: any; // 允许索引访问，方便动态排序逻辑
}

/**
 * 统计摘要模型
 */
export interface AssetSummary {
    count: number;
    totalBudget: number;
    average: string;
}
