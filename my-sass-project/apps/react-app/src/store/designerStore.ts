import { create } from "zustand";
import type { BaseNode } from "@my-sass/core";

interface DesignerState {
  nodes: BaseNode[];
  selectedId: string | null;

  setNodes: (nodes: BaseNode[]) => void;
  addNode: (node: BaseNode, parentId?: string | null) => void;
  isGroupNode: (id: string | null) => boolean;

  setSelectedId: (id: string | null) => void;
  getSelectedNode: () => BaseNode | null;
  updateNode: (id: string, patch: Partial<BaseNode>) => void;
  moveNodeToGroup: (nodeId: string, groupId: string) => void;
  findNodeById: (id: string) => BaseNode | null;
  moveNodeToRoot: (nodeId: string) => void;
  reorderGroupChildren: (
    groupId: string,
    oldIndex: number,
    newIndex: number,
  ) => void;
  reorderInContainer: (
    containerId: string,
    oldIndex: number,
    newIndex: number,
  ) => void;
  removeNode: (id: string) => void;
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
            return {
              ...item,
              children: [...(item.children ?? []), node],
            };
          }
          if (item.children?.length) {
            return { ...item, children: appendChild(item.children) };
          }
          return item;
        });

      return { nodes: appendChild(state.nodes) };
    }),
  isGroupNode: (id) => {
    if (!id) return false;

    const find = (list: BaseNode[]): BaseNode | null => {
      for (const n of list) {
        if (n.id === id) return n;
        if (n.children?.length) {
          const hit = find(n.children);
          if (hit) return hit;
        }
      }
      return null;
    };

    const node = find(get().nodes);
    return node?.type === "group";
  },

  setSelectedId: (id) => set({ selectedId: id }),

  getSelectedNode: () => {
    const find = (list: BaseNode[], id: string | null): BaseNode | null => {
      if (!id) return null;
      for (const n of list) {
        if (n.id === id) return n;
        if (n.children?.length) {
          const hit = find(n.children, id);
          if (hit) return hit;
        }
      }
      return null;
    };
    return find(get().nodes, get().selectedId);
  },
  findNodeById: (id) => {
    const walk = (list: BaseNode[]): BaseNode | null => {
      for (const n of list) {
        if (n.id === id) return n;
        if (n.children?.length) {
          const hit = walk(n.children);
          if (hit) return hit;
        }
      }
      return null;
    };
    return walk(get().nodes);
  },

  moveNodeToGroup: (nodeId, groupId) =>
    set((state) => {
      let movingNode: BaseNode | null = null;

      // 1) 从整棵树中移除 nodeId，并拿到该节点
      const removeNode = (list: BaseNode[]): BaseNode[] =>
        list
          .filter((n) => {
            if (n.id === nodeId) {
              movingNode = n;
              return false;
            }
            return true;
          })
          .map((n) =>
            n.children?.length ? { ...n, children: removeNode(n.children) } : n,
          );

      const removed = removeNode(state.nodes);
      if (!movingNode) return { nodes: state.nodes };

      // 防止拖到自己或自己的子树里（简单保护）
      const contains = (root: BaseNode, targetId: string): boolean => {
        if (root.id === targetId) return true;
        return !!root.children?.some((c) => contains(c, targetId));
      };
      if (contains(movingNode, groupId)) {
        return { nodes: state.nodes };
      }

      // 2) 插入到 group.children
      const insertIntoGroup = (list: BaseNode[]): BaseNode[] =>
        list.map((n) => {
          if (n.id === groupId && n.type === "group") {
            return { ...n, children: [...(n.children ?? []), movingNode!] };
          }
          if (n.children?.length) {
            return { ...n, children: insertIntoGroup(n.children) };
          }
          return n;
        });

      return { nodes: insertIntoGroup(removed) };
    }),
  moveNodeToRoot: (nodeId) =>
    set((state) => {
      let movingNode: BaseNode | null = null;

      const removeRecursive = (list: BaseNode[]): BaseNode[] =>
        list
          .filter((n) => {
            if (n.id === nodeId) {
              movingNode = n;
              return false;
            }
            return true;
          })
          .map((n) =>
            n.children?.length
              ? { ...n, children: removeRecursive(n.children) }
              : n,
          );

      const nextTree = removeRecursive(state.nodes);
      if (!movingNode) return { nodes: state.nodes };

      return { nodes: [...nextTree, movingNode] };
    }),

  reorderGroupChildren: (groupId, oldIndex, newIndex) =>
    set((state) => {
      const reorder = (arr: BaseNode[]) => {
        const copy = [...arr];
        const [moved] = copy.splice(oldIndex, 1);
        copy.splice(newIndex, 0, moved);
        return copy;
      };

      const walk = (list: BaseNode[]): BaseNode[] =>
        list.map((n) => {
          if (n.id === groupId && n.type === "group") {
            return { ...n, children: reorder(n.children ?? []) };
          }
          if (n.children?.length) {
            return { ...n, children: walk(n.children) };
          }
          return n;
        });

      return { nodes: walk(state.nodes) };
    }),

  updateNode: (id, patch) =>
    set((state) => {
      const updateRecursive = (list: BaseNode[]): BaseNode[] =>
        list.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              ...patch,
              props: { ...node.props, ...patch.props },
            };
          }
          if (node.children?.length) {
            return { ...node, children: updateRecursive(node.children) };
          }
          return node;
        });

      return { nodes: updateRecursive(state.nodes) };
    }),
  reorderInContainer: (containerId, oldIndex, newIndex) =>
    set((state) => {
      const reorder = (arr: BaseNode[]) => {
        const next = [...arr];
        const [moved] = next.splice(oldIndex, 1);
        next.splice(newIndex, 0, moved);
        return next;
      };

      if (containerId === "__ROOT__") {
        return { nodes: reorder(state.nodes) };
      }

      const groupId = containerId.replace("group:", "");
      const walk = (list: BaseNode[]): BaseNode[] =>
        list.map((n) => {
          if (n.id === groupId && n.type === "group") {
            return { ...n, children: reorder(n.children ?? []) };
          }
          if (n.children?.length) return { ...n, children: walk(n.children) };
          return n;
        });

      return { nodes: walk(state.nodes) };
    }),

  removeNode: (id) =>
    set((state) => {
      const removeRecursive = (list: BaseNode[]): BaseNode[] =>
        list
          .filter((n) => n.id !== id)
          .map((n) =>
            n.children?.length
              ? { ...n, children: removeRecursive(n.children) } // 注意是 children
              : n,
          );

      const next = removeRecursive(state.nodes);
      return {
        nodes: next,
        selectedId: state.selectedId === id ? null : state.selectedId,
      };
    }),

  reorderNodes: (oldIndex, newIndex) =>
    set((state) => {
      const arr = [...state.nodes];
      const [moved] = arr.splice(oldIndex, 1);
      arr.splice(newIndex, 0, moved);
      return { nodes: arr };
    }),

  reset: () => set({ nodes: [], selectedId: null }),
}));
