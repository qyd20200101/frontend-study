import { useMemo, useState } from "react";
import FormRenderer from "../renderer/FormRenderer";
import { useDesignerStore } from "../store/designerStore";

export default function PreviewPage() {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const nodes = useDesignerStore((s) => s.nodes);

  // 防止意外直接引用修改，这里浅拷贝一次（必要时可深拷贝）
  const previewNodes = useMemo(
    () => JSON.parse(JSON.stringify(nodes)),
    [nodes],
  );

  return (
    <div style={{ padding: 24 }}>
      <h2>预览页</h2>
      <FormRenderer
        nodes={previewNodes}
        value={formData}
        onChange={(key, val) => setFormData((p) => ({ ...p, [key]: val }))}
      />
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </div>
  );
}
