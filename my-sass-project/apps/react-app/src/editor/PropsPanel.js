import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useDesignerStore } from "../store/designerStore";
import OptionsEditor from "./OptionsEditor";
export default function PropsPanel() {
    const { selectedId, updateNode, getSelectedNode, removeNode } = useDesignerStore();
    const node = getSelectedNode();
    const fields = useMemo(() => {
        if (!node)
            return [];
        switch (node.type) {
            case "input":
                return ["label", "modelKey", "placeholder"];
            case "select":
                return ["label", "modelKey", "options"];
            case "group":
                return ["label"];
            default:
                return ["label"];
        }
    }, [node]);
    if (!selectedId || !node)
        return _jsx("div", { children: "\u8BF7\u9009\u62E9\u4E00\u4E2A\u8282\u70B9" });
    return (_jsxs("div", { style: { display: "grid", gap: 12 }, children: [_jsx("h3", { children: "\u5C5E\u6027\u9762\u677F" }), fields.includes("label") && (_jsxs("label", { children: ["\u6807\u9898", _jsx("input", { value: node.label || "", onChange: (e) => updateNode(node.id, { label: e.target.value }), style: { width: "100%", marginTop: 4 } })] })), fields.includes("modelKey") && (_jsxs("label", { children: ["modelKey", _jsx("input", { value: node.props?.modelKey || "", onChange: (e) => updateNode(node.id, {
                            props: { ...node.props, modelKey: e.target.value },
                        }), style: { width: "100%", marginTop: 4 } })] })), fields.includes("placeholder") && (_jsxs("label", { children: ["placeholder", _jsx("input", { value: node.props?.placeholder || "", onChange: (e) => updateNode(node.id, {
                            props: { ...node.props, placeholder: e.target.value },
                        }), style: { width: "100%", marginTop: 4 } })] })), fields.includes("options") && (_jsxs("div", { children: [_jsx("div", { style: { marginBottom: 6 }, children: "\u9009\u9879\u914D\u7F6E" }), _jsx(OptionsEditor, { value: node.props?.options || [], onChange: (nextOptions) => updateNode(node.id, {
                            props: { ...node.props, options: nextOptions },
                        }) })] })), _jsx("button", { onClick: () => removeNode(node.id), style: {
                    background: "#ff4d4f",
                    color: "#fff",
                    border: 0,
                    padding: "8px 10px",
                }, children: "\u5220\u9664\u8282\u70B9" })] }));
}
