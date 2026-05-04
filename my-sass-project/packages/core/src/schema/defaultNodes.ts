import type { BaseNode } from '../types/schema';

export const defaultInputNode: BaseNode = {
  id: 'input_1',
  type: 'input',
  label: '输入框',
  props: {
    modelKey: 'field1',
    placeholder: '请输入内容'
  }
};

export const defaultGroupNode: BaseNode = {
  id: 'group_1',
  type: 'group',
  label: '分组',
  children: []
};
