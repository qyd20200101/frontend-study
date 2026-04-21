//支持逐渐类型库
export type ComponentType = 'input'| 'select'| 'radio'| 'checkbox'| 'switch'|'date';

//单个组件的通用数据结构
export interface FormComponent{
    id:string;
    type: ComponentType;
    label: string;
    field: string;
    required: boolean;
    props: Record<string,any>;
}

//表单的全局配置
export interface FormSchema {
    formId: string;
    title: string;
    labelWidth: string;
    components: FormComponent[];
}