// apps/react-app/src/editor/PropsPanel.tsx
import { useMemo } from "react";
import { useDesignerStore } from "../store/designerStore";
import OptionsEditor from "./OptionsEditor";
import { Card, Input, Button, Typography, Space, Divider, Alert } from "antd";

const { Text } = Typography;

export default function PropsPanel() {
  const { selectedId, updateNode, getSelectedNode, removeNode } =
    useDesignerStore();
  const node = getSelectedNode();

  const fields = useMemo(() => {
    if (!node) return [];
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

  if (!selectedId || !node) return (
    <Card style={{ textAlign: 'center', color: '#999', background: '#fafafa' }}>
      请在画布中选择一个节点进行编辑
    </Card>
  );

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section>
        <Text strong>基础配置</Text>
        <div style={{ marginTop: 12, display: 'grid', gap: 16 }}>
          {fields.includes("label") && (
            <label>
              <Text type="secondary" style={{fontSize: 12}}>显示标题</Text>
              <Input
                value={node.label || ""}
                onChange={(e) => updateNode(node.id, { label: e.target.value })}
                style={{ marginTop: 4 }}
              />
            </label>
          )}

          {fields.includes("modelKey") && (
            <label>
              <Text type="secondary" style={{fontSize: 12}}>字段标识 (modelKey)</Text>
              <Input
                value={node.props?.modelKey || ""}
                onChange={(e) =>
                  updateNode(node.id, {
                    props: { ...node.props, modelKey: e.target.value },
                  })
                }
                style={{ marginTop: 4 }}
              />
            </label>
          )}

          {fields.includes("placeholder") && (
            <label>
              <Text type="secondary" style={{fontSize: 12}}>提示文本</Text>
              <Input
                value={node.props?.placeholder || ""}
                onChange={(e) =>
                  updateNode(node.id, {
                    props: { ...node.props, placeholder: e.target.value },
                  })
                }
                style={{ marginTop: 4 }}
              />
            </label>
          )}
        </div>
      </section>

      {fields.includes("options") && (
        <section>
          <Divider />
          <Text strong>选项列表</Text>
          <div style={{ marginTop: 12 }}>
            <OptionsEditor
              value={node.props?.options || []}
              onChange={(nextOptions) =>
                updateNode(node.id, {
                  props: { ...node.props, options: nextOptions },
                })
              }
            />
          </div>
        </section>
      )}

      <section>
        <Divider />
        <Text strong>动态显示逻辑</Text>
        <div style={{ marginTop: 12 }}>
          <label>
            <Text type="secondary" style={{fontSize: 12}}>可见性表达式 (JS)</Text>
            <Input.TextArea
              rows={3}
              placeholder="例如: status === 'active' 或 budget > 1000"
              value={node.visibility || ""}
              onChange={(e) => updateNode(node.id, { visibility: e.target.value })}
              style={{ marginTop: 4, fontFamily: 'monospace' }}
            />
          </label>
          <Alert 
            message="使用 context 变量访问表单数据" 
            type="info" 
            showIcon 
            style={{ marginTop: 8, fontSize: '11px' }} 
          />
        </div>
      </section>

      <div style={{ marginTop: 20 }}>
        <Button
          danger
          block
          type="primary"
          onClick={() => removeNode(node.id)}
        >
          删除当前节点
        </Button>
      </div>
    </div>
  );
}
