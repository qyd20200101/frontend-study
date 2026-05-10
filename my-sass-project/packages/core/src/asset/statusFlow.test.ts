import { describe, it, expect } from 'vitest';
import { transitionStatus, createRepair } from './statusFlow.js';
import type { AssetProject } from './types.js';

const baseAsset: AssetProject = {
  id: 1,
  name: '测试设备',
  budget: 1000,
  status: 'active',
  category: 'Hardware',
  deptId: 10,
};

describe('transitionStatus', () => {
  it('should change status and record history', () => {
    const asset = JSON.parse(JSON.stringify(baseAsset)) as AssetProject;
    const result = transitionStatus(asset, 'archived', '张三');

    expect(result.status).toBe('archived');
    expect(result.history).toHaveLength(1);
    expect(result.history![0].operator).toBe('张三');
    expect(result.history![0].action).toBe('状态变更: active -> archived');
  });

  it('should use default operator when not provided', () => {
    const asset = JSON.parse(JSON.stringify(baseAsset)) as AssetProject;
    const result = transitionStatus(asset, 'scrapped');

    expect(result.history![0].operator).toBe('系统管理员');
  });

  it('should prepend history entries (most recent first)', () => {
    const asset = JSON.parse(JSON.stringify(baseAsset)) as AssetProject;
    asset.history = [{
      time: '2020-01-01',
      operator: 'admin',
      action: '创建资产',
    }];

    const result = transitionStatus(asset, 'repair', '李四');
    expect(result.history).toHaveLength(2);
    expect(result.history![0].action).toBe('状态变更: active -> repair');
    expect(result.history![1].action).toBe('创建资产');
  });

  it('should initialize history array if not present', () => {
    const asset = JSON.parse(JSON.stringify(baseAsset)) as AssetProject;
    const result = transitionStatus(asset, 'pending');
    expect(Array.isArray(result.history)).toBe(true);
  });

  it('should mutate the original object (not a copy)', () => {
    const asset = JSON.parse(JSON.stringify(baseAsset)) as AssetProject;
    const result = transitionStatus(asset, 'archived');
    expect(result).toBe(asset);
  });
});

describe('createRepair', () => {
  it('should set status to repair', () => {
    const asset = JSON.parse(JSON.stringify(baseAsset)) as AssetProject;
    const result = createRepair(asset, '显示屏损坏');

    expect(result.status).toBe('repair');
  });

  it('should record repair reason in history', () => {
    const asset = JSON.parse(JSON.stringify(baseAsset)) as AssetProject;
    const result = createRepair(asset, '线路老化', '王五');

    expect(result.history!).toHaveLength(1);
    expect(result.history![0].operator).toBe('王五');
    expect(result.history![0].action).toBe('发起报修');
    expect(result.history![0].remark).toBe('线路老化');
  });

  it('should use default operator when not provided', () => {
    const asset = JSON.parse(JSON.stringify(baseAsset)) as AssetProject;
    const result = createRepair(asset, '零件损坏');

    expect(result.history![0].operator).toBe('Admin');
  });
});
