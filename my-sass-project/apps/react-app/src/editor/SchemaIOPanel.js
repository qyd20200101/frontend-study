import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// apps/react-app/src/editor/SchemaIOPanel.tsx
import { useState } from "react";
import { useDesignerStore } from "../store/designerStore";
export default function SchemaIOPanel() {
    const { exportSchema, importSchema, backupSchema, undoImport, hasBackup, saveToLocal, loadFromLocal, } = useDesignerStore();
    const [jsonText, setJsonText] = useState("");
    const [msg, setMsg] = useState("");
    const handleExport = async () => {
        const text = exportSchema();
        setJsonText(text);
        try {
            await navigator.clipboard.writeText(text);
            setMsg("导出成功，已复制到剪贴板");
        }
        catch {
            setMsg("导出成功（复制失败，请手动复制）");
        }
    };
    const handleImport = () => {
        backupSchema(); // 导入前自动备份
        const res = importSchema(jsonText);
        if (res.ok) {
            setMsg("导入成功（可点击“回滚导入”撤销）");
        }
        else {
            setMsg(`导入失败：${res.error}`);
        }
    };
    const handleUndo = () => {
        const ok = undoImport();
        setMsg(ok ? "已回滚到导入前版本" : "无可回滚快照");
    };
    const handleSaveLocal = () => {
        saveToLocal();
        setMsg("已保存到本地");
    };
    const handleLoadLocal = () => {
        const res = loadFromLocal();
        setMsg(res.ok ? "已从本地加载" : `加载失败：${res.error}`);
    };
    return (_jsxs("div", { style: { marginTop: 16, display: "grid", gap: 8 }, children: [_jsx("h4", { style: { margin: 0 }, children: "Schema \u5BFC\u5165 / \u5BFC\u51FA" }), _jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [_jsx("button", { onClick: handleExport, children: "\u5BFC\u51FA JSON" }), _jsx("button", { onClick: handleImport, children: "\u5BFC\u5165 JSON" }), _jsx("button", { onClick: handleUndo, disabled: !hasBackup, children: "\u56DE\u6EDA\u5BFC\u5165" })] }), _jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [_jsx("button", { onClick: handleSaveLocal, children: "\u4FDD\u5B58\u5230\u672C\u5730" }), _jsx("button", { onClick: handleLoadLocal, children: "\u4ECE\u672C\u5730\u52A0\u8F7D" })] }), _jsx("textarea", { value: jsonText, onChange: (e) => setJsonText(e.target.value), placeholder: "\u652F\u6301\u5BFC\u5165\uFF1A1) \u65E7\u6570\u7EC4\u683C\u5F0F[] 2) v1({version:1.0.0}) 3) v2({version:2.0.0})", style: {
                    width: "100%",
                    minHeight: 180,
                    fontFamily: "monospace",
                    fontSize: 12,
                } }), msg && _jsx("div", { style: { fontSize: 12, opacity: 0.85 }, children: msg })] }));
}
