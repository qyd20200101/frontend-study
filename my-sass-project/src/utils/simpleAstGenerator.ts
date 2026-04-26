/**
 * 简化的 AST 代码生成器实现
 * 可直接集成到项目中
 */

import type { FormComponent } from '../types/lowcode';

/**
 * 简单的 AST 代码生成器 - 无外部依赖版本
 */
export class SimpleASTGenerator {
  /**
   * 生成完整的 Vue 组件代码
   */
  static generateComponent(components: FormComponent[]): string {
    const template = this.generateTemplate(components);
    const script = this.generateScript(components);
    const style = this.generateStyle();

    let code = `<template>\n${template}</template>\n\n`;
    code += `<script setup>\n${script}</script>\n\n`;
    code += `<style scoped>\n${style}</style>`;

    return code;
  }

  /**
   * 生成 Template 部分
   */
  private static generateTemplate(components: FormComponent[]): string {
    const indent = (level: number) => '  '.repeat(level);
    let template = '';

    template += indent(1) + '<div class="form-wrapper">\n';
    template += indent(2) + '<el-form\n';
    template += indent(3) + 'ref="formRef"\n';
    template += indent(3) + ':model="formData"\n';
    template += indent(3) + ':rules="formRules"\n';
    template += indent(3) + 'label-width="100px"\n';
    template += indent(3) + 'label-position="top"\n';
    template += indent(2) + '>\n';

    // 生成每个表单项
    components.forEach((comp) => {
      template += this.generateItem(comp, 3);
    });

    // 生成操作按钮
    template += indent(3) + '<el-form-item>\n';
    template += indent(4) + '<el-button type="primary" @click="handleSubmit">提交</el-button>\n';
    template += indent(4) + '<el-button @click="handleReset">重置</el-button>\n';
    template += indent(3) + '</el-form-item>\n';

    template += indent(2) + '</el-form>\n';
    template += indent(1) + '</div>';

    return template;
  }

  private static generateItem(comp: FormComponent, baseIndentLevel: number): string {
    if (comp.type === 'group') {
      return this.generateGroupItem(comp, baseIndentLevel);
    } else if (comp.type === 'grid') {
      return this.generateGridItem(comp, baseIndentLevel);
    } else {
      return this.generateFormItem(comp, baseIndentLevel);
    }
  }

  private static generateGroupItem(comp: FormComponent, baseIndentLevel: number = 3): string {
    const indent = (level: number) => '  '.repeat(level);
    let item = indent(baseIndentLevel) + `<div class="form-group">\n`;
    item += indent(baseIndentLevel + 1) + `<div class="group-title">${this.escapeString(comp.label)}</div>\n`;
    if (comp.list) {
      comp.list.forEach(child => {
        item += this.generateItem(child, baseIndentLevel + 1);
      });
    }
    item += indent(baseIndentLevel) + `</div>\n`;
    return item;
  }

  private static generateGridItem(comp: FormComponent, baseIndentLevel: number = 3): string {
    const indent = (level: number) => '  '.repeat(level);
    let item = indent(baseIndentLevel) + `<el-row :gutter="20">\n`;
    if (comp.columns) {
      comp.columns.forEach(col => {
        item += indent(baseIndentLevel + 1) + `<el-col :span="${col.span}">\n`;
        if (col.list) {
          col.list.forEach(child => {
            item += this.generateItem(child, baseIndentLevel + 2);
          });
        }
        item += indent(baseIndentLevel + 1) + `</el-col>\n`;
      });
    }
    item += indent(baseIndentLevel) + `</el-row>\n`;
    return item;
  }

  /**
   * 生成单个表单项
   */
  private static generateFormItem(comp: FormComponent, baseIndentLevel: number = 3): string {
    const indent = (level: number) => '  '.repeat(level);
    const componentName = this.getElComponent(comp.type);

    let item = indent(baseIndentLevel) + `<el-form-item label="${this.escapeString(comp.label)}" prop="${comp.field}">\n`;
    item += indent(baseIndentLevel + 1) + `<${componentName}\n`;
    item += indent(baseIndentLevel + 2) + `v-model="formData.${comp.field}"\n`;

    if (comp.props?.placeholder) {
      item += indent(baseIndentLevel + 2) + `placeholder="${this.escapeString(comp.props.placeholder)}"\n`;
    }

    // 为 select/radio/checkbox 添加 options 属性
    if (['select', 'radio', 'checkbox'].includes(comp.type)) {
      item += indent(baseIndentLevel + 2) + `:options="options.${comp.field}"\n`;
    }

    item += indent(baseIndentLevel + 2) + 'style="width: 100%"\n';
    item += indent(baseIndentLevel + 1) + `/>\n`;
    item += indent(baseIndentLevel) + '</el-form-item>\n';

    return item;
  }

  private static flattenComponents(components: FormComponent[]): FormComponent[] {
    let flat: FormComponent[] = [];
    components.forEach(comp => {
      if (comp.type === 'group' && comp.list) {
        flat = flat.concat(this.flattenComponents(comp.list));
      } else if (comp.type === 'grid' && comp.columns) {
        comp.columns.forEach(col => {
          if (col.list) flat = flat.concat(this.flattenComponents(col.list));
        });
      } else if (comp.type !== 'group' && comp.type !== 'grid') {
        flat.push(comp);
      }
    });
    return flat;
  }

