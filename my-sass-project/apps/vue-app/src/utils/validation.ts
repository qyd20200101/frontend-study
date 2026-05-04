/**
 * 表单验证规则生成器
 * 支持多种验证规则类型：必填、邮箱、电话、URL、正则、长度、数值范围、自定义
 */

export interface ValidationRule {
    type?: 'required' | 'email' | 'phone' | 'url' | 'pattern' | 'minLength' | 'maxLength' | 'min' | 'max' | 'custom';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    trigger?: 'blur' | 'change';
}



// 常用正则表达式
const PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^1[3-9]\d{9}$/,
    url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    zipcode: /^\d{5,6}$/,
    idcard: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
};

/**
 * 生成 Element Plus 验证规则
 */
export const generateElValidationRules = (components: any[]): Record<string, any> => {
    const rules: Record<string, any> = {};

    components.forEach(comp => {
        const rulesList: any[] = [];

        // 必填项
        if (comp.required) {
            rulesList.push({
                required: true,
                message: `${comp.label}为必填项`,
                trigger: getTriggerByType(comp.type)
            });
        }

        // 处理自定义验证规则
        if (comp.validation && Array.isArray(comp.validation)) {
            comp.validation.forEach((rule: ValidationRule) => {
                const validationRule = buildValidationRule(rule, comp);
                if (validationRule) {
                    rulesList.push(validationRule);
                }
            });
        }

        // 基于组件类型的默认验证
        if (comp.props) {
            // 输入框长度限制
            if (comp.type === 'input' || comp.type === 'textarea') {
                if (comp.props.minLength) {
                    rulesList.push({
                        min: comp.props.minLength,
                        message: `${comp.label}至少${comp.props.minLength}个字符`,
                        trigger: 'blur'
                    });
                }
                if (comp.props.maxLength) {
                    rulesList.push({
                        max: comp.props.maxLength,
                        message: `${comp.label}最多${comp.props.maxLength}个字符`,
                        trigger: 'blur'
                    });
                }
            }
            // 数字范围限制
            if (comp.type === 'number') {
                if (comp.props.min !== undefined) {
                    rulesList.push({
                        min: comp.props.min,
                        type: 'number',
                        message: `${comp.label}最小值为${comp.props.min}`,
                        trigger: 'blur'
                    });
                }
                if (comp.props.max !== undefined) {
                    rulesList.push({
                        max: comp.props.max,
                        type: 'number',
                        message: `${comp.label}最大值为${comp.props.max}`,
                        trigger: 'blur'
                    });
                }
            }
        }

        if (rulesList.length > 0) {
            rules[comp.field] = rulesList;
        }
    });

    return rules;
};

/**
 * 根据类型构建单个验证规则
 */
const buildValidationRule = (rule: ValidationRule, comp: any): any => {
    const trigger = getTriggerByType(comp.type);

    switch (rule.type) {
        case 'email':
            return {
                type: 'email',
                message: rule.message || `${comp.label}邮箱格式不正确`,
                trigger
            };
        case 'phone':
            return {
                pattern: PATTERNS.phone,
                message: rule.message || `${comp.label}手机号格式不正确`,
                trigger
            };
        case 'url':
            return {
                type: 'url',
                message: rule.message || `${comp.label}URL格式不正确`,
                trigger
            };
        case 'pattern':
            if (!rule.pattern) return null;
            return {
                pattern: new RegExp(rule.pattern),
                message: rule.message || `${comp.label}格式不正确`,
                trigger
            };
        case 'minLength':
            return {
                min: rule.min,
                message: rule.message || `${comp.label}至少${rule.min}个字符`,
                trigger
            };
        case 'maxLength':
            return {
                max: rule.max,
                message: rule.message || `${comp.label}最多${rule.max}个字符`,
                trigger
            };
        case 'min':
            return {
                min: rule.min,
                type: 'number',
                message: rule.message || `${comp.label}最小值为${rule.min}`,
                trigger
            };
        case 'max':
            return {
                max: rule.max,
                type: 'number',
                message: rule.message || `${comp.label}最大值为${rule.max}`,
                trigger
            };
        default:
            return null;
    }
};

/**
 * 根据组件类型获取触发事件
 */
export const getTriggerByType = (type: string): 'blur' | 'change' => {
    return ['input', 'textarea', 'number'].includes(type) ? 'blur' : 'change';
};

/**
 * 生成代码形式的验证规则
 */
export const generateValidationRulesCode = (components: any[]): string => {
    let code = 'const formRules = {\n';

    components.forEach(comp => {
        const rules = generateElValidationRules([comp])[comp.field];
        
        if (rules && rules.length > 0) {
            code += `  ${comp.field}: [\n`;
            rules.forEach((rule: any) => {
                let ruleStr = '    { ';
                if (rule.required) ruleStr += `required: true, `;
                if (rule.type) ruleStr += `type: '${rule.type}', `;
                if (rule.min !== undefined) ruleStr += `min: ${rule.min}, `;
                if (rule.max !== undefined) ruleStr += `max: ${rule.max}, `;
                if (rule.pattern) ruleStr += `pattern: /${rule.pattern}/, `;
                ruleStr += `message: '${rule.message}', trigger: '${rule.trigger}' }`;
                code += ruleStr + ',\n';
            });
            code += '  ],\n';
        }
    });

    code += '};\n';

    return code;
};

/**
 * 获取预定义的验证规则模板
 */
export const getValidationTemplate = (type: string): ValidationRule[] => {
    const templates: Record<string, ValidationRule[]> = {
        email: [
            { type: 'required', message: '邮箱不能为空' },
            { type: 'email', message: '请输入正确的邮箱格式' }
        ],
        phone: [
            { type: 'required', message: '手机号不能为空' },
            { type: 'phone', message: '请输入正确的手机号' }
        ],
        url: [
            { type: 'required', message: 'URL不能为空' },
            { type: 'url', message: '请输入正确的URL' }
        ],
        idcard: [
            { type: 'required', message: '身份证号不能为空' },
            { type: 'pattern', pattern: PATTERNS.idcard.source, message: '请输入正确的身份证号' }
        ],
        zipcode: [
            { type: 'required', message: '邮编不能为空' },
            { type: 'pattern', pattern: PATTERNS.zipcode.source, message: '请输入5-6位邮编' }
        ]
    };
    return templates[type] || [];
};
