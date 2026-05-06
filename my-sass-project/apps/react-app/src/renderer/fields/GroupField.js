import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function GroupField(props) {
    return (_jsxs("div", { style: { border: '1px solid #2a2a2a', padding: 16, marginBottom: 16 }, children: [props.label && _jsx("h3", { style: { marginBottom: 12 }, children: props.label }), props.children] }));
}
