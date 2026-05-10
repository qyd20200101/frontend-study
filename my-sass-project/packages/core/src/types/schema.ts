export type FieldType =
  | 'input'
  | 'select'
  | 'date'
  | 'radio'
  | 'checkbox'
  | 'group';

export interface BaseNode {
  id: string;
  type: FieldType;
  label?: string;
  props?: Record<string, any>;
  children?: BaseNode[];
  visibility?: string;
}
