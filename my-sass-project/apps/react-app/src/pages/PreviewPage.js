import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import FormRenderer from "../renderer/FormRenderer";
import { useDesignerStore } from "../store/designerStore";
export default function PreviewPage() {
    const [formData, setFormData] = useState({});
    const nodes = useDesignerStore((s) => s.nodes);
    // 防止意外直接引用修改，这里浅拷贝一次（必要时可深拷贝）
    const previewNodes = useMemo(() => JSON.parse(JSON.stringify(nodes)), [nodes]);
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsx("h2", { children: "\u9884\u89C8\u9875" }), _jsx(FormRenderer, { nodes: previewNodes, value: formData, onChange: (key, val) => setFormData((p) => ({ ...p, [key]: val })) }), _jsx("pre", { children: JSON.stringify(formData, null, 2) })] }));
}
