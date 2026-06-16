import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { COLORS } from "../constants/colors";
import { ScreenHeader } from "../components/ScreenHeader";
import { Section } from "../components/Section";
import { Checkbox } from "../components/Checkbox";
import { SimpleModal } from "../components/SimpleModal";
import { Loading } from "../components/Loading";

export function MisionesScreen({ onBack, onArchivar }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPriority, setNewPriority] = useState("media");

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
    if (onArchivar) onArchivar({ label: item.label, type: item.is_boss ? "jefe" : "mision" });
  };

  const addMision = async (label) => {
    const { data } = await supabase.from("tasks").insert([{ type: "mision", label, priority: newPriority, done: false }]).select();
    if (data) setItems(prev => [...prev, data[0]]);
    setShowModal(false);
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
                <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.surface, borderRadius: 10, padding: "11px 12px", border: `1px solid ${m.is_boss ? COLORS.jefe + "66" : COLORS.border}` }}>
                  <Checkbox done={false} onChange={() => toggle(m.id)} />
                  <span style={{ flex: 1, fontSize: 14, color: COLORS.text }}>{m.label}</span>
                  {m.is_boss ? <span style={{ fontSize: 11, color: COLORS.jefe, fontWeight: 700 }}>⚔ JEFE</span> : <div style={{ width: 8, height: 8, borderRadius: "50%", background: pColors[p] }} />}
                </div>
              ))}
            </Section>
          ))}
        </>
      )}
      {showModal && (
        <SimpleModal title="Nueva misión" placeholder="¿Qué hay que hacer?" btnLabel="Agregar misión" btnColor={COLORS.mision} onClose={() => setShowModal(false)} onAdd={addMision}
          extraContent={() => (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Prioridad</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["alta","Alta",COLORS.mision],["media","Media",COLORS.accent],["baja","Baja",COLORS.textMuted]].map(([k,l,col]) => (
                  <button key={k} onClick={() => setNewPriority(k)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${newPriority === k ? col : COLORS.border}`, background: newPriority === k ? col + "22" : "transparent", color: newPriority === k ? col : COLORS.textMuted }}>{l}</button>
                ))}
              </div>
            </div>
          )} />
      )}
    </div>
  );
}