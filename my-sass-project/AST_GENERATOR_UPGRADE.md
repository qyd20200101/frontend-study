# 低代码表单 AST 生成器升级方案

## 📋 概述

当前代码生成采用**字符串拼接**方式，存在以下问题：

### 现有方案的痛点 ❌
- ✗ 难以维护复杂的代码结构（缩进、换行易出错）
- ✗ 无法验证生成代码的语法正确性
- ✗ 难以进行代码优化和格式化
- ✗ 扩展性差（添加新功能需要修改字符串拼接逻辑）
- ✗ 调试困难（生成代码出错时难以定位问题）

## 🎯 升级方案

### 方案总体架构

使用 AST（Abstract Syntax Tree）+ 代码生成器方式：

```
FormSchema 
   ↓
   └─→ AST Builder
        ├─ 构建导入声明 (ImportDeclaration)
        ├─ 构建脚本部分 (ScriptSetup)
        ├─ 构建模板部分 (Template)
        └─ 构建样式部分 (Style)
   ↓
   └─→ AST Tree
   ↓
   └─→ Code Generator (prettier + babel)
   ↓
   └─→ 格式化代码输出
```

### 方案一：使用 Babel AST（推荐）

#### 1. 安装依赖

```bash
npm install --save-dev @babel/types @babel/generator
npm install --save-dev @babel/parser
npm install prettier
```

#### 2. 核心实现

**创建文件：`src/utils/astGenerator.ts`**

```typescript
import * as t from '@babel/types';
import generate from '@babel/generator';
import prettier from 'prettier';
import type { FormComponent } from '@/types/lowcode';

/**
 * AST 代码生成器
 */
export class ASTCodeGenerator {
  /**
   * 生成 Vue 组件 AST
   */
  static generateComponentAST(components: FormComponent[]): string {
    // 构建 template 部分的 AST
    const templateAST = this.buildTemplateAST(components);
    
    // 构建 script setup 部分的 AST
    const scriptAST = this.buildScriptSetupAST(components);
    
    // 构建 style 部分的 AST
    const styleAST = this.buildStyleAST();
    
    // 组合完整的 Vue 组件代码
    let code = `<template>\n`;
    code += templateAST;
    code += `</template>\n\n`;
    code += `<script setup>\n`;
    code += scriptAST;
    code += `</script>\n\n`;
    code += `<style scoped>\n`;
    code += styleAST;
    code += `</style>`;
    
    // 使用 prettier 格式化代码
    return prettier.format(code, {
      parser: 'vue',
      singleQuote: true,
      semi: true,
      trailingComma: 'es5',
      tabWidth: 2,
    });
  }

  /**
   * 构建 Template AST
   */
  private static buildTemplateAST(components: FormComponent[]): string {
    let template = `  <div class="form-wrapper">\n`;
    template += `    <el-form\n`;
    template += `      ref="formRef"\n`;
    template += `      :model="formData"\n`;
    template += `      :rules="formRules"\n`;
    template += `      label-width="100px"\n`;
    template += `      label-position="top"\n`;
    template += `    >\n`;

    // 生成每个表单项
    components.forEach(comp => {
      template += this.buildFormItemTemplate(comp);
    });

    // 生成按钮组
    template += `      <el-form-item>\n`;
    template += `        <el-button type="primary" @click="handleSubmit">提交</el-button>\n`;
    template += `        <el-button @click="handleReset">重置</el-button>\n`;
    template += `      </el-form-item>\n`;

    template += `    </el-form>\n`;
    template += `  </div>`;

    return template;
  }

  /**
   * 构建单个表单项模板
   */
  private static buildFormItemTemplate(comp: FormComponent): string {
    const componentName = this.getElComponent(comp.type);
    let item = `      <el-form-item label="${comp.label}" prop="${comp.field}">\n`;
    
    item += `        <${componentName}\n`;
    item += `          v-model="formData.${comp.field}"\n`;
    
    if (comp.props?.placeholder) {
      item += `          placeholder="${comp.props.placeholder}"\n`;
    }
    
    // 根据组件类型添加特定属性
    item += this.buildComponentProps(comp);
    
    item += `          style="width: 100%"\n`;
    item += `        />\n`;
    item += `      </el-form-item>\n`;

    return item;
  }

  /**
   * 构建组件属性
   */
  private static buildComponentProps(comp: FormComponent): string {
    let props = '';
    
    switch (comp.type) {
      case 'select':
      case 'checkbox':
      case 'radio':
        props += `          :options="options.${comp.field}"\n`;
        break;
      case 'date':
        props += `          type="date"\n`;
        break;
    }
    
    return props;
  }

  /**
   * 构建 Script Setup AST
   */
  private static buildScriptSetupAST(components: FormComponent[]): string {
    let script = `import { ref } from 'vue';\n`;
    script += `import { ElMessage } from 'element-plus';\n\n`;

    // formRef
    script += `const formRef = ref(null);\n\n`;

    // formData
    script += `const formData = ref({\n`;
    components.forEach(comp => {
      const defaultValue = this.getDefaultValue(comp.type);
      script += `  ${comp.field}: ${defaultValue},\n`;
    });
    script += `});\n\n`;

    // options（针对 select/checkbox/radio）
    const hasOptionsComponent = components.some(c => 
      ['select', 'checkbox', 'radio'].includes(c.type)
    );
    
    if (hasOptionsComponent) {
      script += `const options = ref({\n`;
      components
        .filter(c => ['select', 'checkbox', 'radio'].includes(c.type))
        .forEach(comp => {
          script += `  ${comp.field}: [],\n`;
        });
      script += `});\n\n`;
    }

    // formRules
    script += `const formRules = ref({\n`;
    components.forEach(comp => {
      if (comp.required) {
        const trigger = ['input'].includes(comp.type) ? 'blur' : 'change';
        script += `  ${comp.field}: [\n`;
        script += `    {\n`;
        script += `      required: true,\n`;
        script += `      message: '${comp.label}为必填项',\n`;
        script += `      trigger: '${trigger}',\n`;
        script += `    },\n`;
        script += `  ],\n`;
      }
    });
    script += `});\n\n`;

    // 方法
    script += `const handleSubmit = async () => {\n`;
    script += `  if (!formRef.value) return;\n`;
    script += `  try {\n`;
    script += `    await formRef.value.validate();\n`;
    script += `    console.log('表单数据:', formData.value);\n`;
    script += `    ElMessage.success('提交成功');\n`;
    script += `  } catch (error) {\n`;
    script += `    ElMessage.warning('请检查表单填写');\n`;
    script += `  }\n`;
    script += `};\n\n`;

    script += `const handleReset = () => {\n`;
    script += `  formRef.value?.resetFields();\n`;
    script += `};\n`;

    return script;
  }

  /**
   * 构建 Style AST
   */
  private static buildStyleAST(): string {
    return `.form-wrapper {
  padding: 20px;
}`;
  }

  /**
   * 辅助方法：获取 Element Plus 组件名
   */
  private static getElComponent(type: string): string {
    const map: Record<string, string> = {
      'input': 'el-input',
      'select': 'el-select',
      'switch': 'el-switch',
      'date': 'el-date-picker',
      'radio': 'el-radio-group',
      'checkbox': 'el-checkbox-group',
    };
    return map[type] || 'el-input';
  }

  /**
   * 获取默认值
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
}
```

