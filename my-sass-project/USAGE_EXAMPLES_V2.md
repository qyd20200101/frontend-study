# 低代码表单系统 - 使用示例 (v2.0)

## 示例一: 完整的用户注册表单

包含所有新增的组件类型和验证规则。

```typescript
import { FormSchema } from '@/types/lowcode';

export const userRegistrationForm: FormSchema = {
  formId: 'user_registration_form',
  title: '用户注册表单',
  description: '请填写以下信息完成注册',
  labelWidth: '120px',
  submitButtonText: '注册',
  resetButtonText: '清空',
  components: [
    // 单行文本 - 用户名
    {
      id: 'input_username',
      type: 'input',
      label: '用户名',
      field: 'username',
      required: true,
      props: {
        placeholder: '请输入用户名，4-20个字符',
        minLength: 4,
        maxLength: 20
      },
      validation: [
        { 
          type: 'minLength', 
          min: 4, 
          message: '用户名至少 4 个字符' 
        }
      ],
      help: '用户名将作为您的唯一标识'
    },

    // 单行文本 - 邮箱
    {
      id: 'input_email',
      type: 'input',
      label: '邮箱地址',
      field: 'email',
      required: true,
      props: {
        placeholder: 'example@email.com'
      },
      validation: [
        { type: 'email', message: '请输入有效的邮箱地址' }
      ]
    },

    // 单行文本 - 电话
    {
      id: 'input_phone',
      type: 'input',
      label: '手机号',
      field: 'phone',
      required: true,
      props: {
        placeholder: '请输入11位手机号'
      },
      validation: [
        { type: 'phone', message: '请输入正确的手机号' }
      ]
    },

    // 多行文本 - 个人简介 (新增)
    {
      id: 'textarea_bio',
      type: 'textarea',
      label: '个人简介',
      field: 'bio',
      required: false,
      props: {
        placeholder: '请输入个人简介（可选）',
        rows: 4,
        maxLength: 500
      },
      validation: [
        { 
          type: 'maxLength', 
          max: 500, 
          message: '简介最多 500 个字符' 
        }
      ]
    },

    // 数字输入 - 年龄 (新增)
    {
      id: 'number_age',
      type: 'number',
      label: '年龄',
      field: 'age',
      required: true,
      props: {
        min: 18,
        max: 100,
        step: 1,
        placeholder: '请输入年龄'
      },
      validation: [
        { 
          type: 'min', 
          min: 18, 
          message: '年龄必须大于 18 岁' 
        }
      ]
    },

    // 下拉选择 - 性别
    {
      id: 'select_gender',
      type: 'select',
      label: '性别',
      field: 'gender',
      required: true,
      props: {
        options: [
          { label: '男', value: 'male' },
          { label: '女', value: 'female' },
          { label: '其他', value: 'other' }
        ]
      }
    },

    // 日期选择 - 出生日期
    {
      id: 'date_birthday',
      type: 'date',
      label: '出生日期',
      field: 'birthday',
      required: true,
      props: {
        type: 'date',
        format: 'YYYY-MM-DD'
      }
    },

    // 时间选择 - 注册时间 (新增)
    {
      id: 'time_register',
      type: 'time',
      label: '参考报到时间',
      field: 'registerTime',
      required: true,
      props: {
        format: 'HH:mm',
        isRange: false
      }
    },

    // 复选框 - 兴趣爱好
    {
      id: 'checkbox_interests',
      type: 'checkbox',
      label: '兴趣爱好',
      field: 'interests',
      required: false,
      props: {
        options: [
          { label: '阅读', value: 'reading' },
          { label: '运动', value: 'sports' },
          { label: '游戏', value: 'gaming' },
          { label: '旅游', value: 'travel' }
        ]
      }
    },

    // 开关 - 是否同意协议
    {
      id: 'switch_agree',
      type: 'switch',
      label: '同意用户协议',
      field: 'agreeTerms',
      required: true,
      props: {
        activeText: '已同意',
        inactiveText: '未同意'
      }
    }
  ]
};
```

## 示例二: 商品发布表单

展示如何使用数字输入和文本域。

