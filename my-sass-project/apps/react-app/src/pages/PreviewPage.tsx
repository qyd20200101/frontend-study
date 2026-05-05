import FormRenderer from "../renderer/FormRenderer";
import { useMemo, useState } from "react";
import type { BaseNode } from "@my-sass/core";
export default function PreviewPage() {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const nodes = useMemo<BaseNode[]>(() => {
    const raw = sessionStorage.getItem("preview_schema");
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, []);
  return (
    <div style={{ padding: 24 }}>
      <h2>预览页</h2>
      <FormRenderer
        nodes={nodes}
        value={formData}
        onChange={(Key, val) => setFormData((p) => ({ ...p, [Key]: val }))}
      />
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </div>
  );
}
