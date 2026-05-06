// apps/react-app/src/editor/SchemaIOPanel.tsx
import { useState } from "react";
import { useDesignerStore } from "../store/designerStore";

export default function SchemaIOPanel() {
  const {
    exportSchema,
    importSchema,
    backupSchema,
    undoImport,
    hasBackup,
    saveToLocal,
    loadFromLocal,
  } = useDesignerStore();

  const [jsonText, setJsonText] = useState("");
  const [msg, setMsg] = useState("");

  const handleExport = async () => {
    const text = exportSchema();
    setJsonText(text);
    try {
      await navigator.clipboard.writeText(text);
      setMsg("导出成功，已复制到剪贴板");
    } catch {
      setMsg("导出成功（复制失败，请手动复制）");
    }
  };

  const handleImport = () => {
    backupSchema(); // 导入前自动备份
    const res = importSchema(jsonText);
    if (res.ok) {
      setMsg("导入成功（可点击“回滚导入”撤销）");
    } else {
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

  return (
    <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
      <h4 style={{ margin: 0 }}>Schema 导入 / 导出</h4>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={handleExport}>导出 JSON</button>
        <button onClick={handleImport}>导入 JSON</button>
        <button onClick={handleUndo} disabled={!hasBackup}>
          回滚导入
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={handleSaveLocal}>保存到本地</button>
        <button onClick={handleLoadLocal}>从本地加载</button>
      </div>

      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder="支持导入：1) 旧数组格式[] 2) v1({version:1.0.0}) 3) v2({version:2.0.0})"
        style={{
          width: "100%",
          minHeight: 180,
          fontFamily: "monospace",
          fontSize: 12,
        }}
      />

      {msg && <div style={{ fontSize: 12, opacity: 0.85 }}>{msg}</div>}
    </div>
  );
}
