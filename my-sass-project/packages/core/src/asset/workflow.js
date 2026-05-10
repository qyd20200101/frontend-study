export const ASSET_WORKFLOW = [
    { name: 'report_repair', from: 'active', to: 'repair', label: '发起报修' },
    { name: 'finish_repair', from: 'repair', to: 'active', label: '修复完成' },
    { name: 'scrap_asset', from: ['active', 'repair'], to: 'scrapped', label: '资产报废' },
    { name: 'reactivate', from: 'scrapped', to: 'active', label: '重新启用' },
];
export class WorkflowEngine {
    static getAvailableTransitions(currentStatus) {
        return ASSET_WORKFLOW.filter(t => {
            if (Array.isArray(t.from)) {
                return t.from.includes(currentStatus);
            }
            return t.from === currentStatus;
        });
    }
    static canTransition(currentStatus, transitionName) {
        const transition = ASSET_WORKFLOW.find(t => t.name === transitionName);
        if (!transition)
            return false;
        if (Array.isArray(transition.from)) {
            return transition.from.includes(currentStatus);
        }
        return transition.from === currentStatus;
    }
    static getTransition(name) {
        return ASSET_WORKFLOW.find(t => t.name === name);
    }
}
