import { describe, it, expect } from 'vitest';
import { arrToTree } from './tree.js';
import type { TreeNode } from './types.js';

describe('arrToTree', () => {
  it('should return empty array for empty input', () => {
    expect(arrToTree([])).toEqual([]);
  });

  it('should convert single root node', () => {
    const items: TreeNode[] = [
      { id: 1, pid: 0, name: 'root' },
    ];
    const result = arrToTree(items);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('root');
    expect(result[0].children).toEqual([]);
  });

  it('should build simple parent-child tree', () => {
    const items: TreeNode[] = [
      { id: 1, pid: 0, name: 'parent' },
      { id: 2, pid: 1, name: 'child' },
    ];
    const result = arrToTree(items);
    expect(result).toHaveLength(1);
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0].name).toBe('child');
  });

  it('should build multi-level nested tree', () => {
    const items: TreeNode[] = [
      { id: 1, pid: 0, name: 'level1' },
      { id: 2, pid: 1, name: 'level2' },
      { id: 3, pid: 2, name: 'level3' },
    ];
    const result = arrToTree(items);
    expect(result).toHaveLength(1);
    expect(result[0].children![0].name).toBe('level2');
    expect(result[0].children![0].children![0].name).toBe('level3');
  });

  it('should handle multiple root nodes', () => {
    const items: TreeNode[] = [
      { id: 1, pid: 0, name: 'root1' },
      { id: 2, pid: 0, name: 'root2' },
      { id: 3, pid: 1, name: 'child1' },
    ];
    const result = arrToTree(items);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('root1');
    expect(result[1].name).toBe('root2');
  });

  it('should handle orphan nodes (pid not found)', () => {
    const items: TreeNode[] = [
      { id: 1, pid: 999, name: 'orphan' },
      { id: 2, pid: 0, name: 'root' },
    ];
    const result = arrToTree(items);
    // orphan is silently ignored (not added to any parent)
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('root');
  });

  it('should not mutate original items', () => {
    const items: TreeNode[] = [
      { id: 1, pid: 0, name: 'root' },
    ];
    const original = JSON.parse(JSON.stringify(items));
    arrToTree(items);
    expect(items).toEqual(original);
  });
});
