import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDesignerStore } from '../store/useDesignerStore';
import FormRenderer from '../renderer/FormRenderer';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// 拖拽和选中的包装器
function SortableNodeWrapper({ node, children }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: node.id });
    const selectedNodeId = useDesignerStore((state) => state.selectedId);
    const selectNode = useDesignerStore((state) => state.setSelectedId);
    const isSelected = selectedNodeId === node.id;
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        border: isSelected ? '2px solid #1890ff' : '2px dashed transparent',
        padding: 8,
        marginBottom: 8,
        position: 'relative',
        backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
        cursor: 'move',
    };
    return (_jsx("div", { ref: setNodeRef, style: style, ...attributes, ...listeners, onClick: (e) => {
            e.stopPropagation();
            selectNode(node.id);
        }, children: children }));
}
export default function CanvasPanel() {
    const nodes = useDesignerStore((state) => state.nodes);
    const reorderNodes = useDesignerStore((state) => state.reorderNodes);
    const selectNode = useDesignerStore((state) => state.setSelectedId);
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 5 }, // 区分点击和拖拽
    }));
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = nodes.findIndex((n) => n.id === active.id);
            const newIndex = nodes.findIndex((n) => n.id === over.id);
            reorderNodes(oldIndex, newIndex);
        }
    };
    return (_jsxs("div", { style: { flex: 1, backgroundColor: '#f5f5f5', padding: 24, overflow: 'auto' }, onClick: () => selectNode(null), children: [_jsx("div", { style: { backgroundColor: '#fff', minHeight: 600, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }, children: nodes.length === 0 ? (_jsx("div", { style: { textAlign: 'center', color: '#999', marginTop: 100 }, children: "\u8BF7\u4ECE\u5DE6\u4FA7\u70B9\u51FB\u6DFB\u52A0\u7EC4\u4EF6" })) : (_jsx(DndContext, { sensors: sensors, collisionDetection: closestCenter, onDragEnd: handleDragEnd, children: _jsx(SortableContext, { items: nodes.map((n) => n.id), strategy: verticalListSortingStrategy, children: _jsx(FormRenderer, { nodes: nodes, value: {}, onChange: () => { }, nodeWrapper: (node, element) => (_jsx(SortableNodeWrapper, { node: node, children: element }, node.id)) }) }) })) }), _jsxs("div", { style: { marginTop: 24, padding: 16, backgroundColor: '#333', color: '#fff', borderRadius: 8 }, children: [_jsx("h4", { children: "\u5F53\u524D Schema \u6570\u636E (\u53EA\u8BFB)" }), _jsx("pre", { style: { fontSize: 12 }, children: JSON.stringify(nodes, null, 2) })] })] }));
}
