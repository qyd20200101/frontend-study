// apps/react-app/src/editor/OptionsEditor.tsx
import { Button, Input, Space, Card, Typography } from "antd";
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

const { Text } = Typography;

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
    <Space orientation="vertical" style={{ width: "100%" }}>
      {options.map((opt, idx) => (
        <Card size="small" key={`${opt.value}-${idx}`} style={{ background: '#fcfcfc' }}>
          <Space orientation="vertical" style={{ width: '100%' }} size="small">
            <Input
              addonBefore="文案"
              size="small"
              value={opt.label}
              onChange={(e) => updateItem(idx, { label: e.target.value })}
            />
            <Input
              addonBefore="数值"
              size="small"
              value={opt.value}
              onChange={(e) => updateItem(idx, { value: e.target.value })}
            />
            <Space size="small" style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button size="small" icon={<ArrowUpOutlined />} onClick={() => moveItem(idx, "up")} disabled={idx === 0} />
              <Button size="small" icon={<ArrowDownOutlined />} onClick={() => moveItem(idx, "down")} disabled={idx === options.length - 1} />
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeItem(idx)} />
            </Space>
          </Space>
        </Card>
      ))}
      <Button block type="dashed" icon={<PlusOutlined />} onClick={addItem}>
        添加选项
      </Button>
    </Space>
  );
}