  /**
   * 生成 Script Setup 部分
   */
  private static generateScript(components: FormComponent[]): string {
    let script = '';
    const flatComponents = this.flattenComponents(components);

    // 导入声明
    script += "import { ref } from 'vue';\n";
    script += "import { ElMessage } from 'element-plus';\n\n";

    // formRef
    script += 'const formRef = ref(null);\n\n';

    // formData
    script += 'const formData = ref({\n';
    flatComponents.forEach((comp) => {
      const defaultValue = this.getDefaultValue(comp.type);
      script += `  ${comp.field}: ${defaultValue},\n`;
    });
    script += '});\n\n';

    // options（仅在有 select/radio/checkbox 时生成）
    const hasOptionsComponent = flatComponents.some((c) =>
      ['select', 'radio', 'checkbox'].includes(c.type)
    );

    if (hasOptionsComponent) {
      script += 'const options = ref({\n';
      flatComponents
        .filter((c) => ['select', 'radio', 'checkbox'].includes(c.type))
        .forEach((comp) => {
          script += `  ${comp.field}: [],\n`;
        });
      script += '});\n\n';
    }

    // formRules
    script += 'const formRules = ref({\n';
    flatComponents.forEach((comp) => {
      if (comp.required) {
        const trigger = ['input'].includes(comp.type) ? 'blur' : 'change';
        script += `  ${comp.field}: [\n`;
        script += `    {\n`;
        script += `      required: true,\n`;
        script += `      message: '${this.escapeString(comp.label)}为必填项',\n`;
        script += `      trigger: '${trigger}',\n`;
        script += `    },\n`;
        script += `  ],\n`;
      }
    });
    script += '});\n\n';

    // 提交处理函数
    script += 'const handleSubmit = async () => {\n';
    script += '  if (!formRef.value) return;\n';
    script += '  try {\n';
    script += '    await formRef.value.validate();\n';
    script += "    console.log('表单数据:', formData.value);\n";
    script += "    ElMessage.success('提交成功');\n";
    script += '  } catch (error) {\n';
    script += "    ElMessage.warning('请检查表单填写');\n";
    script += '  }\n';
    script += '};\n\n';

    // 重置函数
    script += 'const handleReset = () => {\n';
    script += '  formRef.value?.resetFields();\n';
    script += '};\n';

    return script;
  }

  /**
   * 生成 Style 部分
   */
  private static generateStyle(): string {
    return `.form-wrapper {
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}
.form-group {
  margin-bottom: 24px;
  padding: 24px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.02);
  transition: box-shadow 0.3s;
}
.form-group:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.06);
  border-color: #dcdfe6;
}
.group-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  color: #303133;
  display: flex;
  align-items: center;
}
.group-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background-color: #409eff;
  margin-right: 10px;
  border-radius: 2px;
}`;
  }

  /**
   * 获取 Element Plus 组件名称
   */
  private static getElComponent(type: string): string {
    const map: Record<string, string> = {
      input: 'el-input',
      select: 'el-select',
      switch: 'el-switch',
      date: 'el-date-picker',
      radio: 'el-radio-group',
      checkbox: 'el-checkbox-group',
    };
    return map[type] || 'el-input';
  }

  /**
   * 获取组件默认值
   */
  private static getDefaultValue(type: string): string {
    switch (type) {
      case 'switch':
        return 'false';
      case 'checkbox':
      case 'select':
      case 'radio':
        return '[]';
      default:
        return 'null';
    }
  }

  /**
   * 转义字符串中的特殊字符
   */
  private static escapeString(str: string): string {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  /**
   * 验证生成的代码（基础检查）
   */
  static validateGeneratedCode(code: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 检查基本结构
    if (!code.includes('<template>') || !code.includes('</template>')) {
      errors.push('缺少 template 标签');
    }

    if (!code.includes('<script setup>') || !code.includes('</script>')) {
      errors.push('缺少 script 标签');
    }

    if (!code.includes('<style>') || !code.includes('</style>')) {
      errors.push('缺少 style 标签');
    }

    // 检查成对的标签
    const openTags = (code.match(/<[a-z-]+/g) || []).length;
    const closeTags = (code.match(/<\/[a-z-]+>/g) || []).length;

    if (openTags !== closeTags) {
      errors.push(`标签不匹配: 开标签 ${openTags} 个, 闭标签 ${closeTags} 个`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// 使用示例：
/*
import { SimpleASTGenerator } from '@/utils/simpleAstGenerator';
import type { FormComponent } from '@/types/lowcode';

const components: FormComponent[] = [
  {
    id: '1',
    type: 'input',
    label: '姓名',
    field: 'name',
    required: true,
    props: { placeholder: '请输入姓名' }
  },
  {
    id: '2',
    type: 'select',
    label: '部门',
    field: 'department',
    required: true,
    props: {}
  }
];

const code = SimpleASTGenerator.generateComponent(components);
const validation = SimpleASTGenerator.validateGeneratedCode(code);

if (validation.valid) {
  console.log('生成的代码:', code);
} else {
  console.error('代码生成错误:', validation.errors);
}
*/
