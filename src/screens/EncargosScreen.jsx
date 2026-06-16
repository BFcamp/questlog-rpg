import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { COLORS } from "../constants/colors";
import { ScreenHeader } from "../components/ScreenHeader";
import { Checkbox } from "../components/Checkbox";
import { SimpleModal } from "../components/SimpleModal";
import { Loading } from "../components/Loading";

export function EncargosScreen({ onBack, onArchivar }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("simple");
  const [showModal, setShowModal] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState("simple");

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
  };

  const addEncargo = async (label) => {
    const { data } = await supabase.from("tasks").insert([{ type: "encargo", label, priority: nuevoTipo, done: false }]).select();
    if (data) setItems(prev => [...prev, data[0]]);
    setShowModal(false);
  };

  const filtered = items.filter(x => x.priority === tab);

  return (
    <div style={{ position: "relative" }}>
      <ScreenHeader title="Encargos" sub="Sin fecha ni urgencia" btnLabel="+ Encargo" btnColor={COLORS.encargo} onBtn={() => { setNuevoTipo(tab); setShowModal(true); }} onBack={onBack} />
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {["simple","mayor"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: `1px solid ${tab === t ? COLORS.encargo : COLORS.border}`, background: tab === t ? COLORS.encargo + "22" : "transparent", color: tab === t ? COLORS.text : COLORS.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t === "simple" ? "Pendientes" : "Mayores"}</button>
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
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <SimpleModal title="Nuevo encargo" placeholder="¿Qué hay que hacer?" btnLabel="Agregar" btnColor={COLORS.encargo} onClose={() => setShowModal(false)} onAdd={addEncargo}
          extraContent={() => (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Tipo</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["simple","Pendiente"],["mayor","Mayor"]].map(([k,l]) => (
                  <button key={k} onClick={() => setNuevoTipo(k)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${nuevoTipo === k ? COLORS.encargo : COLORS.border}`, background: nuevoTipo === k ? COLORS.encargo + "22" : "transparent", color: nuevoTipo === k ? COLORS.text : COLORS.textMuted }}>{l}</button>
                ))}
              </div>
            </div>
          )} />
      )}
    </div>
  );
}