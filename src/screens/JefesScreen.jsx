import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { COLORS } from "../constants/colors";
import { ScreenHeader } from "../components/ScreenHeader";
import { Loading } from "../components/Loading";

export function JefesScreen({ onBack, onArchivar, onSumarPC }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [newName, setNewName] = useState("");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => { fetchJefes(); }, []);

  const fetchJefes = async () => {
    const { data } = await supabase.from("tasks").select("*").eq("type", "jefe").eq("done", false);
    if (data) setItems(data);
    setLoading(false);
  };

  const addJefe = async () => {
    if (!newName.trim()) return;
    const { data } = await supabase.from("tasks")
      .insert([{ type: "jefe", label: newName.trim(), notes: newNotes.trim(), done: false }])
      .select();
    if (data) setItems(prev => [...prev, data[0]]);
    setNewName(""); setNewNotes(""); setShowModal(false);
  };

  const deleteJefe = async (id) => {
    await supabase.from("tasks").delete().eq("id", id);
    setItems(prev => prev.filter(x => x.id !== id));
    setEditando(null);
  };

  const completarJefe = async (id) => {
    const item = items.find(x => x.id === id);
    if (!item) return;
    await supabase.from("tasks").update({ done: true }).eq("id", id);
    setItems(prev => prev.filter(x => x.id !== id));
    if (onArchivar) onArchivar({ label: item.label, type: "jefe" });
    if (onSumarPC) await onSumarPC("jefe");
  };

  const guardarEdicion = async () => {
    if (!newName.trim()) return;
    await supabase.from("tasks").update({ label: newName.trim(), notes: newNotes.trim() }).eq("id", editando.id);
    setItems(prev => prev.map(x => x.id === editando.id ? { ...x, label: newName.trim(), notes: newNotes.trim() } : x));
    setEditando(null);
  };

  return (
    <div style={{ position: "relative" }}>
      <ScreenHeader title="Jefes" sub="Situaciones difíciles" btnLabel="+ Jefe" btnColor={COLORS.jefe} onBtn={() => { setNewName(""); setNewNotes(""); setShowModal(true); }} onBack={onBack} />

      {loading ? <Loading /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 40 }}>Sin jefes por ahora</div>}
          {items.map(m => (
            <div key={m.id} style={{ background: COLORS.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${COLORS.jefe}44` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: m.notes ? 10 : 0 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, flex: 1 }}>{m.label}</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { setEditando(m); setNewName(m.label); setNewNotes(m.notes || ""); }}
                    style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: COLORS.textMuted, fontSize: 12 }}>✎</button>
                  <button
                    onClick={() => completarJefe(m.id)}
                    style={{ background: COLORS.jefe + "22", border: `1px solid ${COLORS.jefe}44`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: COLORS.jefe, fontSize: 12, fontWeight: 600 }}>⚔ Derrotar</button>
                </div>
              </div>
              {m.notes && <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5 }}>{m.notes}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Modal nuevo jefe */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box" }}>
            <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Nuevo Jefe</div>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="¿A qué te enfrentás?"
              style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
            <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Nota de preparación (opcional)..."
              style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 13, outline: "none", marginBottom: 16, boxSizing: "border-box", resize: "none", minHeight: 80, fontFamily: "inherit" }} />
            <button onClick={addJefe} style={{ width: "100%", background: newName.trim() ? COLORS.jefe : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: newName.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Agregar Jefe</button>
          </div>
        </div>
      )}

      {/* Modal editar jefe */}
      {editando && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setEditando(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box" }}>
            <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Editar Jefe</div>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre"
              style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
            <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Nota de preparación..."
              style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 13, outline: "none", marginBottom: 16, boxSizing: "border-box", resize: "none", minHeight: 80, fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={guardarEdicion} style={{ flex: 1, background: newName.trim() ? COLORS.jefe : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: newName.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Guardar</button>
              <button onClick={() => deleteJefe(editando.id)} style={{ background: "#e05c5c22", border: "1px solid #e05c5c44", borderRadius: 12, padding: "13px 16px", cursor: "pointer", color: "#e05c5c", fontSize: 14, fontWeight: 700 }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}