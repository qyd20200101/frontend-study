import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function SelectField(props) {
    return (_jsxs("div", { style: { marginBottom: 16 }, children: [props.label && _jsx("label", { style: { display: 'block', marginBottom: 6, fontWeight: 500, color: '#444' }, children: props.label }), _jsxs("select", { style: {
                    padding: '10px 12px',
                    width: '100%',
                    borderRadius: 8,
                    border: '1px solid #ddd',
                    outline: 'none',
                    background: '#fff'
                }, value: props.value ?? '', onChange: (e) => {
                    const val = e.target.value;
                    // 尝试转为数字，如果是数字字符串则转为数字
                    const numericVal = Number(val);
                    props.onChange?.(isNaN(numericVal) || val === '' ? val : numericVal);
                }, children: [_jsx("option", { value: "", children: "\u8BF7\u9009\u62E9" }), props.options?.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] })] }));
}
