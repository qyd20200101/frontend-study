/**
 * 表单验证规则生成器
 * 支持多种验证规则类型
 */

export interface ValidationRule {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    trigger?: 'blur' | 'change';
}

export interface ComponentValidation extends ValidationRule {
    field: string;
    label: string;
    type: string;
}

/**
 * 生成 Element Plus 验证规则
 */
export const generateElValidationRules = (validations: ComponentValidation[]): Record<string, any> => {
    const rules: Record<string, any> = {};

    validations.forEach(v => {
        const rulesList: any[] = [];

        // 必填项
        if (v.required) {
            rulesList.push({
                required: true,
                message: v.message || `${v.label}为必填项`,
                trigger: v.trigger || getTriggerByType(v.type)
            });
        }

        // 最小长度
        if (v.min !== undefined && v.type === 'input') {
            rulesList.push({
                min: v.min,
                message: `${v.label}至少${v.min}个字符`,
                trigger: 'blur'
            });
        }

        // 最大长度
        if (v.max !== undefined && v.type === 'input') {
            rulesList.push({
                max: v.max,
                message: `${v.label}最多${v.max}个字符`,
                trigger: 'blur'
            });
        }

        // 正则验证
        if (v.pattern) {
            rulesList.push({
                pattern: new RegExp(v.pattern),
                message: v.message || `${v.label}格式不正确`,
                trigger: 'blur'
            });
        }

        if (rulesList.length > 0) {
            rules[v.field] = rulesList;
        }
    });

    return rules;
};

/**
 * 根据组件类型获取触发事件
 */
export const getTriggerByType = (type: string): 'blur' | 'change' => {
    return ['input'].includes(type) ? 'blur' : 'change';
};

/**
 * 生成代码形式的验证规则
 */
export const generateValidationRulesCode = (components: any[]): string => {
    let code = 'const formRules = {\n';

    components.forEach(comp => {
        const rules: any[] = [];

        if (comp.required) {
            const trigger = getTriggerByType(comp.type);
            rules.push(`  { required: true, message: '${comp.label}为必填项', trigger: '${trigger}' }`);
        }

        if (rules.length > 0) {
            code += `  ${comp.field}: [\n${rules.join(',\n')}\n  ],\n`;
        }
    });

    code += '};\n';

    return code;
};
