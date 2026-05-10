import type { BaseNode } from '../types/schema.js';

export function buildRules(node: BaseNode) {
  const rules: Array<{ required?: boolean; message?: string }> = [];

  if (node.props?.required) {
    rules.push({
      required: true,
      message: `${node.label || node.type}不能为空`
    });
  }

  return rules;
}
