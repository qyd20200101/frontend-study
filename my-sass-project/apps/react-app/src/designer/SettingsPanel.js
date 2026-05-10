import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useDesignerStore } from '../store/useDesignerStore';
export default function SettingsPanel() {
    const selectedId = useDesignerStore((state) => state.selectedId);
    const nodes = useDesignerStore((state) => state.nodes);
    const updateNode = useDesignerStore((state) => state.updateNode);
    // 递归查找选中的节点
    const findNode = (nodes, id) => {
        for (const node of nodes) {
            if (node.id === id)
                return node;
            if (node.children) {
                const found = findNode(node.children, id);
                if (found)
                    return found;
            }
        }
        return null;
    };
    const selectedNode = selectedId ? findNode(nodes, selectedId) : null;
    if (!selectedNode) {
        return (_jsxs("div", { style: { width: 300, borderLeft: '1px solid #eee', padding: 16 }, children: [_jsx("h3", { children: "\u5C5E\u6027\u8BBE\u7F6E (\u53F3\u4FA7\u9762\u677F)" }), _jsx("div", { style: { marginTop: 20, color: '#999', textAlign: 'center' }, children: "\u8BF7\u5728\u753B\u5E03\u4E2D\u9009\u4E2D\u4E00\u4E2A\u8282\u70B9" })] }));
    }
    const handlePropChange = (key, value) => {
        updateNode(selectedNode.id, { props: { [key]: value } });
    };
    const handleBaseChange = (key, value) => {
        updateNode(selectedNode.id, { [key]: value });
    };
    return (_jsxs("div", { style: { width: 300, borderLeft: '1px solid #eee', padding: 16 }, children: [_jsx("h3", { children: "\u5C5E\u6027\u8BBE\u7F6E" }), _jsxs("div", { style: { marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: 14 }, children: "\u7C7B\u578B (Type)" }), _jsx("input", { disabled: true, value: selectedNode.type, style: { width: '100%', padding: 6, backgroundColor: '#f5f5f5' } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: 14 }, children: "\u552F\u4E00\u6807\u8BC6 (ID)" }), _jsx("input", { disabled: true, value: selectedNode.id, style: { width: '100%', padding: 6, backgroundColor: '#f5f5f5' } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: 14 }, children: "\u6807\u9898 (Label)" }), _jsx("input", { value: selectedNode.label || '', onChange: (e) => handleBaseChange('label', e.target.value), style: { width: '100%', padding: 6 } })] }), selectedNode.props && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: 14 }, children: "\u7ED1\u5B9A\u5B57\u6BB5 (ModelKey)" }), _jsx("input", { value: selectedNode.props.modelKey || '', onChange: (e) => handlePropChange('modelKey', e.target.value), style: { width: '100%', padding: 6 } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: 14 }, children: "\u5360\u4F4D\u63D0\u793A (Placeholder)" }), _jsx("input", { value: selectedNode.props.placeholder || '', onChange: (e) => handlePropChange('placeholder', e.target.value), style: { width: '100%', padding: 6 } })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', marginBottom: 4, fontSize: 14 }, children: "\u663E\u9690\u6761\u4EF6 (VisibleOn)" }), _jsx("input", { value: selectedNode.props.visibleOn || '', onChange: (e) => handlePropChange('visibleOn', e.target.value), style: { width: '100%', padding: 6 }, placeholder: "\u4F8B\u5982: {role} === 'admin'" })] })] }))] })] }));
}
