import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function InputField(props) {
    return (_jsxs("div", { style: { marginBottom: 16 }, children: [props.label && _jsx("label", { style: { display: 'block', marginBottom: 6, fontWeight: 500, color: '#444' }, children: props.label }), _jsx("input", { type: props.type || 'text', style: {
                    padding: '10px 12px',
                    width: '100%',
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                }, value: props.value ?? '', placeholder: props.placeholder, onChange: (e) => {
                    const val = props.type === 'number' ? Number(e.target.value) : e.target.value;
                    props.onChange?.(val);
                }, onFocus: (e) => e.target.style.borderColor = '#1677ff', onBlur: (e) => e.target.style.borderColor = '#ddd' })] }));
}
