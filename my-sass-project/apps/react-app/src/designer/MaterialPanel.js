import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDesignerStore } from '../store/useDesignerStore';
import { defaultInputNode } from '@my-sass/core';
export default function MaterialPanel() {
    const addNode = useDesignerStore((state) => state.addNode);
    const handleAddInput = () => {
        // 模拟拖拽/点击添加节点，生成唯一ID
        const newNode = {
            ...defaultInputNode,
            id: `input_${Date.now()}`,
            props: {
                ...defaultInputNode.props,
                modelKey: `field_${Date.now()}` // 防止重复
            }
        };
        addNode(newNode);
    };
    return (_jsxs("div", { style: { width: 260, borderRight: '1px solid #eee', padding: 16 }, children: [_jsx("h3", { children: "\u7EC4\u4EF6\u5E93 (\u7269\u6599\u533A)" }), _jsx("div", { style: { marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }, children: _jsx("button", { onClick: handleAddInput, style: { padding: '8px 16px', cursor: 'pointer', textAlign: 'left' }, children: "+ \u6DFB\u52A0\u8F93\u5165\u6846 (Input)" }) })] }));
}
