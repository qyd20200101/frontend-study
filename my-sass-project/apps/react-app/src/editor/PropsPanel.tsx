import { useMemo } from "react";
import { useDesignerStore } from "../store/designerStore";
import OptionsEditor from "./OptionsEditor";

export default function PropsPanel() {
  const { selectedId, updateNode, getSelectedNode, removeNode } =
    useDesignerStore();
  const node = getSelectedNode();

  const fields = useMemo(() => {
    if (!node) return [];
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

  if (!selectedId || !node) return <div>请选择一个节点</div>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h3>属性面板</h3>

      {fields.includes("label") && (
        <label>
          标题
          <input
            value={node.label || ""}
            onChange={(e) => updateNode(node.id, { label: e.target.value })}
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>
      )}

      {fields.includes("modelKey") && (
        <label>
          modelKey
          <input
            value={node.props?.modelKey || ""}
            onChange={(e) =>
              updateNode(node.id, {
                props: { ...node.props, modelKey: e.target.value },
              })
            }
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>
      )}

      {fields.includes("placeholder") && (
        <label>
          placeholder
          <input
            value={node.props?.placeholder || ""}
            onChange={(e) =>
              updateNode(node.id, {
                props: { ...node.props, placeholder: e.target.value },
              })
            }
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>
      )}

      {fields.includes("options") && (
        <div>
          <div style={{ marginBottom: 6 }}>选项配置</div>
          <OptionsEditor
            value={node.props?.options || []}
            onChange={(nextOptions) =>
              updateNode(node.id, {
                props: { ...node.props, options: nextOptions },
              })
            }
          />
        </div>
      )}

      <button
        onClick={() => removeNode(node.id)}
        style={{
          background: "#ff4d4f",
          color: "#fff",
          border: 0,
          padding: "8px 10px",
        }}
      >
        删除节点
      </button>
    </div>
  );
}
