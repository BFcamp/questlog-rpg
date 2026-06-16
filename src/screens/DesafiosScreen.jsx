import { useState } from "react";
import { COLORS } from "../constants/colors";
import { ScreenHeader } from "../components/ScreenHeader";
import { SimpleModal } from "../components/SimpleModal";

const periodoLabel = { dia: "Día", semana: "Semana", mes: "Mes" };

export function DesafiosScreen({ desafios, onTogglePin, onAddDesafio, onBack }) {
  const [tab, setTab] = useState("dia");
  const [showModal, setShowModal] = useState(false);
  const [deadline, setDeadline] = useState("");
  const filtered = desafios.filter(d => d.periodo === tab);

  const handleAdd = (label) => {
    onAddDesafio({ label, progress: 0, total: 1, deadline: deadline.trim() || null, periodo: tab, pinned: false });
    setDeadline(""); setShowModal(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <ScreenHeader title="Desafíos" sub="Objetivos personales" btnLabel="+ Desafío" btnColor={COLORS.desafio} onBtn={() => setShowModal(true)} onBack={onBack} />
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {["dia","semana","mes"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: `1px solid ${tab === t ? COLORS.desafio : COLORS.border}`, background: tab === t ? COLORS.desafio + "22" : "transparent", color: tab === t ? COLORS.text : COLORS.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{periodoLabel[t]}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 32 }}>Sin desafíos en este período</div>}
        {filtered.map(d => {
          const pct = Math.round((d.progress / d.total) * 100);
          return (
            <div key={d.id} style={{ background: COLORS.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${d.pinned ? COLORS.desafio : COLORS.border}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8, gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, flex: 1 }}>{d.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {d.deadline && <span style={{ fontSize: 11, color: COLORS.textMuted }}>{d.deadline}</span>}
                  <button onClick={() => onTogglePin(d.id)} style={{ background: d.pinned ? COLORS.desafio + "33" : "transparent", border: `1px solid ${d.pinned ? COLORS.desafio : COLORS.border}`, borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📌</button>
                </div>
              </div>
              <div style={{ height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ width: `${pct}%`, height: "100%", background: COLORS.desafio, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 12, color: COLORS.desafio }}>{d.progress}/{d.total}</span>
            </div>
          );
        })}
      </div>
      {showModal && (
        <SimpleModal title="Nuevo desafío" placeholder="¿Qué querés lograr?" btnLabel="Crear desafío" btnColor={COLORS.desafio} onClose={() => setShowModal(false)} onAdd={handleAdd}
          extraContent={() => (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Fecha límite (opcional)</div>
              <input value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="Ej: Dic 2026"
                style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 14px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
          )} />
      )}
    </div>
  );
}