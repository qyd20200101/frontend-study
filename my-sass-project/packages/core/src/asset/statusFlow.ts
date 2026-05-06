import type { AssetProject, AssetStatus } from "./types";

export function transitionStatus(item: AssetProject, nextStatus: AssetStatus, operator = "系统管理员") {
    const oldStatus = item.status;
    item.status = nextStatus;
    if (!item.history) item.history = [];
    item.history.unshift({
        time: new Date().toLocaleString(),
        operator,
        action: `状态变更: ${oldStatus} -> ${nextStatus}`,
        remark: "业务流转",
    });
    return item;
}

export function createRepair(item: AssetProject, reason: string, operator = "Admin") {
    item.status = "repair";
    if (!item.history) item.history = [];
    item.history.unshift({
        time: new Date().toLocaleString(),
        operator,
        action: "发起报修",
        remark: reason,
    });
    return item;
}
