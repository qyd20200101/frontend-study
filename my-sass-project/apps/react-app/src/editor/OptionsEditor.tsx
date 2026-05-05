interface OptionItem {
  label: string;
  value: string;
}

interface Props {
  value?: OptionItem[];
  onChange: (next: OptionItem[]) => void;
}

export default function OptionsEditor({ value = [], onChange }: Props) {
  const options = Array.isArray(value) ? value : [];

  const updateItem = (index: number, patch: Partial<OptionItem>) => {
    const next = options.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    );
    onChange(next);
  };
  const addItem = () => {
    onChange([
      ...options,
      { label: `选项${options.length + 1}`, value: `option_${Date.now()}` },
    ]);
  };
  const removeItem = (index: number) => {
    const next = options.filter((_, i) => i !== index);
    onChange(next);
  };
  const moveItem = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= options.length) return;
    const next = [...options];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {options.map((opt, idx) => (
        <div
          key={`${opt.value}-${idx}`}
          style={{
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: 8,
            display: "grid",
            gap: 6,
          }}
        >
          <label>
            文案(label)
            <input
              value={opt.label}
              onChange={(e) => updateItem(idx, { label: e.target.value })}
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
          <label>
            值(value)
            <input
              value={opt.value}
              onChange={(e) => updateItem(idx, { value: e.target.value })}
              style={{ width: "100%", marginTop: 4 }}
            />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => moveItem(idx, "up")}>
              上移
            </button>
            <button type="button" onClick={() => moveItem(idx, "down")}>
              下移
            </button>
            <button
              type="button"
              onClick={() => removeItem(idx)}
              style={{
                color: "#fff",
                background: "#ff4d4f",
                border: 0,
                padding: "4px 8px",
              }}
            >
              删除
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addItem}>
        + 添加选项
      </button>
    </div>
  );
}
