import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, useDroppable, } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import FormRenderer from "../renderer/FormRenderer";
import { useDesignerStore, ROOT_CONTAINER_ID, groupContainerId, } from "../store/designerStore";
function RootDropZone() {
    const { setNodeRef, isOver } = useDroppable({ id: ROOT_CONTAINER_ID });
    return (_jsx("div", { ref: setNodeRef, style: {
            border: isOver ? "2px dashed #1677ff" : "1px dashed #999",
            borderRadius: 8,
            padding: 10,
            marginBottom: 12,
            background: isOver ? "rgba(22,119,255,0.08)" : "transparent",
            fontSize: 12,
        }, children: isOver ? "松开：移动到顶层" : "拖到这里：移动到顶层" }));
}
function GroupDropZone({ groupId, children, }) {
    const { setNodeRef, isOver } = useDroppable({ id: groupId });
    return (_jsxs("div", { ref: setNodeRef, style: {
            border: isOver ? "2px dashed #52c41a" : "1px dashed #888",
            borderRadius: 8,
            padding: 8,
            marginTop: 6,
            background: isOver ? "rgba(82,196,26,0.08)" : "transparent",
        }, children: [_jsx("div", { style: { fontSize: 12, opacity: 0.7, marginBottom: 6 }, children: isOver ? "松开以放入该分组" : "可拖入该分组" }), children] }));
}
function SortableItem({ node, containerId, selected, onSelect, children, }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: node.id,
        data: { containerId },
    });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        border: selected ? "1px solid #4096ff" : "1px solid transparent",
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
        background: "#1f1f1f",
    };
    return (_jsxs("div", { ref: setNodeRef, style: style, onClick: (e) => {
            e.stopPropagation();
            onSelect(node.id);
        }, children: [_jsx("div", { style: { fontSize: 12, opacity: 0.7, marginBottom: 6, cursor: "grab" }, ...attributes, ...listeners, children: "\u283F \u62D6\u62FD" }), children] }));
}
function GroupChildren({ groupNode, selectedId, setSelectedId, }) {
    const children = groupNode.children ?? [];
    const containerId = groupContainerId(groupNode.id);
    return (_jsx(SortableContext, { items: children.map((c) => c.id), strategy: verticalListSortingStrategy, children: children.length === 0 ? (_jsx("div", { style: { fontSize: 12, opacity: 0.65 }, children: "\uFF08\u5206\u7EC4\u5185\u6682\u65E0\u5B57\u6BB5\uFF09" })) : (children.map((child) => (_jsx(SortableItem, { node: child, containerId: containerId, selected: selectedId === child.id, onSelect: setSelectedId, children: _jsx(FormRenderer, { nodes: [child], value: {}, onChange: () => { } }) }, child.id)))) }));
}
export default function Canvas() {
    const { nodes, selectedId, setSelectedId, findNodeById, reorderInContainer, moveBetweenContainers, moveBetweenContainers: moveNode, // 别名仅为可读性
     } = useDesignerStore();
    const sensors = useSensors(useSensor(PointerSensor));
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id)
            return;
        const fromContainerId = active.data.current?.containerId;
        // 1) 目标是 root 回收区
        if (String(over.id) === ROOT_CONTAINER_ID) {
            if (fromContainerId) {
                moveNode(fromContainerId, ROOT_CONTAINER_ID, String(active.id));
            }
            return;
        }
        // 2) 目标是 group 节点壳（droppable id = groupId）
        const overNode = findNodeById(String(over.id));
        if (overNode?.type === "group") {
            if (fromContainerId) {
                moveNode(fromContainerId, groupContainerId(overNode.id), String(active.id));
            }
            return;
        }
        // 3) over 在 sortable item 上（可能是 root 容器、也可能是 group 容器）
        const toContainerId = over.data.current?.containerId;
        if (!fromContainerId || !toContainerId)
            return;
        if (fromContainerId === toContainerId) {
            // 同容器排序
            const list = toContainerId === ROOT_CONTAINER_ID
                ? nodes
                : (findNodeById(toContainerId.replace("group:", ""))?.children ?? []);
            const oldIndex = list.findIndex((n) => n.id === active.id);
            const newIndex = list.findIndex((n) => n.id === over.id);
            if (oldIndex >= 0 && newIndex >= 0) {
                reorderInContainer(toContainerId, oldIndex, newIndex);
            }
        }
        else {
            // 跨容器移动（按 overId 插入）
            moveBetweenContainers(fromContainerId, toContainerId, String(active.id), String(over.id));
        }
    };
    return (_jsxs(DndContext, { sensors: sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd, children: [_jsx(RootDropZone, {}), _jsx(SortableContext, { items: nodes.map((n) => n.id), strategy: verticalListSortingStrategy, children: nodes.map((node) => (_jsx(SortableItem, { node: node, containerId: ROOT_CONTAINER_ID, selected: selectedId === node.id, onSelect: setSelectedId, children: node.type === "group" ? (_jsxs(GroupDropZone, { groupId: node.id, children: [_jsx(FormRenderer, { nodes: [{ ...node, children: [] }], value: {}, onChange: () => { } }), _jsx("div", { style: { marginTop: 8 }, children: _jsx(GroupChildren, { groupNode: node, selectedId: selectedId, setSelectedId: setSelectedId }) })] })) : (_jsx(FormRenderer, { nodes: [node], value: {}, onChange: () => { } })) }, node.id))) })] }));
}
