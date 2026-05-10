import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
export default function TreeItem({ node, onNodeClick }) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = !!node.children?.length;
    const toggle = () => {
        if (hasChildren) {
            setIsOpen((v) => !v);
        }
        onNodeClick(node);
    };
    return (_jsxs("div", { style: { listStyle: "none", textAlign: "left" }, children: [_jsxs("div", { onClick: toggle, style: {
                    padding: "5px",
                    cursor: "pointer",
                    userSelect: "none",
                }, children: [_jsx("span", { style: { display: "inline-block", width: 14 }, children: hasChildren ? (isOpen ? "▼" : "▶") : "" }), node.name] }), isOpen && hasChildren && (_jsx("ul", { style: { marginLeft: 20, paddingLeft: 10, borderLeft: "1px dashed #bbb" }, children: node.children.map((child) => (_jsx("li", { children: _jsx(TreeItem, { node: child, onNodeClick: onNodeClick }) }, child.id))) }))] }));
}
