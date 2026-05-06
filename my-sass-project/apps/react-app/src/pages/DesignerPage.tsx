// apps/react-app/src/pages/DesignerPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useDesignerStore } from "../store/designerStore";
import Canvas from "../editor/Canvas";
import PropsPanel from "../editor/PropsPanel";
import SchemaIOPanel from "../editor/SchemaIOPanel";
import {
  createInputNode,
  createSelectNode,
  createGroupNode,
} from "../editor/nodeFactory";

export default function DesignerPage() {
  const {
    addNode,
    selectedId,
    getSelectedNode,
    loadFromLocal,
    saveToLocal,
    nodes,
  } = useDesignerStore();

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
        parentId: null as string | null,
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
      parentId: null as string | null,
      text: selectedId
        ? `当前选中非分组节点（${selectedNode?.type}），将添加到：顶层`
        : "当前未选中节点，将添加到：顶层",
    };
  }, [forceTopLevel, selectedId, selectedNode]);

  const handleAdd = (type: "input" | "select" | "group") => {
    const node =
      type === "input"
        ? createInputNode()
        : type === "select"
          ? createSelectNode()
          : createGroupNode();

    addNode(node, targetInfo.parentId);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr 340px",
        height: "100vh",
      }}
    >
      <aside
        style={{ borderRight: "1px solid #ddd", padding: 16, overflow: "auto" }}
      >
        <h3 style={{ marginTop: 0 }}>物料区</h3>

        <div
          style={{
            background: "#f6f8fa",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 10,
            marginBottom: 10,
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          <div>当前选中：{selectedId || "无"}</div>
          <div>{targetInfo.text}</div>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          <input
            type="checkbox"
            checked={forceTopLevel}
            onChange={(e) => setForceTopLevel(e.target.checked)}
          />
          始终添加到顶层
        </label>

        <div style={{ display: "grid", gap: 8 }}>
          <button onClick={() => handleAdd("input")}>+ 输入框</button>
          <button onClick={() => handleAdd("select")}>+ 下拉框</button>
          <button onClick={() => handleAdd("group")}>+ 分组</button>
        </div>

        <SchemaIOPanel />
      </aside>

      <main style={{ padding: 16, overflow: "auto" }}>
        <Canvas />
      </main>

      <aside
        style={{ borderLeft: "1px solid #ddd", padding: 16, overflow: "auto" }}
      >
        <PropsPanel />
      </aside>
    </div>
  );
}
