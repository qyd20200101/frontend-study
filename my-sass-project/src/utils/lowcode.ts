/**
 * 低代码平台公共工具函数
 */

/**
 * 获取组件类型对应的 Element Plus 组件名称
 */
export const getElComponent = (type: string): string => {
    const map: Record<string, string> = {
        'input': 'el-input',
        'select': 'el-select',
        'switch': 'el-switch',
        'date': 'el-date-picker',
        'radio': 'el-radio-group',
        'checkbox': 'el-checkbox-group',
    };
    return map[type] || 'el-input';
};

/**
 * 获取表单组件的默认值
 */
export const getDefaultValue = (type: string): any => {
    switch (type) {
        case 'switch':
            return false;
        case 'checkbox':
        case 'select':
        case 'radio':
            return [];
        default:
            return null;
    }
};

/**
 * 验证规则触发方式映射
 */
export const getTriggerType = (type: string): string => {
    return ['input'].includes(type) ? 'blur' : 'change';
};

/**
 * 生成表单验证规则
 */
export const generateValidationRules = (components: any[]): Record<string, any> => {
    const rules: Record<string, any> = {};
    
    components.forEach(comp => {
        if (comp.required) {
            rules[comp.field] = [
                {
                    required: true,
                    message: `${comp.label}为必填项`,
                    trigger: getTriggerType(comp.type)
                }
            ];
        }
    });
    
    return rules;
};

/**
 * 初始化表单数据
 */
export const initFormData = (components: any[]): Record<string, any> => {
    const formData: Record<string, any> = {};
    
    components.forEach(comp => {
        formData[comp.field] = getDefaultValue(comp.type);
    });
    
    return formData;
};
