import { create } from 'zustand';
import type { BaseNode } from '@my-sass/core';

interface DesignerState {
  nodes: BaseNode[];
  selectedId: string | null;

  setNodes: (nodes: BaseNode[]) => void;
  addNode: (node: BaseNode, parentId?: string | null) => void;
  setSelectedId: (id: string | null) => void;
  updateNode: (id: string, patch: Partial<BaseNode>) => void;
  reorderNodes: (oldIndex: number, newIndex: number) => void;
  reset: () => void;
}

export const useDesignerStore = create<DesignerState>((set) => ({
  nodes: [],
  selectedId: null,

  setNodes: (nodes) => set({ nodes }),

  addNode: (node, parentId = null) =>
    set((state) => {
      // 顶层添加
      if (!parentId) {
        return { nodes: [...state.nodes, node] };
      }

      // 添加到某个 group 子节点
      const appendChild = (list: BaseNode[]): BaseNode[] =>
        list.map((item) => {
          if (item.id === parentId) {
            return {
              ...item,
              children: [...(item.children ?? []), node]
            };
          }
          if (item.children?.length) {
            return { ...item, children: appendChild(item.children) };
          }
          return item;
        });

      return { nodes: appendChild(state.nodes) };
    }),

  setSelectedId: (id) => set({ selectedId: id }),

  updateNode: (id, patch) =>
    set((state) => {
      const updateRecursive = (list: BaseNode[]): BaseNode[] =>
        list.map((node) => {
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
      const arr = [...state.nodes];
      const [moved] = arr.splice(oldIndex, 1);
      arr.splice(newIndex, 0, moved);
      return { nodes: arr };
    }),

  reset: () => set({ nodes: [], selectedId: null })
}));