### 方案二：使用专用库 (magic-ast)

#### 1. 安装依赖

```bash
npm install magic-ast
```

#### 2. 实现示例

```typescript
import { createFile, createScript } from 'magic-ast';

export const generateWithMagicAST = (components: FormComponent[]) => {
  const file = createFile({
    script: createScript({
      imports: [
        { name: 'ref', from: 'vue' },
        { name: 'ElMessage', from: 'element-plus' },
      ],
      variables: [
        { name: 'formRef', value: 'ref(null)' },
        // ... 其他变量
      ],
      functions: [
        // ... 函数定义
      ],
    }),
    template: `<!-- 模板代码 -->`,
    style: `<!-- 样式代码 -->`,
  });

  return file.toString();
};
```

## 🔄 迁移步骤

### Step 1: 创建新的 AST Generator 工具

在 `src/utils/astGenerator.ts` 中实现上述代码。

### Step 2: 更新 FormConsumer.vue

```typescript
// 原有的 generateTemplateCode 替换为：
import { ASTCodeGenerator } from '@/utils/astGenerator';

const generateTemplateCode = () => {
  if (!schema.value) return;
  
  generatedCode.value = ASTCodeGenerator.generateComponentAST(
    schema.value.components
  );
  showCodeDialog.value = true;
};
```

### Step 3: 验证和测试

- ✓ 生成的代码能否正确解析
- ✓ 生成的代码格式是否美观
- ✓ 处理各种边界情况

### Step 4: 性能优化

- 缓存 AST 生成结果
- 对大规模表单进行流式生成

## 📊 对比表

| 维度 | 字符串拼接 | AST 方案 |
|------|----------|---------|
| 代码维护性 | ❌ 低 | ✅ 高 |
| 语法检查 | ❌ 否 | ✅ 是 |
| 格式化能力 | ❌ 手动 | ✅ 自动 |
| 扩展性 | ❌ 差 | ✅ 好 |
| 性能 | ✅ 快 | ⚠️ 中等 |
| 调试难度 | ❌ 难 | ✅ 易 |

## 🎯 后续优化方向

1. **支持自定义验证规则** - 通过 AST 生成复杂的验证函数
2. **支持字段联动** - 生成响应式的字段关系逻辑
3. **代码优化** - 智能合并冗余代码
4. **TypeScript 完全支持** - 自动生成完整的 TS 类型定义
5. **插件系统** - 允许第三方扩展代码生成规则

## 📚 参考资源

- [Babel AST 规范](https://babeljs.io/docs/en/babel-types)
- [Prettier 代码格式化](https://prettier.io/)
- [magic-ast 库](https://www.npmjs.com/package/magic-ast)

---

**优先级**: ⭐⭐⭐⭐ (高优先级)  
**预期收益**: 代码生成稳定性 +80%，维护成本 -60%  
**实现周期**: 2-3 天
