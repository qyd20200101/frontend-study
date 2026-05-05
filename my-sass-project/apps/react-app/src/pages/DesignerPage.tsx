import { useMemo, useState } from "react";
import { useDesignerStore } from "../store/designerStore";
import Canvas from "../editor/Canvas";
import PropsPanel from "../editor/PropsPanel";
import {
  createInputNode,
  createSelectNode,
  createGroupNode,
} from "../editor/nodeFactory";

export default function DesignerPage() {
  const { addNode, selectedId, getSelectedNode } = useDesignerStore();

  // 用户可切换：true=始终顶层，false=智能(选中group就加到group)
  const [forceTopLevel, setForceTopLevel] = useState(false);

  const selectedNode = getSelectedNode();

  const targetInfo = useMemo(() => {
    if (forceTopLevel) {
      return {
        parentId: null as string | null,
        text: "将添加到：顶层（手动指定）",
        isGroup: false,
      };
    }

    if (selectedNode?.type === "group") {
      return {
        parentId: selectedNode.id,
        text: `将添加到：分组「${selectedNode.label || selectedNode.id}」`,
        isGroup: true,
      };
    }

    return {
      parentId: null as string | null,
      text: selectedId
        ? `当前选中非分组节点（${selectedNode?.type}），将添加到：顶层`
        : "当前未选中节点，将添加到：顶层",
      isGroup: false,
    };
  }, [forceTopLevel, selectedId, selectedNode]);

  const handleAdd = (type: "input" | "select" | "group") => {
    const parentId = targetInfo.parentId;
    const node =
      type === "input"
        ? createInputNode()
        : type === "select"
          ? createSelectNode()
          : createGroupNode();

    addNode(node, parentId);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr 340px",
        height: "100vh",
      }}
    >
      <aside style={{ borderRight: "1px solid #ddd", padding: 16 }}>
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
      </aside>

      <main style={{ padding: 16, overflow: "auto" }}>
        <Canvas />
      </main>

      <aside style={{ borderLeft: "1px solid #ddd", padding: 16 }}>
        <PropsPanel />
      </aside>
    </div>
  );
}
