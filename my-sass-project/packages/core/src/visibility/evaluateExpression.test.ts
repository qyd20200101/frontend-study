import { describe, it, expect } from 'vitest';
import { evaluateVisibleExpression } from './evaluateExpression.js';
import type { VisibleExpressionVars } from './types.js';

describe('evaluateVisibleExpression', () => {
  it('should return true for empty expression', () => {
    expect(evaluateVisibleExpression('', {})).toBe(true);
  });

  it('should evaluate simple comparison', () => {
    const vars: VisibleExpressionVars = { user: { role: 'admin' } };
    expect(evaluateVisibleExpression("{user.role} === 'admin'", vars)).toBe(true);
  });

  it('should evaluate numeric comparison', () => {
    const vars: VisibleExpressionVars = { age: 25 };
    expect(evaluateVisibleExpression('{age} >= 18', vars)).toBe(true);
    expect(evaluateVisibleExpression('{age} < 18', vars)).toBe(false);
  });

  it('should evaluate boolean expression', () => {
    const vars: VisibleExpressionVars = { isVip: true };
    expect(evaluateVisibleExpression('{isVip} === true', vars)).toBe(true);
  });

  it('should evaluate nested property access', () => {
    const vars: VisibleExpressionVars = {
      form: { data: { status: 'active' } },
    };
    expect(evaluateVisibleExpression("{form.data.status} === 'active'", vars)).toBe(true);
    expect(evaluateVisibleExpression("{form.data.status} === 'inactive'", vars)).toBe(false);
  });

  it('should return true on syntax error (graceful fallback)', () => {
    const vars: VisibleExpressionVars = { value: 1 };
    expect(evaluateVisibleExpression('{value', vars)).toBe(true);
  });

  it('should evaluate undefined variable as falsy comparison', () => {
    const vars: VisibleExpressionVars = { user: {} };
    const result = evaluateVisibleExpression("{user.role} === 'admin'", vars);
    expect(result).toBe(false);
  });

  it('should handle multiple variables in expression', () => {
    const vars: VisibleExpressionVars = { a: 10, b: 5 };
    expect(evaluateVisibleExpression('{a} > {b}', vars)).toBe(true);
    expect(evaluateVisibleExpression('{a} < {b}', vars)).toBe(false);
  });

  it('should evaluate nonexistent key against string as false', () => {
    const result = evaluateVisibleExpression("{nonexistent} === 'test'", {});
    expect(result).toBe(false);
  });
});
