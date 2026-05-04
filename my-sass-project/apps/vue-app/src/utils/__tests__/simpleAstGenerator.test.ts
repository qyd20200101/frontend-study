/**
 * SimpleASTGenerator 单元测试
 * 
 * 运行方式:
 * npm run test src/utils/__tests__/simpleAstGenerator.test.ts
 */

import { describe, it, expect } from 'vitest';
import { SimpleASTGenerator } from '@/utils/simpleAstGenerator';
import type { FormComponent } from '@/types/lowcode';

describe('SimpleASTGenerator', () => {
  describe('generateComponent', () => {
    it('应该生成基础表单组件', () => {
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'input',
          label: '用户名',
          field: 'username',
          required: true,
          props: { placeholder: '请输入用户名' },
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).toContain('<template>');
      expect(code).toContain('</template>');
      expect(code).toContain('<script setup>');
      expect(code).toContain('</script>');
      expect(code).toContain('<style scoped>');
      expect(code).toContain('username');
    });

    it('应该为必填字段生成验证规则', () => {
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'input',
          label: '邮箱',
          field: 'email',
          required: true,
          props: {},
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).toContain('required: true');
      expect(code).toContain('邮箱为必填项');
    });

    it('应该为非必填字段不生成验证规则', () => {
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'input',
          label: '备注',
          field: 'remark',
          required: false,
          props: {},
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).not.toContain('required: true');
      expect(code).not.toContain('备注为必填项');
    });

    it('应该为 select 组件添加 options 属性', () => {
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'select',
          label: '部门',
          field: 'department',
          required: false,
          props: {},
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).toContain(':options="options.department"');
      expect(code).toContain('const options = ref({');
      expect(code).toContain('department: [],');
    });

    it('应该为 checkbox 组件添加 options 属性', () => {
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'checkbox',
          label: '技能',
          field: 'skills',
          required: false,
          props: {},
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).toContain(':options="options.skills"');
      expect(code).toContain('skills: [],');
    });

    it('应该为 radio 组件添加 options 属性', () => {
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'radio',
          label: '性别',
          field: 'gender',
          required: false,
          props: {},
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).toContain(':options="options.gender"');
    });

    it('应该正确处理 input 类型的 trigger 为 blur', () => {
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'input',
          label: '名字',
          field: 'name',
          required: true,
          props: {},
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).toContain("trigger: 'blur'");
    });

    it('应该正确处理其他类型的 trigger 为 change', () => {
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'select',
          label: '选项',
          field: 'option',
          required: true,
          props: {},
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).toContain("trigger: 'change'");
    });

    it('应该为 switch 设置默认值为 false', () => {
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'switch',
          label: '启用',
          field: 'enabled',
          required: false,
          props: {},
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).toContain('enabled: false,');
    });

    it('应该为 select/checkbox/radio 设置默认值为 []', () => {
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'select',
          label: '类别',
          field: 'category',
          required: false,
          props: {},
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).toContain('category: [],');
    });

    it('应该为其他类型设置默认值为 null', () => {
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'date',
          label: '日期',
          field: 'date',
          required: false,
          props: {},
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).toContain('date: null,');
    });

    it('应该处理多个组件', () => {
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'input',
          label: '姓名',
          field: 'name',
          required: true,
          props: {},
        },
        {
          id: '2',
          type: 'select',
          label: '部门',
          field: 'dept',
          required: true,
          props: {},
        },
        {
          id: '3',
          type: 'date',
          label: '入职日期',
          field: 'joinDate',
          required: false,
          props: {},
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).toContain('name:');
      expect(code).toContain('dept:');
      expect(code).toContain('joinDate:');
      expect(code).toContain('姓名');
      expect(code).toContain('部门');
      expect(code).toContain('入职日期');
    });

    it('应该转义特殊字符', () => {
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'input',
          label: '用户 "名" 称',
          field: 'username',
          required: false,
          props: { placeholder: '请输入\\用户名' },
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      // 应该正确转义引号和反斜杠
      expect(code).toContain('用户 \\"名\\" 称');
    });

    it('应该处理占位符属性', () => {
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'input',
          label: '邮箱',
          field: 'email',
          required: false,
          props: { placeholder: '请输入您的邮箱' },
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).toContain('placeholder="请输入您的邮箱"');
    });
  });

  describe('validateGeneratedCode', () => {
    it('应该验证正确的代码', () => {
      const validCode = `<template><div></div></template><script setup></script><style></style>`;

      const result = SimpleASTGenerator.validateGeneratedCode(validCode);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('应该检测缺少 template 标签', () => {
      const invalidCode = `<script setup></script><style></style>`;

      const result = SimpleASTGenerator.validateGeneratedCode(invalidCode);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('缺少 template 标签');
    });

    it('应该检测缺少 script 标签', () => {
      const invalidCode = `<template></template><style></style>`;

      const result = SimpleASTGenerator.validateGeneratedCode(invalidCode);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('script'))).toBe(true);
    });

    it('应该检测缺少 style 标签', () => {
      const invalidCode = `<template></template><script setup></script>`;

      const result = SimpleASTGenerator.validateGeneratedCode(invalidCode);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('style'))).toBe(true);
    });
  });

  describe('边界情况', () => {
    it('应该处理空的组件列表', () => {
      const components: FormComponent[] = [];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).toContain('<template>');
      expect(code).toContain('</template>');
      expect(code).toContain('const formData = ref({});');
    });

    it('应该处理中文标签和字段', () => {
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'input',
          label: '员工编号',
          field: '员工ID',
          required: true,
          props: {},
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).toContain('员工编号');
      expect(code).toContain('员工ID');
    });

    it('应该处理很长的字段名', () => {
      const longFieldName = 'thisIsAVeryLongFieldNameThatMightCauseIssuesInCodeGeneration';
      const components: FormComponent[] = [
        {
          id: '1',
          type: 'input',
          label: '长字段',
          field: longFieldName,
          required: false,
          props: {},
        },
      ];

      const code = SimpleASTGenerator.generateComponent(components);

      expect(code).toContain(longFieldName);
    });
  });
});
