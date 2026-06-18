import { useState } from "react";
import { supabase } from "../supabase";
import { COLORS } from "../constants/colors";
import { ScreenHeader } from "../components/ScreenHeader";
import { SimpleModal } from "../components/SimpleModal";

const periodoLabel = { dia: "Día", semana: "Semana", mes: "Mes" };

export function DesafiosScreen({ desafios, onTogglePin, onAddDesafio, onBack, onSumarPC }) {
  const [tab, setTab] = useState("dia");
  const [showModal, setShowModal] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [editando, setEditando] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editPeriodo, setEditPeriodo] = useState("dia");
  const [editProgress, setEditProgress] = useState(0);
  const [editTotal, setEditTotal] = useState(1);

  const filtered = desafios.filter(d => d.periodo === tab);

  const handleAdd = (label) => {
    onAddDesafio({ label, progress: 0, total: 1, deadline: deadline.trim() || null, periodo: tab, pinned: false });
    setDeadline(""); setShowModal(false);
  };

  const handleComplete = async (d) => {
    if (d.progress + 1 >= d.total) {
      await supabase.from("desafios").update({ progress: d.total, done: true }).eq("id", d.id);
      if (onSumarPC) await onSumarPC("desafio");
    } else {
      await supabase.from("desafios").update({ progress: d.progress + 1 }).eq("id", d.id);
    }
    // Refrescar desde el padre no es posible directo, forzamos actualización local
    window.location.reload();
  };

  const guardarEdicion = async () => {
    if (!editLabel.trim()) return;
    await supabase.from("desafios").update({
      label: editLabel.trim(),
      deadline: editDeadline.trim() || null,
      periodo: editPeriodo,
      progress: editProgress,
      total: editTotal,
    }).eq("id", editando.id);
    setEditando(null);
    window.location.reload();
  };

  const eliminar = async (id) => {
    await supabase.from("desafios").delete().eq("id", id);
    setEditando(null);
    window.location.reload();
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
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {d.deadline && <span style={{ fontSize: 11, color: COLORS.textMuted }}>{d.deadline}</span>}
                  <button onClick={() => onTogglePin(d.id)} style={{ background: d.pinned ? COLORS.desafio + "33" : "transparent", border: `1px solid ${d.pinned ? COLORS.desafio : COLORS.border}`, borderRadius: 6, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📌</button>
                  <button onClick={() => { setEditando(d); setEditLabel(d.label); setEditDeadline(d.deadline || ""); setEditPeriodo(d.periodo); setEditProgress(d.progress); setEditTotal(d.total); }}
                    style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: COLORS.textMuted, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✎</button>
                </div>
              </div>
              <div style={{ height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ width: `${pct}%`, height: "100%", background: COLORS.desafio, borderRadius: 2 }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: COLORS.desafio }}>{d.progress}/{d.total}</span>
                {d.progress < d.total && (
                  <button onClick={() => handleComplete(d)} style={{ background: COLORS.desafio + "22", border: `1px solid ${COLORS.desafio}44`, borderRadius: 8, padding: "4px 10px", cursor: "pointer", color: COLORS.desafio, fontSize: 11, fontWeight: 600 }}>
                    +1 progreso
                  </button>
                )}
                {d.progress >= d.total && (
                  <span style={{ fontSize: 11, color: COLORS.desafio, fontWeight: 700 }}>✓ Completado</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal nuevo desafío */}
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

      {/* Modal editar desafío */}
      {editando && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setEditando(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Editar desafío</div>

            <input value={editLabel} onChange={e => setEditLabel(e.target.value)} placeholder="Nombre del desafío"
              style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />

            <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Período</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {["dia","semana","mes"].map(t => (
                <button key={t} onClick={() => setEditPeriodo(t)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${editPeriodo === t ? COLORS.desafio : COLORS.border}`, background: editPeriodo === t ? COLORS.desafio + "22" : "transparent", color: editPeriodo === t ? COLORS.desafio : COLORS.textMuted }}>{periodoLabel[t]}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Progreso</div>
                <input type="number" value={editProgress} onChange={e => setEditProgress(parseInt(e.target.value) || 0)} min={0} max={editTotal}
                  style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 14px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Total</div>
                <input type="number" value={editTotal} onChange={e => setEditTotal(parseInt(e.target.value) || 1)} min={1}
                  style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 14px", color: COLORS.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            <input value={editDeadline} onChange={e => setEditDeadline(e.target.value)} placeholder="Fecha límite (opcional)"
              style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box" }} />

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={guardarEdicion} style={{ flex: 1, background: editLabel.trim() ? COLORS.desafio : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: editLabel.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Guardar</button>
              <button onClick={() => eliminar(editando.id)} style={{ background: "#e05c5c22", border: "1px solid #e05c5c44", borderRadius: 12, padding: "13px 16px", cursor: "pointer", color: "#e05c5c", fontSize: 14, fontWeight: 700 }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}