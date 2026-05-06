import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// apps/react-app/src/pages/DesignerPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useDesignerStore } from "../store/designerStore";
import Canvas from "../editor/Canvas";
import PropsPanel from "../editor/PropsPanel";
import SchemaIOPanel from "../editor/SchemaIOPanel";
import { createInputNode, createSelectNode, createGroupNode, } from "../editor/nodeFactory";
export default function DesignerPage() {
    const { addNode, selectedId, getSelectedNode, loadFromLocal, saveToLocal, nodes, } = useDesignerStore();
    const [forceTopLevel, setForceTopLevel] = useState(false);
    // 首次加载：恢复本地草稿
    useEffect(() => {
        loadFromLocal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // 自动保存（简单 debounce）
    useEffect(() => {
        const t = setTimeout(() => {
            saveToLocal();
        }, 500);
        return () => clearTimeout(t);
    }, [nodes, saveToLocal]);
    const selectedNode = getSelectedNode();
    const targetInfo = useMemo(() => {
        if (forceTopLevel) {
            return {
                parentId: null,
                text: "将添加到：顶层（手动指定）",
            };
        }
        if (selectedNode?.type === "group") {
            return {
                parentId: selectedNode.id,
                text: `将添加到：分组「${selectedNode.label || selectedNode.id}」`,
            };
        }
        return {
            parentId: null,
            text: selectedId
                ? `当前选中非分组节点（${selectedNode?.type}），将添加到：顶层`
                : "当前未选中节点，将添加到：顶层",
        };
    }, [forceTopLevel, selectedId, selectedNode]);
    const handleAdd = (type) => {
        const node = type === "input"
            ? createInputNode()
            : type === "select"
                ? createSelectNode()
                : createGroupNode();
        addNode(node, targetInfo.parentId);
    };
    return (_jsxs("div", { style: {
            display: "grid",
            gridTemplateColumns: "260px 1fr 340px",
            height: "100vh",
        }, children: [_jsxs("aside", { style: { borderRight: "1px solid #ddd", padding: 16, overflow: "auto" }, children: [_jsx("h3", { style: { marginTop: 0 }, children: "\u7269\u6599\u533A" }), _jsxs("div", { style: {
                            background: "#f6f8fa",
                            border: "1px solid #e5e7eb",
                            borderRadius: 8,
                            padding: 10,
                            marginBottom: 10,
                            fontSize: 12,
                            lineHeight: 1.6,
                        }, children: [_jsxs("div", { children: ["\u5F53\u524D\u9009\u4E2D\uFF1A", selectedId || "无"] }), _jsx("div", { children: targetInfo.text })] }), _jsxs("label", { style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 12,
                            fontSize: 13,
                        }, children: [_jsx("input", { type: "checkbox", checked: forceTopLevel, onChange: (e) => setForceTopLevel(e.target.checked) }), "\u59CB\u7EC8\u6DFB\u52A0\u5230\u9876\u5C42"] }), _jsxs("div", { style: { display: "grid", gap: 8 }, children: [_jsx("button", { onClick: () => handleAdd("input"), children: "+ \u8F93\u5165\u6846" }), _jsx("button", { onClick: () => handleAdd("select"), children: "+ \u4E0B\u62C9\u6846" }), _jsx("button", { onClick: () => handleAdd("group"), children: "+ \u5206\u7EC4" })] }), _jsx(SchemaIOPanel, {})] }), _jsx("main", { style: { padding: 16, overflow: "auto" }, children: _jsx(Canvas, {}) }), _jsx("aside", { style: { borderLeft: "1px solid #ddd", padding: 16, overflow: "auto" }, children: _jsx(PropsPanel, {}) })] }));
}
