import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { COLORS } from "../constants/colors";
import { ScreenHeader } from "../components/ScreenHeader";
import { Section } from "../components/Section";
import { Checkbox } from "../components/Checkbox";
import { SimpleModal } from "../components/SimpleModal";
import { Loading } from "../components/Loading";

export function MisionesScreen({ onBack, onArchivar, onSumarPC }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPriority, setNewPriority] = useState("media");
  const [editando, setEditando] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editPriority, setEditPriority] = useState("media");

  useEffect(() => { fetchMisiones(); }, []);

  const fetchMisiones = async () => {
    const { data } = await supabase.from("tasks").select("*").eq("type", "mision").eq("done", false);
    if (data) setItems(data);
    setLoading(false);
  };

  const toggle = async (id) => {
    const item = items.find(x => x.id === id);
    if (!item) return;
    await supabase.from("tasks").update({ done: true }).eq("id", id);
    setItems(m => m.filter(x => x.id !== id));
    if (onArchivar) onArchivar({ label: item.label, type: "mision" });
    if (onSumarPC) await onSumarPC("mision");
  };

  const addMision = async (label) => {
    const { data } = await supabase.from("tasks").insert([{ type: "mision", label, priority: newPriority, done: false }]).select();
    if (data) setItems(prev => [...prev, data[0]]);
    setShowModal(false);
  };

  const guardarEdicion = async () => {
    if (!editNombre.trim()) return;
    await supabase.from("tasks").update({ label: editNombre.trim(), priority: editPriority }).eq("id", editando.id);
    setItems(prev => prev.map(x => x.id === editando.id ? { ...x, label: editNombre.trim(), priority: editPriority } : x));
    setEditando(null);
  };

  const eliminar = async (id) => {
    await supabase.from("tasks").delete().eq("id", id);
    setItems(prev => prev.filter(x => x.id !== id));
    setEditando(null);
  };

  const byPriority = { alta: [], media: [], baja: [] };
  items.forEach(m => { if (byPriority[m.priority]) byPriority[m.priority].push(m); });
  const pColors = { alta: COLORS.mision, media: COLORS.accent, baja: COLORS.textMuted };
  const pLabel = { alta: "Alta prioridad", media: "Media prioridad", baja: "Baja prioridad" };

  return (
    <div style={{ position: "relative" }}>
      <ScreenHeader title="Misiones" sub="Lo urgente e importante" btnLabel="+ Misión" btnColor={COLORS.mision} onBtn={() => setShowModal(true)} onBack={onBack} />

      {loading ? <Loading /> : (
        <>
          {items.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 40 }}>Sin misiones activas</div>}
          {Object.entries(byPriority).filter(([, v]) => v.length).map(([p, its]) => (
            <Section key={p} label={pLabel[p]} color={pColors[p]}>
              {its.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.surface, borderRadius: 10, padding: "11px 12px", border: `1px solid ${COLORS.border}` }}>
                  <Checkbox done={false} onChange={() => toggle(m.id)} />
                  <span style={{ flex: 1, fontSize: 14, color: COLORS.text }}>{m.label}</span>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: pColors[p], flexShrink: 0 }} />
                  <button
                    onClick={() => { setEditando(m); setEditNombre(m.label); setEditPriority(m.priority); }}
                    style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: COLORS.textMuted, fontSize: 12, flexShrink: 0 }}>
                    ✎
                  </button>
                </div>
              ))}
            </Section>
          ))}
        </>
      )}

      {/* Modal nueva misión */}
      {showModal && (
        <SimpleModal
          title="Nueva misión"
          placeholder="¿Qué hay que hacer?"
          btnLabel="Agregar misión"
          btnColor={COLORS.mision}
          onClose={() => setShowModal(false)}
          onAdd={addMision}
          extraContent={() => (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Prioridad</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["alta","Alta",COLORS.mision],["media","Media",COLORS.accent],["baja","Baja",COLORS.textMuted]].map(([k,l,col]) => (
                  <button key={k} onClick={() => setNewPriority(k)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${newPriority === k ? col : COLORS.border}`, background: newPriority === k ? col + "22" : "transparent", color: newPriority === k ? col : COLORS.textMuted }}>{l}</button>
                ))}
              </div>
            </div>
          )}
        />
      )}

      {/* Modal editar misión */}
      {editando && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setEditando(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box" }}>
            <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Editar misión</div>

            <input
              value={editNombre}
              onChange={e => setEditNombre(e.target.value)}
              placeholder="Nombre de la misión"
              style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 14, boxSizing: "border-box" }}
            />

            <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Prioridad</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {[["alta","Alta",COLORS.mision],["media","Media",COLORS.accent],["baja","Baja",COLORS.textMuted]].map(([k,l,col]) => (
                <button key={k} onClick={() => setEditPriority(k)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${editPriority === k ? col : COLORS.border}`, background: editPriority === k ? col + "22" : "transparent", color: editPriority === k ? col : COLORS.textMuted }}>{l}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={guardarEdicion}
                style={{ flex: 1, background: editNombre.trim() ? COLORS.mision : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: editNombre.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Guardar
              </button>
              <button
                onClick={() => eliminar(editando.id)}
                style={{ background: "#e05c5c22", border: "1px solid #e05c5c44", borderRadius: 12, padding: "13px 16px", cursor: "pointer", color: "#e05c5c", fontSize: 14, fontWeight: 700 }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}