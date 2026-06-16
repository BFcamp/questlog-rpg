import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { COLORS } from "../constants/colors";
import { Checkbox } from "../components/Checkbox";
import { SimpleModal } from "../components/SimpleModal";
import { Loading } from "../components/Loading";

export function InventarioScreen() {
  const [tab, setTab] = useState("recursos");
  const [recursos, setRecursos] = useState([]);
  const [botin, setBotin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [showNuevoRecurso, setShowNuevoRecurso] = useState(false);
  const [showNuevoBotin, setShowNuevoBotin] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoMeta, setNuevoMeta] = useState("");

  useEffect(() => { fetchInventario(); }, []);

  const fetchInventario = async () => {
    const [{ data: rData }, { data: bData }] = await Promise.all([
      supabase.from("recursos").select("*"),
      supabase.from("botin").select("*"),
    ]);
    if (rData) setRecursos(rData);
    if (bData) setBotin(bData);
    setLoading(false);
  };

  const toggleBotin = async (id) => {
    const item = botin.find(b => b.id === id);
    await supabase.from("botin").update({ comprado: !item.comprado }).eq("id", id);
    setBotin(prev => prev.map(b => b.id === id ? { ...b, comprado: !b.comprado } : b));
  };

  const addBotin = async (label) => {
    const { data } = await supabase.from("botin").insert([{ label, comprado: false }]).select();
    if (data) setBotin(prev => [...prev, data[0]]);
    setShowNuevoBotin(false);
  };

  const addRecurso = async () => {
    const meta = parseInt(nuevoMeta.replace(/\D/g, "")) || 0;
    if (!nuevoNombre.trim() || !meta) return;
    const { data } = await supabase.from("recursos").insert([{ label: nuevoNombre.trim(), actual: 0, meta }]).select();
    if (data) setRecursos(prev => [...prev, data[0]]);
    setNuevoNombre(""); setNuevoMeta(""); setShowNuevoRecurso(false);
  };

  const guardarMonto = async (id) => {
    const val = parseInt(nuevoMonto.replace(/\D/g, "")) || 0;
    await supabase.from("recursos").update({ actual: val }).eq("id", id);
    setRecursos(prev => prev.map(r => r.id === id ? { ...r, actual: val } : r));
    setEditando(null); setNuevoMonto("");
  };

  const pendientes = botin.filter(b => !b.comprado);
  const baul = botin.filter(b => b.comprado);

  if (loading) return <Loading />;

  return (
    <div style={{ position: "relative" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, fontFamily: "Georgia, serif", marginBottom: 14 }}>Inventario</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[["recursos","💰 Recursos"],["botin","🗡 Botín"],["baul","🪙 Baúl"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${tab === k ? COLORS.accent : COLORS.border}`, background: tab === k ? COLORS.accent + "22" : "transparent", color: tab === k ? COLORS.text : COLORS.textMuted }}>{l}</button>
        ))}
      </div>

      {tab === "recursos" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <button onClick={() => setShowNuevoRecurso(true)} style={{ background: COLORS.accent + "22", border: `1px solid ${COLORS.accent}44`, borderRadius: 10, padding: "8px 14px", cursor: "pointer", color: COLORS.accent, fontSize: 13, fontWeight: 600 }}>+ Recurso</button>
          </div>
          {recursos.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 32 }}>Sin recursos</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recursos.map(r => {
              const pct = Math.min(100, Math.round((r.actual / r.meta) * 100));
              const completo = r.actual >= r.meta;
              return (
                <div key={r.id} style={{ background: COLORS.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${completo ? COLORS.accent + "66" : COLORS.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 2 }}>{r.label}</div>
                      <div style={{ fontSize: 12, color: COLORS.textMuted }}>${r.actual.toLocaleString()} / ${r.meta.toLocaleString()}</div>
                    </div>
                    {completo
                      ? <span style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700 }}>✓ META</span>
                      : <button onClick={() => { setEditando(r.id); setNuevoMonto(String(r.actual)); }} style={{ background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: COLORS.textMuted, fontSize: 12 }}>Editar</button>
                    }
                  </div>
                  <div style={{ height: 6, background: COLORS.border, borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: completo ? COLORS.accent : COLORS.desafio, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 11, color: completo ? COLORS.accent : COLORS.desafio }}>{pct}%</div>
                  {editando === r.id && (
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                      <input value={nuevoMonto} onChange={e => setNuevoMonto(e.target.value)} placeholder="Monto actual ($)" inputMode="numeric"
                        style={{ flex: 1, background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "8px 12px", color: COLORS.text, fontSize: 13, outline: "none" }} />
                      <button onClick={() => guardarMonto(r.id)} style={{ background: COLORS.accent, border: "none", borderRadius: 8, padding: "8px 14px", color: COLORS.bg, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>OK</button>
                      <button onClick={() => setEditando(null)} style={{ background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "8px 12px", color: COLORS.textMuted, fontSize: 13, cursor: "pointer" }}>×</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "botin" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
            <button onClick={() => setShowNuevoBotin(true)} style={{ background: COLORS.ruta + "22", border: `1px solid ${COLORS.ruta}44`, borderRadius: 10, padding: "8px 14px", cursor: "pointer", color: COLORS.ruta, fontSize: 13, fontWeight: 600 }}>+ Ítem</button>
          </div>
          {pendientes.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 32 }}>Sin ítems pendientes</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {pendientes.map(b => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.surface, borderRadius: 10, padding: "11px 12px", border: `1px solid ${COLORS.border}` }}>
                <Checkbox done={false} onChange={() => toggleBotin(b.id)} />
                <span style={{ flex: 1, fontSize: 14, color: COLORS.text }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "baul" && (
        <div>
          {baul.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 32 }}>El baúl está vacío</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {baul.map(b => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.surface, borderRadius: 10, padding: "11px 12px", border: `1px solid ${COLORS.border}`, opacity: 0.6 }}>
                <Checkbox done={true} onChange={() => toggleBotin(b.id)} />
                <span style={{ flex: 1, fontSize: 14, color: COLORS.textMuted, textDecoration: "line-through" }}>{b.label}</span>
              </div>
            ))}
          </div>
          {baul.length > 0 && <div style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "center", marginTop: 8 }}>Tocá un ítem para devolverlo al Botín</div>}
        </div>
      )}

      {showNuevoRecurso && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setShowNuevoRecurso(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box" }}>
            <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Nuevo recurso</div>
            <input value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} placeholder="¿Para qué estás ahorrando?"
              style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
            <input value={nuevoMeta} onChange={e => setNuevoMeta(e.target.value)} placeholder="Meta ($)" inputMode="numeric"
              style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }} />
            <button onClick={addRecurso} style={{ width: "100%", background: nuevoNombre.trim() ? COLORS.accent : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: nuevoNombre.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Crear recurso</button>
          </div>
        </div>
      )}
      {showNuevoBotin && <SimpleModal title="Nuevo ítem" placeholder="¿Qué necesitás comprar?" btnLabel="Agregar al Botín" btnColor={COLORS.ruta} onClose={() => setShowNuevoBotin(false)} onAdd={addBotin} />}
    </div>
  );
}