```typescript
export const productPublishForm: FormSchema = {
  formId: 'product_publish_form',
  title: '商品发布',
  description: '请填写商品信息',
  labelWidth: '100px',
  submitButtonText: '发布商品',
  components: [
    {
      id: 'input_productName',
      type: 'input',
      label: '商品名称',
      field: 'productName',
      required: true,
      props: { maxLength: 50 }
    },
    
    {
      id: 'number_price',
      type: 'number',
      label: '价格（元）',
      field: 'price',
      required: true,
      props: {
        min: 0,
        max: 999999,
        step: 0.01,
        placeholder: '请输入商品价格'
      },
      validation: [
        { type: 'min', min: 0.01, message: '价格必须大于 0' }
      ]
    },

    {
      id: 'number_stock',
      type: 'number',
      label: '库存数量',
      field: 'stock',
      required: true,
      props: {
        min: 0,
        max: 99999,
        step: 1
      }
    },

    {
      id: 'select_category',
      type: 'select',
      label: '商品分类',
      field: 'category',
      required: true,
      props: {
        options: [
          { label: '服装', value: 'clothing' },
          { label: '食品', value: 'food' },
          { label: '电子', value: 'electronics' },
          { label: '其他', value: 'other' }
        ]
      }
    },

    {
      id: 'textarea_description',
      type: 'textarea',
      label: '商品描述',
      field: 'description',
      required: true,
      props: {
        placeholder: '请输入详细的商品描述',
        rows: 6,
        maxLength: 2000
      }
    },

    {
      id: 'date_publishDate',
      type: 'date',
      label: '发布日期',
      field: 'publishDate',
      required: true,
      props: {
        type: 'date',
        format: 'YYYY-MM-DD'
      }
    },

    {
      id: 'switch_isRecommend',
      type: 'switch',
      label: '推荐商品',
      field: 'isRecommended',
      required: false,
      props: {
        activeText: '是',
        inactiveText: '否'
      }
    }
  ]
};
```

## 示例三: 工作时间配置表单

展示新增的时间选择器用法。

```typescript
export const workScheduleForm: FormSchema = {
  formId: 'work_schedule_form',
  title: '工作时间配置',
  labelWidth: '150px',
  components: [
    {
      id: 'select_department',
      type: 'select',
      label: '部门',
      field: 'department',
      required: true,
      props: {
        options: [
          { label: '研发部', value: 'rd' },
          { label: '销售部', value: 'sales' },
          { label: '运营部', value: 'operations' }
        ]
      }
    },

    {
      id: 'time_startTime',
      type: 'time',
      label: '上班时间',
      field: 'startTime',
      required: true,
      props: {
        format: 'HH:mm',
        isRange: false
      }
    },

    {
      id: 'time_endTime',
      type: 'time',
      label: '下班时间',
      field: 'endTime',
      required: true,
      props: {
        format: 'HH:mm',
        isRange: false
      }
    },

    {
      id: 'textarea_notes',
      type: 'textarea',
      label: '特殊说明',
      field: 'notes',
      required: false,
      props: {
        rows: 3,
        maxLength: 500,
        placeholder: '如有特殊工作时间安排，请在此说明'
      }
    }
  ]
};
```

## 示例四: 调查问卷表单

展示使用新验证规则的问卷。

