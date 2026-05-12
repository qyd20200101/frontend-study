import type { BaseNode } from '../types/schema.js';

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

export const defaultSelectNode: BaseNode = {
  id: 'select_1',
  type: 'select',
  label: '选择器',
  props: {
    modelKey: 'select1',
    options: [
      { label: '选项1', value: 'opt1' },
      { label: '选项2', value: 'opt2' }
    ]
  }
};

export const defaultDateNode: BaseNode = {
  id: 'date_1',
  type: 'date',
  label: '日期选择',
  props: {
    modelKey: 'date1'
  }
};

export const defaultRadioNode: BaseNode = {
  id: 'radio_1',
  type: 'radio',
  label: '单选框',
  props: {
    modelKey: 'radio1',
    options: [
      { label: '选项1', value: 'opt1' },
      { label: '选项2', value: 'opt2' }
    ]
  }
};
