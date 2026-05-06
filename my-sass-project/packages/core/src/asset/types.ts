export type AssetStatus = "active" | "archived" | "repair" | "pending" | "scrapped";

export interface AssetHistory {
    time: string;
    operator: string;
    action: string;
    remark?: string;
}

export interface AssetProject {
    id: number;
    name: string;
    budget: number;
    status: AssetStatus;
    category: string;
    deptId?: number | null;
    history?: AssetHistory[];
}

export interface TreeNode {
    id: number;
    pid: number;
    name: string;
    children?: TreeNode[];
}
