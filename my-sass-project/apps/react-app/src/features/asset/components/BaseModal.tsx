import { useEffect } from "react";
import ReactDOM from "react-dom";

interface Props {
  open: boolean;
  title?: string;
  width?: number;
  onCancel: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
}

export default function BaseModal({
  open,
  title = "系统提示",
  width = 520,
  onCancel,
  onConfirm,
  children,
}: Props) {
  useEffect(() => {
    const old = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [open]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 10px 30px rgba(0,0,0,.2)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong>{title}</strong>
          <button onClick={onCancel}>×</button>
        </div>

        <div style={{ padding: 16 }}>{children}</div>

        <div
          style={{
            padding: 12,
            borderTop: "1px solid #eee",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button onClick={onCancel}>取消</button>
          <button onClick={onConfirm}>确认</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
