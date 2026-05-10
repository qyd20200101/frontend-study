import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// apps/react-app/src/editor/PropsPanel.tsx
import { useMemo } from "react";
import { useDesignerStore } from "../store/designerStore";
import OptionsEditor from "./OptionsEditor";
import { Card, Input, Button, Typography, Divider, Alert } from "antd";
const { Text } = Typography;
export default function PropsPanel() {
    const { selectedId, updateNode, getSelectedNode, removeNode } = useDesignerStore();
    const node = getSelectedNode();
    const fields = useMemo(() => {
        if (!node)
            return [];
        switch (node.type) {
            case "input":
                return ["label", "modelKey", "placeholder", "visibility"];
            case "select":
                return ["label", "modelKey", "options", "visibility"];
            case "group":
                return ["label", "visibility"];
            default:
                return ["label"];
        }
    }, [node]);
    if (!selectedId || !node)
        return (_jsx(Card, { style: { textAlign: 'center', color: '#999', background: '#fafafa' }, children: "\u8BF7\u5728\u753B\u5E03\u4E2D\u9009\u62E9\u4E00\u4E2A\u8282\u70B9\u8FDB\u884C\u7F16\u8F91" }));
    return (_jsxs("div", { style: { display: "grid", gap: 20 }, children: [_jsxs("section", { children: [_jsx(Text, { strong: true, children: "\u57FA\u7840\u914D\u7F6E" }), _jsxs("div", { style: { marginTop: 12, display: 'grid', gap: 16 }, children: [fields.includes("label") && (_jsxs("label", { children: [_jsx(Text, { type: "secondary", style: { fontSize: 12 }, children: "\u663E\u793A\u6807\u9898" }), _jsx(Input, { value: node.label || "", onChange: (e) => updateNode(node.id, { label: e.target.value }), style: { marginTop: 4 } })] })), fields.includes("modelKey") && (_jsxs("label", { children: [_jsx(Text, { type: "secondary", style: { fontSize: 12 }, children: "\u5B57\u6BB5\u6807\u8BC6 (modelKey)" }), _jsx(Input, { value: node.props?.modelKey || "", onChange: (e) => updateNode(node.id, {
                                            props: { ...node.props, modelKey: e.target.value },
                                        }), style: { marginTop: 4 } })] })), fields.includes("placeholder") && (_jsxs("label", { children: [_jsx(Text, { type: "secondary", style: { fontSize: 12 }, children: "\u63D0\u793A\u6587\u672C" }), _jsx(Input, { value: node.props?.placeholder || "", onChange: (e) => updateNode(node.id, {
                                            props: { ...node.props, placeholder: e.target.value },
                                        }), style: { marginTop: 4 } })] }))] })] }), fields.includes("options") && (_jsxs("section", { children: [_jsx(Divider, {}), _jsx(Text, { strong: true, children: "\u9009\u9879\u5217\u8868" }), _jsx("div", { style: { marginTop: 12 }, children: _jsx(OptionsEditor, { value: node.props?.options || [], onChange: (nextOptions) => updateNode(node.id, {
                                props: { ...node.props, options: nextOptions },
                            }) }) })] })), _jsxs("section", { children: [_jsx(Divider, {}), _jsx(Text, { strong: true, children: "\u52A8\u6001\u663E\u793A\u903B\u8F91" }), _jsxs("div", { style: { marginTop: 12 }, children: [_jsxs("label", { children: [_jsx(Text, { type: "secondary", style: { fontSize: 12 }, children: "\u53EF\u89C1\u6027\u8868\u8FBE\u5F0F (JS)" }), _jsx(Input.TextArea, { rows: 3, placeholder: "\u4F8B\u5982: status === 'active' \u6216 budget > 1000", value: node.visibility || "", onChange: (e) => updateNode(node.id, { visibility: e.target.value }), style: { marginTop: 4, fontFamily: 'monospace' } })] }), _jsx(Alert, { message: "\u4F7F\u7528 context \u53D8\u91CF\u8BBF\u95EE\u8868\u5355\u6570\u636E", type: "info", showIcon: true, style: { marginTop: 8, fontSize: '11px' } })] })] }), _jsx("div", { style: { marginTop: 20 }, children: _jsx(Button, { danger: true, block: true, type: "primary", onClick: () => removeNode(node.id), children: "\u5220\u9664\u5F53\u524D\u8282\u70B9" }) })] }));
}
