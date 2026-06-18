import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { COLORS } from "../constants/colors";
import { ScreenHeader } from "../components/ScreenHeader";
import { Checkbox } from "../components/Checkbox";
import { SimpleModal } from "../components/SimpleModal";
import { Loading } from "../components/Loading";

export function EncargosScreen({ onBack, onArchivar, onSumarPC }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("simple");
  const [showModal, setShowModal] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState("simple");
  const [editando, setEditando] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editTipo, setEditTipo] = useState("simple");

  useEffect(() => { fetchEncargos(); }, []);

  const fetchEncargos = async () => {
    const { data } = await supabase.from("tasks").select("*").eq("type", "encargo").eq("done", false);
    if (data) setItems(data);
    setLoading(false);
  };

  const toggle = async (id) => {
    const item = items.find(x => x.id === id);
    if (!item) return;
    await supabase.from("tasks").update({ done: true }).eq("id", id);
    setItems(e => e.filter(x => x.id !== id));
    if (onArchivar) onArchivar({ label: item.label, type: "encargo" });
    if (onSumarPC) await onSumarPC("encargo");
  };

  const addEncargo = async (label) => {
    const { data } = await supabase.from("tasks").insert([{ type: "encargo", label, priority: nuevoTipo, done: false }]).select();
    if (data) setItems(prev => [...prev, data[0]]);
    setShowModal(false);
  };

  const guardarEdicion = async () => {
    if (!editNombre.trim()) return;
    await supabase.from("tasks").update({ label: editNombre.trim(), priority: editTipo }).eq("id", editando.id);
    setItems(prev => prev.map(x => x.id === editando.id ? { ...x, label: editNombre.trim(), priority: editTipo } : x));
    setEditando(null);
  };

  const eliminar = async (id) => {
    await supabase.from("tasks").delete().eq("id", id);
    setItems(prev => prev.filter(x => x.id !== id));
    setEditando(null);
  };

  const filtered = items.filter(x => x.priority === tab);

  return (
    <div style={{ position: "relative" }}>
      <ScreenHeader title="Encargos" sub="Sin fecha ni urgencia" btnLabel="+ Encargo" btnColor={COLORS.encargo} onBtn={() => { setNuevoTipo(tab); setShowModal(true); }} onBack={onBack} />

      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {["simple","mayor"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: `1px solid ${tab === t ? COLORS.encargo : COLORS.border}`, background: tab === t ? COLORS.encargo + "22" : "transparent", color: tab === t ? COLORS.text : COLORS.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {t === "simple" ? "Pendientes" : "Mayores"}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 32 }}>Sin encargos aquí</div>}
          {filtered.map(e => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.surface, borderRadius: 10, padding: "11px 12px", border: `1px solid ${COLORS.border}` }}>
              <Checkbox done={false} onChange={() => toggle(e.id)} />
              <span style={{ flex: 1, fontSize: 14, color: COLORS.text }}>{e.label}</span>
              {e.priority === "mayor" && <span style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: "0.06em" }}>MAYOR</span>}
              <button
                onClick={() => { setEditando(e); setEditNombre(e.label); setEditTipo(e.priority); }}
                style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: COLORS.textMuted, fontSize: 12, flexShrink: 0 }}>
                ✎
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal nuevo encargo */}
      {showModal && (
        <SimpleModal
          title="Nuevo encargo"
          placeholder="¿Qué hay que hacer?"
          btnLabel="Agregar"
          btnColor={COLORS.encargo}
          onClose={() => setShowModal(false)}
          onAdd={addEncargo}
          extraContent={() => (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Tipo</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["simple","Pendiente"],["mayor","Mayor"]].map(([k,l]) => (
                  <button key={k} onClick={() => setNuevoTipo(k)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${nuevoTipo === k ? COLORS.encargo : COLORS.border}`, background: nuevoTipo === k ? COLORS.encargo + "22" : "transparent", color: nuevoTipo === k ? COLORS.text : COLORS.textMuted }}>{l}</button>
                ))}
              </div>
            </div>
          )}
        />
      )}

      {/* Modal editar encargo */}
      {editando && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setEditando(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box" }}>
            <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Editar encargo</div>

            <input
              value={editNombre}
              onChange={e => setEditNombre(e.target.value)}
              placeholder="Nombre del encargo"
              style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 14, boxSizing: "border-box" }}
            />

            <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Tipo</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[["simple","Pendiente"],["mayor","Mayor"]].map(([k,l]) => (
                <button key={k} onClick={() => setEditTipo(k)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${editTipo === k ? COLORS.encargo : COLORS.border}`, background: editTipo === k ? COLORS.encargo + "22" : "transparent", color: editTipo === k ? COLORS.text : COLORS.textMuted }}>{l}</button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={guardarEdicion}
                style={{ flex: 1, background: editNombre.trim() ? COLORS.encargo : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: editNombre.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
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