import { create } from 'zustand';
import type { BaseNode } from '@my-sass/core';

interface DesignerState {
  nodes: BaseNode[];
  selectedId: string | null;
  setNodes: (nodes: BaseNode[]) => void;                // 列表整体替换
  addNode: (node: BaseNode, parentId?: string | null) => void;
  setSelectedId: (id: string | null) => void;           // 选中节点
  updateNode: (id: string, patch: Partial<BaseNode>) => void;
  reorderNodes: (oldIndex: number, newIndex: number) => void;
  reset: () => void;
}

export const useDesignerStore = create<DesignerState>((set, get) => ({
  nodes: [],
  selectedId: null,

  setNodes: (nodes) => set({ nodes }),

  addNode: (node, parentId = null) =>
    set((state) => {
      if (!parentId) {
        return { nodes: [...state.nodes, node] };
      }

      const appendChild = (list: BaseNode[]): BaseNode[] =>
        list.map((item) => {
          if (item.id === parentId) {
            const children = item.children ? [...item.children, node] : [node];
            return { ...item, children };
          }
          if (item.children) {
            return { ...item, children: appendChild(item.children) };
          }
          return item;
        });

      return { nodes: appendChild(state.nodes) };
    }),

  setSelectedId: (id) => set({ selectedId: id }),

  updateNode: (id, patch) =>
    set((state) => {
      const updateRecursive = (nodes: BaseNode[]): BaseNode[] =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              ...patch,
              props: { ...node.props, ...patch.props }
            };
          }
          if (node.children?.length) {
            return { ...node, children: updateRecursive(node.children) };
          }
          return node;
        });

      return { nodes: updateRecursive(state.nodes) };
    }),

  reorderNodes: (oldIndex, newIndex) =>
    set((state) => {
      const list = [...state.nodes];
      const [moved] = list.splice(oldIndex, 1);
      list.splice(newIndex, 0, moved);
      return { nodes: list };
    }),

  reset: () => set({ nodes: [], selectedId: null })
}));
