import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function InputField(props) {
    return (_jsxs("div", { style: { marginBottom: 16 }, children: [props.label && _jsx("label", { style: { display: 'block', marginBottom: 4 }, children: props.label }), _jsx("input", { style: { padding: '8px 12px', width: '100%' }, value: props.value || '', placeholder: props.placeholder, onChange: (e) => props.onChange?.(e.target.value) })] }));
}
