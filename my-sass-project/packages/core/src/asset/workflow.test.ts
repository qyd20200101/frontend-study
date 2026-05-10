import { describe, it, expect } from 'vitest';
import {
  WorkflowEngine,
  ASSET_WORKFLOW,
} from './workflow.js';
import type { AssetStatus } from './types.js';

describe('ASSET_WORKFLOW', () => {
  it('should have 4 transitions defined', () => {
    expect(ASSET_WORKFLOW).toHaveLength(4);
  });

  it('should have all expected transition names', () => {
    const names = ASSET_WORKFLOW.map(t => t.name);
    expect(names).toContain('report_repair');
    expect(names).toContain('finish_repair');
    expect(names).toContain('scrap_asset');
    expect(names).toContain('reactivate');
  });
});

describe('WorkflowEngine.getAvailableTransitions', () => {
  it('should return available transitions for active status', () => {
    const transitions = WorkflowEngine.getAvailableTransitions('active');
    const names = transitions.map(t => t.name);
    expect(names).toContain('report_repair');
    expect(names).toContain('scrap_asset');
    expect(names).not.toContain('finish_repair');
    expect(names).not.toContain('reactivate');
  });

  it('should return available transitions for repair status', () => {
    const transitions = WorkflowEngine.getAvailableTransitions('repair');
    const names = transitions.map(t => t.name);
    expect(names).toContain('finish_repair');
    expect(names).toContain('scrap_asset');
    expect(names).not.toContain('report_repair');
  });

  it('should return available transitions for scrapped status', () => {
    const transitions = WorkflowEngine.getAvailableTransitions('scrapped');
    const names = transitions.map(t => t.name);
    expect(names).toContain('reactivate');
    expect(names).not.toContain('scrap_asset');
  });

  it('should return empty for unknown status', () => {
    const transitions = WorkflowEngine.getAvailableTransitions('unknown' as AssetStatus);
    expect(transitions).toHaveLength(0);
  });
});

describe('WorkflowEngine.canTransition', () => {
  it('should allow active -> repair', () => {
    expect(WorkflowEngine.canTransition('active', 'report_repair')).toBe(true);
  });

  it('should allow repair -> active', () => {
    expect(WorkflowEngine.canTransition('repair', 'finish_repair')).toBe(true);
  });

  it('should allow active -> scrapped', () => {
    expect(WorkflowEngine.canTransition('active', 'scrap_asset')).toBe(true);
  });

  it('should allow repair -> scrapped', () => {
    expect(WorkflowEngine.canTransition('repair', 'scrap_asset')).toBe(true);
  });

  it('should not allow scrapped -> repair', () => {
    expect(WorkflowEngine.canTransition('scrapped', 'report_repair')).toBe(false);
  });

  it('should not allow active -> finish_repair', () => {
    expect(WorkflowEngine.canTransition('active', 'finish_repair')).toBe(false);
  });

  it('should return false for unknown transition name', () => {
    expect(WorkflowEngine.canTransition('active', 'nonexistent')).toBe(false);
  });
});

describe('WorkflowEngine.getTransition', () => {
  it('should return transition by name', () => {
    const t = WorkflowEngine.getTransition('scrap_asset');
    expect(t).toBeDefined();
    expect(t!.name).toBe('scrap_asset');
    expect(t!.label).toBe('资产报废');
  });

  it('should return undefined for unknown name', () => {
    expect(WorkflowEngine.getTransition('unknown')).toBeUndefined();
  });
});
