import { useState } from "react";
import { supabase } from "../supabase";
import { COLORS, typeColor } from "../constants/colors";

const TYPES = [
  { key: "mision", label: "Misión", icon: "⚡" },
  { key: "rutina", label: "Rutina", icon: "🔁" },
  { key: "campana", label: "Campaña", icon: "📌" },
  { key: "encargo", label: "Encargo", icon: "📋" },
  { key: "desafio", label: "Desafío", icon: "🎯" },
  { key: "jefe", label: "Jefe", icon: "💀" },
];

const typeLabel = {
  mision: "Misión", rutina: "Rutina", campana: "Campaña",
  encargo: "Encargo", desafio: "Desafío", jefe: "Jefe",
};

export function ModalCapturar({ onClose }) {
  const [text, setText] = useState("");
  const [selected, setSelected] = useState(null);

  const handleAdd = async () => {
    if (!text.trim()) return;
    await supabase.from("bandeja").insert([{ text: text.trim(), type: selected || null }]);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 32px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box" }}>
        <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>¿Qué tenés en mente?</div>

        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Capturá cualquier cosa..." autoFocus
          style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box", resize: "none", minHeight: 80, fontFamily: "inherit", lineHeight: 1.5 }} />

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              ¿Dónde va? <span style={{ fontSize: 10, textTransform: "none", letterSpacing: 0 }}>(opcional)</span>
            </div>
            {selected && (
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 11, cursor: "pointer", padding: 0 }}>Quitar</button>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {TYPES.map(t => (
              <button key={t.key} onClick={() => setSelected(selected === t.key ? null : t.key)} style={{ background: selected === t.key ? typeColor(t.key) + "22" : COLORS.surfaceLight, border: `1px solid ${selected === t.key ? typeColor(t.key) : COLORS.border}`, borderRadius: 10, padding: "10px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <span style={{ fontSize: 11, color: selected === t.key ? typeColor(t.key) : COLORS.textMuted, fontWeight: 600 }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleAdd} style={{ width: "100%", background: text.trim() ? COLORS.accent : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: text.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: text.trim() ? "pointer" : "default" }}>
          {selected ? `Capturar como ${typeLabel[selected]}` : "Capturar"}
        </button>
      </div>
    </div>
  );
}