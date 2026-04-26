/**
 * 低代码平台公共工具函数 - 核心功能
 */

import { generateElValidationRules } from './validation';

import {
    ElInput,
    ElInputNumber,
    ElSelect,
    ElSwitch,
    ElDatePicker,
    ElTimePicker,
    ElRadioGroup,
    ElCheckboxGroup
} from 'element-plus';

/**
 * 获取组件类型对应的 Element Plus 组件名称
 */
export const getElComponent = (type: string): any => {
    const map: Record<string, any> = {
        'input': ElInput,
        'textarea': ElInput,
        'number': ElInputNumber,
        'select': ElSelect,
        'switch': ElSwitch,
        'date': ElDatePicker,
        'time': ElTimePicker,
        'radio': ElRadioGroup,
        'checkbox': ElCheckboxGroup,
    };
    return map[type] || ElInput;
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
        case 'number':
            return 0;
        case 'date':
        case 'time':
            return null;
        default:
            return null;
    }
};

/**
 * 验证规则触发方式映射
 */
export const getTriggerType = (type: string): string => {
    return ['input', 'textarea', 'number'].includes(type) ? 'blur' : 'change';
};

/**
 * 递归拍平嵌套的组件列表（提取 group 和 grid 内的真实组件）
 */
export const flattenComponents = (components: any[]): any[] => {
    let flat: any[] = [];
    components.forEach(comp => {
        if (comp.type === 'group' && comp.list) {
            flat = flat.concat(flattenComponents(comp.list));
        } else if (comp.type === 'grid' && comp.columns) {
            comp.columns.forEach((col: any) => {
                if (col.list) flat = flat.concat(flattenComponents(col.list));
            });
        } else if (comp.type !== 'group' && comp.type !== 'grid') {
            flat.push(comp);
        }
    });
    return flat;
};

/**
 * 生成表单验证规则 - 完整版本，支持多种规则类型
 */
export const generateValidationRules = (components: any[]): Record<string, any> => {
    return generateElValidationRules(flattenComponents(components));
};

/**
 * 初始化表单数据
 */
export const initFormData = (components: any[]): Record<string, any> => {
    const formData: Record<string, any> = {};
    const flatComps = flattenComponents(components);
    
    flatComps.forEach(comp => {
        formData[comp.field] = getDefaultValue(comp.type);
    });
    
    return formData;
};

/**
 * 获取组件的输入类型（用于input type属性）
 */
export const getInputType = (type: string): string => {
    const typeMap: Record<string, string> = {
        'input': 'text',
        'number': 'number',
        'textarea': 'textarea',
        'email': 'email',
        'phone': 'tel',
        'url': 'url',
    };
    return typeMap[type] || 'text';
};

/**
 * 格式化组件属性，用于模板生成
 */
export const formatComponentProps = (component: any): string => {
    const props: string[] = [];
    
    if (component.props?.placeholder) {
        props.push(`placeholder="${component.props.placeholder}"`);
    }
    
    if (component.props?.maxLength && (component.type === 'input' || component.type === 'textarea')) {
        props.push(`maxLength="${component.props.maxLength}"`);
    }
    
    if (component.props?.minLength && component.type === 'textarea') {
        props.push(`minLength="${component.props.minLength}"`);
    }
    
    if (component.props?.type && component.type === 'date') {
        props.push(`type="${component.props.type}"`);
    }
    
    if (component.props?.format && component.type === 'date') {
        props.push(`format="${component.props.format}"`);
    }
    
    if (component.disabled) {
        props.push(':disabled="true"');
    }
    
    return props.join(' ');
};

/**
 * 生成组件选项HTML
 */
export const generateOptionsTemplate = (component: any): string => {
    if (!component.props?.options || component.props.options.length === 0) {
        return '';
    }
    
    const optionsList = component.props.options
        .map((opt: any) => `<el-option label="${opt.label}" value="${opt.value}" />`)
        .join('\n        ');
    
    return `
        ${optionsList}`;
};

/**
 * 验证组件配置是否完整
 */
export const validateComponentConfig = (component: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!component.field) errors.push('字段名不能为空');
    if (!component.label) errors.push('标签不能为空');
    
    if ((['select', 'radio', 'checkbox'].includes(component.type)) && 
        (!component.props?.options || component.props.options.length === 0)) {
        errors.push('需要至少添加一个选项');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * 克隆组件（用于复制功能）
 */
export const cloneComponent = (component: any): any => {
    return JSON.parse(JSON.stringify(component));
};

/**
 * 检查组件是否满足显隐联动条件
 */
export const checkCondition = (condition: { field: string; value: any } | undefined, formData: Record<string, any>): boolean => {
    if (!condition || !condition.field) return true;
    const actualValue = formData[condition.field];
    // 简单比对（统一转字符串避免类型问题）
    return String(actualValue) === String(condition.value);
};
