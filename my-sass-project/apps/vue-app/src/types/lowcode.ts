//支持的组件类型库 - 扩展支持更多组件
export type ComponentType = 
  | 'input' 
  | 'textarea' 
  | 'number' 
  | 'select' 
  | 'radio' 
  | 'checkbox' 
  | 'switch' 
  | 'date' 
  | 'time'
  | 'group'
  | 'grid';

// 验证规则配置
export interface ValidationRule {
  type?: 'required' | 'email' | 'phone' | 'url' | 'pattern' | 'minLength' | 'maxLength' | 'min' | 'max' | 'custom';
  message?: string;
  pattern?: string;  // 正则表达式
  min?: number;
  max?: number;
  validator?: (value: any) => boolean;  // 自定义验证器
}

//单个组件的通用数据结构 - 扩展支持验证规则和更多配置
export interface FormComponent {
    id: string;
    type: ComponentType;
    label: string;
    field: string;
    required: boolean;
    props: Record<string, any>;
    validation?: ValidationRule[];  // 新增：复杂验证规则
    condition?: { field: string; value: string | boolean | number }; // 联动逻辑
    visible?: boolean;              // 新增：是否显示该字段
    disabled?: boolean;             // 新增：是否禁用
    help?: string;                  // 新增：帮助文本
    className?: string;             // 新增：自定义样式类
    
    // 布局特定属性
    columns?: { span: number; list: FormComponent[] }[]; // 栅栏布局的列
    list?: FormComponent[];                              // 分组布局的子组件
}

//表单的全局配置
export interface FormSchema {
    formId: string;
    title: string;
    labelWidth: string;
    components: FormComponent[];
    description?: string;           // 新增：表单描述
    submitButtonText?: string;      // 新增：提交按钮文本
    resetButtonText?: string;       // 新增：重置按钮文本
}