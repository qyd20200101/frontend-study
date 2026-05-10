import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// apps/react-app/src/editor/OptionsEditor.tsx
import { Button, Input, Space, Card, Typography } from "antd";
import { PlusOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
const { Text } = Typography;
export default function OptionsEditor({ value = [], onChange }) {
    const options = Array.isArray(value) ? value : [];
    const updateItem = (index, patch) => {
        const next = options.map((item, i) => i === index ? { ...item, ...patch } : item);
        onChange(next);
    };
    const addItem = () => {
        onChange([
            ...options,
            { label: `选项${options.length + 1}`, value: `option_${Date.now()}` },
        ]);
    };
    const removeItem = (index) => {
        const next = options.filter((_, i) => i !== index);
        onChange(next);
    };
    const moveItem = (index, direction) => {
        const target = direction === "up" ? index - 1 : index + 1;
        if (target < 0 || target >= options.length)
            return;
        const next = [...options];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };
    return (_jsxs(Space, { direction: "vertical", style: { width: "100%" }, children: [options.map((opt, idx) => (_jsx(Card, { size: "small", style: { background: '#fcfcfc' }, children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, size: "small", children: [_jsx(Input, { addonBefore: "\u6587\u6848", size: "small", value: opt.label, onChange: (e) => updateItem(idx, { label: e.target.value }) }), _jsx(Input, { addonBefore: "\u6570\u503C", size: "small", value: opt.value, onChange: (e) => updateItem(idx, { value: e.target.value }) }), _jsxs(Space, { size: "small", style: { width: '100%', justifyContent: 'flex-end' }, children: [_jsx(Button, { size: "small", icon: _jsx(ArrowUpOutlined, {}), onClick: () => moveItem(idx, "up"), disabled: idx === 0 }), _jsx(Button, { size: "small", icon: _jsx(ArrowDownOutlined, {}), onClick: () => moveItem(idx, "down"), disabled: idx === options.length - 1 }), _jsx(Button, { size: "small", danger: true, icon: _jsx(DeleteOutlined, {}), onClick: () => removeItem(idx) })] })] }) }, `${opt.value}-${idx}`))), _jsx(Button, { block: true, type: "dashed", icon: _jsx(PlusOutlined, {}), onClick: addItem, children: "\u6DFB\u52A0\u9009\u9879" })] }));
}
