import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import ReactDOM from "react-dom";
export default function BaseModal({ open, title = "系统提示", width = 520, onCancel, onConfirm, children, }) {
    useEffect(() => {
        const old = document.body.style.overflow;
        if (open)
            document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = old;
        };
    }, [open]);
    if (!open)
        return null;
    return ReactDOM.createPortal(_jsx("div", { onClick: onCancel, style: {
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
        }, children: _jsxs("div", { onClick: (e) => e.stopPropagation(), style: {
                width,
                background: "#fff",
                borderRadius: 8,
                boxShadow: "0 10px 30px rgba(0,0,0,.2)",
                overflow: "hidden",
            }, children: [_jsxs("div", { style: {
                        padding: "14px 16px",
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }, children: [_jsx("strong", { children: title }), _jsx("button", { onClick: onCancel, children: "\u00D7" })] }), _jsx("div", { style: { padding: 16 }, children: children }), _jsxs("div", { style: {
                        padding: 12,
                        borderTop: "1px solid #eee",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 8,
                    }, children: [_jsx("button", { onClick: onCancel, children: "\u53D6\u6D88" }), _jsx("button", { onClick: onConfirm, children: "\u786E\u8BA4" })] })] }) }), document.body);
}
