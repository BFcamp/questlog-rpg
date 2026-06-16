import { useState } from "react";
import { COLORS } from "../constants/colors";

export function SimpleModal({ title, placeholder, btnLabel, btnColor, onClose, onAdd, extraContent }) {
  const [text, setText] = useState("");
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box" }}>
        <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>{title}</div>
        <input value={text} onChange={e => setText(e.target.value)} placeholder={placeholder}
          style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
        {extraContent && extraContent(text)}
        <button onClick={() => { if (text.trim()) onAdd(text.trim()); }} style={{ width: "100%", background: text.trim() ? (btnColor || COLORS.accent) : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: text.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: text.trim() ? "pointer" : "default" }}>{btnLabel}</button>
      </div>
    </div>
  );
}