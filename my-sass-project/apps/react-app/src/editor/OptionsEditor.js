import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("div", { style: { display: "grid", gap: 8 }, children: [options.map((opt, idx) => (_jsxs("div", { style: {
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    padding: 8,
                    display: "grid",
                    gap: 6,
                }, children: [_jsxs("label", { children: ["\u6587\u6848(label)", _jsx("input", { value: opt.label, onChange: (e) => updateItem(idx, { label: e.target.value }), style: { width: "100%", marginTop: 4 } })] }), _jsxs("label", { children: ["\u503C(value)", _jsx("input", { value: opt.value, onChange: (e) => updateItem(idx, { value: e.target.value }), style: { width: "100%", marginTop: 4 } })] }), _jsxs("div", { style: { display: "flex", gap: 8 }, children: [_jsx("button", { type: "button", onClick: () => moveItem(idx, "up"), children: "\u4E0A\u79FB" }), _jsx("button", { type: "button", onClick: () => moveItem(idx, "down"), children: "\u4E0B\u79FB" }), _jsx("button", { type: "button", onClick: () => removeItem(idx), style: {
                                    color: "#fff",
                                    background: "#ff4d4f",
                                    border: 0,
                                    padding: "4px 8px",
                                }, children: "\u5220\u9664" })] })] }, `${opt.value}-${idx}`))), _jsx("button", { type: "button", onClick: addItem, children: "+ \u6DFB\u52A0\u9009\u9879" })] }));
}
