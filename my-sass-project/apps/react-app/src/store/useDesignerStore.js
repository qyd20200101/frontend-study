import { create } from 'zustand';
export const useDesignerStore = create((set) => ({
    nodes: [],
    selectedId: null,
    setNodes: (nodes) => set({ nodes }),
    addNode: (node, parentId = null) => set((state) => {
        if (!parentId) {
            return { nodes: [...state.nodes, node] };
        }
        const appendChild = (list) => list.map((item) => {
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
    updateNode: (id, patch) => set((state) => {
        const updateRecursive = (nodes) => nodes.map((node) => {
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
    reorderNodes: (oldIndex, newIndex) => set((state) => {
        const list = [...state.nodes];
        const [moved] = list.splice(oldIndex, 1);
        list.splice(newIndex, 0, moved);
        return { nodes: list };
    }),
    reset: () => set({ nodes: [], selectedId: null })
}));