```typescript
export const surveyForm: FormSchema = {
  formId: 'survey_form',
  title: '用户满意度调查',
  labelWidth: '140px',
  components: [
    {
      id: 'input_name',
      type: 'input',
      label: '您的姓名',
      field: 'name',
      required: true,
      props: { maxLength: 50 }
    },

    {
      id: 'input_email',
      type: 'input',
      label: '邮箱地址',
      field: 'email',
      required: true,
      validation: [
        { type: 'email', message: '请输入有效的邮箱' }
      ]
    },

    {
      id: 'input_company',
      type: 'input',
      label: '公司名称',
      field: 'company',
      required: false,
      props: { maxLength: 100 }
    },

    {
      id: 'radio_satisfaction',
      type: 'radio',
      label: '您对产品的满意度评分',
      field: 'satisfactionScore',
      required: true,
      props: {
        options: [
          { label: '非常满意 (5分)', value: '5' },
          { label: '满意 (4分)', value: '4' },
          { label: '一般 (3分)', value: '3' },
          { label: '不满意 (2分)', value: '2' },
          { label: '很不满意 (1分)', value: '1' }
        ]
      }
    },

    {
      id: 'checkbox_improvements',
      type: 'checkbox',
      label: '希望改进的方面',
      field: 'improvementAreas',
      required: false,
      props: {
        options: [
          { label: '功能完整性', value: 'features' },
          { label: '用户界面', value: 'ui' },
          { label: '性能速度', value: 'performance' },
          { label: '文档支持', value: 'documentation' },
          { label: '客户服务', value: 'support' }
        ]
      }
    },

    {
      id: 'textarea_feedback',
      type: 'textarea',
      label: '您的建议和反馈',
      field: 'feedback',
      required: false,
      props: {
        rows: 5,
        maxLength: 1000,
        placeholder: '请输入您的宝贵建议'
      },
      help: '您的反馈对我们改进产品非常重要'
    },

    {
      id: 'switch_subscribe',
      type: 'switch',
      label: '订阅产品更新',
      field: 'subscribeUpdates',
      required: false,
      props: {
        activeText: '是',
        inactiveText: '否'
      }
    }
  ]
};
```

## 示例五: 快速验证规则使用

使用预定义验证规则模板。

```typescript
import { getValidationTemplate } from '@/utils/validation';

// 创建带验证的组件
const emailComponent = {
  type: 'input',
  field: 'email',
  label: '邮箱',
  required: true,
  props: {},
  validation: getValidationTemplate('email')
};

const phoneComponent = {
  type: 'input',
  field: 'phone',
  label: '手机号',
  required: true,
  props: {},
  validation: getValidationTemplate('phone')
};

const idCardComponent = {
  type: 'input',
  field: 'idCard',
  label: '身份证号',
  required: true,
  props: {},
  validation: getValidationTemplate('idcard')
};
```

## 示例六: 在代码中动态生成表单

```typescript
import { 
  getDefaultValue, 
  initFormData,
  generateValidationRules 
} from '@/utils/lowcode';

const schema = userRegistrationForm;

// 初始化表单数据
const formData = initFormData(schema.components);
console.log(formData);
// 输出: { username: null, email: null, phone: null, bio: null, ... }

// 生成验证规则
const rules = generateValidationRules(schema.components);
console.log(rules);
// 输出: { email: [...], phone: [...], ... }

// 表单提交
const handleSubmit = async (formRef: any) => {
  try {
    await formRef.validate();
    console.log('验证通过，数据:', formData);
    // 提交到服务器
  } catch (error) {
    console.log('验证失败');
  }
};
```

---

## 💡 最佳实践

### 1. 组件类型选择

- 使用 **input** 处理: 用户名、标题、短文本
- 使用 **textarea** 处理: 描述、建议、长文本
- 使用 **number** 处理: 价格、年龄、数量
- 使用 **date** 处理: 日期选择、时间范围
- 使用 **time** 处理: 工作时间、打卡时间
- 使用 **select/radio/checkbox** 处理: 分类、选项

### 2. 验证规则设计

```typescript
// ✅ 好的做法: 清晰、具体的验证
validation: [
  { type: 'email', message: '请输入有效的邮箱地址' },
  { type: 'maxLength', max: 100, message: '邮箱最多 100 个字符' }
]

// ❌ 避免: 模糊或冗余的验证
validation: [
  { type: 'required', message: '必填' },
  { type: 'required', message: '邮箱必填' }
]
```

### 3. 属性配置

```typescript
// 为输入组件设置合理的 maxLength
{ type: 'input', props: { maxLength: 50 } }

// 为数字组件设置范围
{ type: 'number', props: { min: 0, max: 1000 } }

// 为文本域设置行数
{ type: 'textarea', props: { rows: 4 } }
```

### 4. 表单分组组织

虽然暂不支持表单分组，但可以在表单描述中说明不同的部分:

```typescript
{
  title: '用户信息',
  description: '第一步：基本信息'
  // ...
}
```

---

**版本**: 2.0  
**最后更新**: 2026-04-23
