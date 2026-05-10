import { describe, it, expect } from 'vitest';
import { buildRules } from './buildRules.js';
import type { BaseNode } from '../types/schema.js';

describe('buildRules', () => {
  it('should return empty rules when no required prop', () => {
    const node: BaseNode = {
      id: 'test1',
      type: 'input',
      label: '测试字段',
      props: { placeholder: '请输入' },
    };
    expect(buildRules(node)).toEqual([]);
  });

  it('should return required rule when props.required is true', () => {
    const node: BaseNode = {
      id: 'test2',
      type: 'input',
      label: '用户名',
      props: { required: true },
    };
    const rules = buildRules(node);
    expect(rules).toHaveLength(1);
    expect(rules[0].required).toBe(true);
    expect(rules[0].message).toBe('用户名不能为空');
  });

  it('should use type as fallback when label is undefined', () => {
    const node: BaseNode = {
      id: 'test3',
      type: 'select',
      props: { required: true },
    };
    const rules = buildRules(node);
    expect(rules).toHaveLength(1);
    expect(rules[0].message).toBe('select不能为空');
  });

  it('should handle node without props', () => {
    const node: BaseNode = {
      id: 'test4',
      type: 'checkbox',
    };
    expect(buildRules(node)).toEqual([]);
  });

  it('should handle node with empty props object', () => {
    const node: BaseNode = {
      id: 'test5',
      type: 'radio',
      label: '性别',
      props: {},
    };
    expect(buildRules(node)).toEqual([]);
  });
});
