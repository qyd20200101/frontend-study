import { describe, it, expect } from 'vitest';
import {
  filterAssets,
  sortAssets,
  summaryInfo,
  chartSummaryData,
  exportCsv,
  type AssetBusinessState,
} from './business.js';
import type { AssetProject } from './types.js';

const mockAssets: AssetProject[] = [
  { id: 1, name: '传感器A', budget: 100, status: 'active', category: 'IoT', deptId: 10 },
  { id: 2, name: '管理系统', budget: 200, status: 'archived', category: 'Software', deptId: 20 },
  { id: 3, name: '大屏显示器', budget: 300, status: 'active', category: 'Visual', deptId: 10 },
  { id: 4, name: '服务器B', budget: 400, status: 'repair', category: 'Hardware', deptId: 20 },
];

describe('filterAssets', () => {
  const defaultState: AssetBusinessState<AssetProject> = {
    selectedCategory: '',
    selectedDeptId: null,
    searchQuery: '',
    sortKey: 'id',
    sortOrder: null,
  };

  it('should return all items when no filter applied', () => {
    const result = filterAssets(mockAssets, defaultState);
    expect(result).toHaveLength(4);
  });

  it('should filter by category', () => {
    const result = filterAssets(mockAssets, {
      ...defaultState,
      selectedCategory: 'IoT',
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('传感器A');
  });

  it('should filter by deptId', () => {
    const result = filterAssets(mockAssets, {
      ...defaultState,
      selectedDeptId: 10,
    });
    expect(result).toHaveLength(2);
    expect(result.map(r => r.name)).toEqual(['传感器A', '大屏显示器']);
  });

  it('should filter by searchQuery (name match)', () => {
    const result = filterAssets(mockAssets, {
      ...defaultState,
      searchQuery: '服务',
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('服务器B');
  });

  it('should combine multiple filters', () => {
    const result = filterAssets(mockAssets, {
      ...defaultState,
      selectedCategory: 'Hardware',
      selectedDeptId: 20,
      searchQuery: '服务',
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('服务器B');
  });

  it('should return empty when no match', () => {
    const result = filterAssets(mockAssets, {
      ...defaultState,
      searchQuery: '不存在的资产',
    });
    expect(result).toHaveLength(0);
  });
});

describe('sortAssets', () => {
  it('should return new array when order is null', () => {
    const result = sortAssets(mockAssets, 'id', null);
    expect(result).toHaveLength(4);
    expect(result).not.toBe(mockAssets);
  });

  it('should sort ascending by number', () => {
    const result = sortAssets(mockAssets, 'budget', 'asc');
    expect(result[0].budget).toBe(100);
    expect(result[3].budget).toBe(400);
  });

  it('should sort descending by number', () => {
    const result = sortAssets(mockAssets, 'budget', 'desc');
    expect(result[0].budget).toBe(400);
    expect(result[3].budget).toBe(100);
  });

  it('should sort by string field', () => {
    const result = sortAssets(mockAssets, 'name', 'asc');
    expect(result[0].name).toBe('传感器A');
    expect(result[3].name).toBe('管理系统');
  });

  it('should not mutate original array', () => {
    const original = [...mockAssets];
    sortAssets(mockAssets, 'id', 'asc');
    expect(mockAssets).toEqual(original);
  });
});

describe('summaryInfo', () => {
  it('should calculate correct totals', () => {
    const result = summaryInfo(mockAssets);
    expect(result.count).toBe(4);
    expect(result.totalBudget).toBe(1000);
    expect(result.average).toBe('250.00');
  });

  it('should handle empty list', () => {
    const result = summaryInfo([]);
    expect(result.count).toBe(0);
    expect(result.totalBudget).toBe(0);
    expect(result.average).toBe('0.00');
  });

  it('should handle single item', () => {
    const result = summaryInfo([mockAssets[0]]);
    expect(result.count).toBe(1);
    expect(result.totalBudget).toBe(100);
    expect(result.average).toBe('100.00');
  });
});

describe('chartSummaryData', () => {
  it('should aggregate budget by known categories', () => {
    const result = chartSummaryData(mockAssets);
    const iotEntry = result.find(r => r.name === 'IoT');
    const swEntry = result.find(r => r.name === 'Software');
    expect(iotEntry?.value).toBe(100);
    expect(swEntry?.value).toBe(200);
  });

  it('should return zero for categories with no items', () => {
    const result = chartSummaryData([]);
    result.forEach(entry => {
      expect(entry.value).toBe(0);
    });
  });
});

describe('exportCsv', () => {
  it('should generate CSV with BOM header', () => {
    const result = exportCsv(mockAssets);
    expect(result).toContain('\uFEFF');
    expect(result).toContain('ID,名称,分类,预算,状态');
  });

  it('should include all items in CSV', () => {
    const result = exportCsv(mockAssets);
    const lines = result.split('\n').filter(Boolean);
    // 1 header + 4 data lines
    expect(lines).toHaveLength(5);
  });
});
