// apps/react-app/src/store/designerStore.ts
import { create } from "zustand";
import { normalizeSchema, SCHEMA_TYPE, CURRENT_SCHEMA_VERSION, } from "./schemaMigrations";
export const ROOT_CONTAINER_ID = "__ROOT__";
export const groupContainerId = (groupId) => `group:${groupId}`;
export const parseGroupId = (containerId) => containerId.startsWith("group:") ? containerId.replace("group:", "") : null;
const LOCAL_KEY = "my_sass_designer_schema_v1";
function deepClone(v) {
    return JSON.parse(JSON.stringify(v));
}
function findNode(list, id) {
    for (const n of list) {
        if (n.id === id)
            return n;
        if (n.children?.length) {
            const hit = findNode(n.children, id);
            if (hit)
                return hit;
        }
    }
    return null;
}
function containsNode(root, targetId) {
    if (root.id === targetId)
        return true;
    return !!root.children?.some((c) => containsNode(c, targetId));
}
function removeNodeFromTree(list, nodeId) {
    let removed = null;
    const walk = (arr) => arr
        .filter((n) => {
        if (n.id === nodeId) {
            removed = n;
            return false;
        }
        return true;
    })
        .map((n) => n.children?.length ? { ...n, children: walk(n.children) } : n);
    return [walk(list), removed];
}
function insertIntoContainer(tree, containerId, node, overId) {
    if (containerId === ROOT_CONTAINER_ID) {
        const next = [...tree];
        if (!overId) {
            next.push(node);
            return next;
        }
        const idx = next.findIndex((n) => n.id === overId);
        if (idx < 0)
            next.push(node);
        else
            next.splice(idx, 0, node);
        return next;
    }
    const gid = parseGroupId(containerId);
    if (!gid)
        return tree;
    const walk = (arr) => arr.map((n) => {
        if (n.id === gid && n.type === "group") {
            const children = [...(n.children ?? [])];
            if (!overId)
                children.push(node);
            else {
                const idx = children.findIndex((c) => c.id === overId);
                if (idx < 0)
                    children.push(node);
                else
                    children.splice(idx, 0, node);
            }
            return { ...n, children };
        }
        if (n.children?.length)
            return { ...n, children: walk(n.children) };
        return n;
    });
    return walk(tree);
}
function reorderArray(arr, oldIndex, newIndex) {
    const next = [...arr];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    return next;
}
export const useDesignerStore = create((set, get) => ({
    nodes: [],
    selectedId: null,
    previewVersion: 0,
    setNodes: (nodes) => set({ nodes }),
    setSelectedId: (id) => set({ selectedId: id }),
    getSelectedNode: () => {
        const { nodes, selectedId } = get();
        if (!selectedId)
            return null;
        return findNode(nodes, selectedId);
    },
    findNodeById: (id) => findNode(get().nodes, id),
    updateNode: (id, patch) => set((state) => {
        const walk = (arr) => arr.map((n) => {
            if (n.id === id) {
                return {
                    ...n,
                    ...patch,
                    props: { ...n.props, ...patch.props },
                };
            }
            if (n.children?.length)
                return { ...n, children: walk(n.children) };
            return n;
        });
        return { nodes: walk(state.nodes) };
    }),
    addNode: (node, parentId = null) => set((state) => {
        if (!parentId)
            return { nodes: [...state.nodes, node] };
        const walk = (arr) => arr.map((n) => {
            if (n.id === parentId && n.type === "group") {
                return { ...n, children: [...(n.children ?? []), node] };
            }
            if (n.children?.length)
                return { ...n, children: walk(n.children) };
            return n;
        });
        return { nodes: walk(state.nodes) };
    }),
    removeNode: (id) => set((state) => {
        const [next] = removeNodeFromTree(state.nodes, id);
        return {
            nodes: next,
            selectedId: state.selectedId === id ? null : state.selectedId,
        };
    }),
    reorderInContainer: (containerId, oldIndex, newIndex) => set((state) => {
        if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0) {
            return { nodes: state.nodes };
        }
        if (containerId === ROOT_CONTAINER_ID) {
            return { nodes: reorderArray(state.nodes, oldIndex, newIndex) };
        }
        const gid = parseGroupId(containerId);
        if (!gid)
            return { nodes: state.nodes };
        const walk = (arr) => arr.map((n) => {
            if (n.id === gid && n.type === "group") {
                return {
                    ...n,
                    children: reorderArray(n.children ?? [], oldIndex, newIndex),
                };
            }
            if (n.children?.length)
                return { ...n, children: walk(n.children) };
            return n;
        });
        return { nodes: walk(state.nodes) };
    }),
    moveBetweenContainers: (fromContainerId, toContainerId, nodeId, overId) => set((state) => {
        const [treeWithoutNode, movingNode] = removeNodeFromTree(state.nodes, nodeId);
        if (!movingNode)
            return { nodes: state.nodes };
        const toGroupId = parseGroupId(toContainerId);
        if (toGroupId && containsNode(movingNode, toGroupId)) {
            // 防止拖入自身/子树
            return { nodes: state.nodes };
        }
        const nextTree = insertIntoContainer(treeWithoutNode, toContainerId, movingNode, overId);
        return { nodes: nextTree };
    }),
    markPreviewVersion: () => set((s) => ({ previewVersion: s.previewVersion + 1 })),
    setSchema: (nodes) => set({ nodes, selectedId: null }),
    exportSchema: () => {
        const { nodes } = get();
        const payload = {
            version: CURRENT_SCHEMA_VERSION,
            type: SCHEMA_TYPE,
            meta: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                source: "designer",
            },
            nodes,
        };
        return JSON.stringify(payload, null, 2);
    },
    importSchema: (jsonText) => {
        try {
            const parsed = JSON.parse(jsonText);
            const normalized = normalizeSchema(parsed);
            if (!normalized.ok)
                return { ok: false, error: normalized.error };
            const nodes = normalized.data.nodes;
            // 如果你有 validateNodes，可继续保留
            set({
                nodes: JSON.parse(JSON.stringify(nodes)),
                selectedId: null,
            });
            return { ok: true };
        }
        catch (e) {
            return { ok: false, error: `JSON 解析失败: ${e instanceof Error ? e.message : "未知错误"}` };
        }
    },
    backupSchema: () => {
        const nodes = get().nodes;
        set({
            _backupNodes: deepClone(nodes),
            hasBackup: true,
        });
    },
    undoImport: () => {
        const { _backupNodes, hasBackup } = get();
        if (!hasBackup || !_backupNodes)
            return false;
        set({
            nodes: deepClone(_backupNodes),
            selectedId: null,
            hasBackup: false,
            _backupNodes: null,
        });
        return true;
    },
    hasBackup: false,
    _backupNodes: null,
    saveToLocal: () => {
        try {
            const payload = get().exportSchema();
            localStorage.setItem(LOCAL_KEY, payload);
        }
        catch {
            // ignore
        }
    },
    loadFromLocal: () => {
        try {
            const text = localStorage.getItem(LOCAL_KEY);
            if (!text)
                return { ok: true };
            return get().importSchema(text);
        }
        catch (e) {
            return { ok: false, error: `本地加载失败: ${e instanceof Error ? e.message : "未知错误"}` };
        }
    },
    reset: () => set({ nodes: [], selectedId: null }),
}));
