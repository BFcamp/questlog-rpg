import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { COLORS } from "../constants/colors";
import { ScreenHeader } from "../components/ScreenHeader";
import { Checkbox } from "../components/Checkbox";
import { Badge } from "../components/Badge";
import { Loading } from "../components/Loading";

function RutaDetail({ ruta, steps, onBack, onComplete, onToggleStep, onEditRuta, onDeleteRuta, onEditStep, onDeleteStep }) {
  const [showCelebration, setShowCelebration] = useState(ruta.completed);
  const [editandoRuta, setEditandoRuta] = useState(false);
  const [editandoStep, setEditandoStep] = useState(null);
  const [editNombre, setEditNombre] = useState(ruta.name);
  const [editStepLabel, setEditStepLabel] = useState("");
  const done = steps.filter(s => s.done).length;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;

  const handleToggle = async (stepId) => {
    await onToggleStep(ruta.id, stepId);
    const updated = steps.map(s => s.id === stepId ? { ...s, done: !s.done } : s);
    if (updated.every(s => s.done)) {
      setTimeout(() => { setShowCelebration(true); onComplete(ruta.id); }, 300);
    }
  };

  if (showCelebration) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🏆</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.accent, fontFamily: "Georgia, serif", marginBottom: 6 }}>¡Ruta completada!</div>
        <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 24 }}>{ruta.name}</div>
        <div style={{ background: COLORS.accent + "22", border: `1px solid ${COLORS.accent}44`, borderRadius: 12, padding: "12px 28px", marginBottom: 24 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.accent }}>+ 500 PC · + 50 Coronas</div>
        </div>
        <button onClick={onBack} style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textMuted, fontSize: 13, padding: "9px 20px", cursor: "pointer" }}>Volver a Rutas</button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 13, padding: 0 }}>← Rutas</button>
        <button onClick={() => { setEditandoRuta(true); setEditNombre(ruta.name); }}
          style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: COLORS.textMuted, fontSize: 12 }}>✎ Editar</button>
      </div>

      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, fontFamily: "Georgia, serif" }}>{ruta.name}</div>
        <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{done}/{steps.length} pasos · {pct}%</div>
      </div>
      <div style={{ height: 6, background: COLORS.border, borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: COLORS.ruta, borderRadius: 3 }} />
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 21, top: 0, bottom: 0, width: 2, background: COLORS.border, zIndex: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative", zIndex: 1 }}>
          {steps.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: s.done ? COLORS.accent : COLORS.surfaceLight, border: `2px solid ${s.done ? COLORS.accent : COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: s.done ? COLORS.bg : COLORS.textMuted }}>{s.done ? "✓" : i + 1}</div>
              <div style={{ flex: 1, background: COLORS.surface, borderRadius: 10, padding: "10px 12px", border: `1px solid ${s.done ? COLORS.border : COLORS.ruta + "44"}`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ flex: 1, fontSize: 14, color: s.done ? COLORS.textMuted : COLORS.text, textDecoration: s.done ? "line-through" : "none" }}>{s.label}</span>
                <Badge type={s.type || "encargo"} small />
                <Checkbox done={s.done} onChange={() => handleToggle(s.id)} />
                {!s.done && (
                  <button onClick={() => { setEditandoStep(s); setEditStepLabel(s.label); }}
                    style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 6, width: 26, height: 26, cursor: "pointer", color: COLORS.textMuted, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>✎</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal editar ruta */}
      {editandoRuta && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setEditandoRuta(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box" }}>
            <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Editar ruta</div>
            <input value={editNombre} onChange={e => setEditNombre(e.target.value)} placeholder="Nombre de la ruta"
              style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { onEditRuta(ruta.id, editNombre.trim()); setEditandoRuta(false); }}
                style={{ flex: 1, background: editNombre.trim() ? COLORS.ruta : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: editNombre.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Guardar</button>
              <button onClick={() => { onDeleteRuta(ruta.id); setEditandoRuta(false); }}
                style={{ background: "#e05c5c22", border: "1px solid #e05c5c44", borderRadius: 12, padding: "13px 16px", cursor: "pointer", color: "#e05c5c", fontSize: 14, fontWeight: 700 }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar paso */}
      {editandoStep && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setEditandoStep(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box" }}>
            <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Editar paso</div>
            <input value={editStepLabel} onChange={e => setEditStepLabel(e.target.value)} placeholder="Nombre del paso"
              style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { onEditStep(editandoStep.id, editStepLabel.trim()); setEditandoStep(null); }}
                style={{ flex: 1, background: editStepLabel.trim() ? COLORS.ruta : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: editStepLabel.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Guardar</button>
              <button onClick={() => { onDeleteStep(editandoStep.id, ruta.id); setEditandoStep(null); }}
                style={{ background: "#e05c5c22", border: "1px solid #e05c5c44", borderRadius: 12, padding: "13px 16px", cursor: "pointer", color: "#e05c5c", fontSize: 14, fontWeight: 700 }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function RutaScreen({ onSumarPC }) {
  const [rutas, setRutas] = useState([]);
  const [stepsMap, setStepsMap] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("activas");
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSteps, setNewSteps] = useState([{ id: 1, text: "" }]);

  useEffect(() => { fetchRutas(); }, []);

  const fetchRutas = async () => {
    const { data: rData } = await supabase.from("rutas").select("*");
    const { data: sData } = await supabase.from("ruta_steps").select("*").order("order");
    if (rData) setRutas(rData);
    if (sData) {
      const map = {};
      sData.forEach(s => {
        if (!map[s.ruta_id]) map[s.ruta_id] = [];
        map[s.ruta_id].push(s);
      });
      setStepsMap(map);
    }
    setLoading(false);
  };

  const markComplete = async (id) => {
    await supabase.from("rutas").update({ completed: true }).eq("id", id);
    setRutas(prev => prev.map(r => r.id === id ? { ...r, completed: true } : r));
    if (onSumarPC) await onSumarPC("ruta");
  };

  const toggleStep = async (rutaId, stepId) => {
    const steps = stepsMap[rutaId] || [];
    const step = steps.find(s => s.id === stepId);
    const newDone = !step.done;
    await supabase.from("ruta_steps").update({ done: newDone }).eq("id", stepId);
    setStepsMap(prev => ({ ...prev, [rutaId]: prev[rutaId].map(s => s.id === stepId ? { ...s, done: newDone } : s) }));
  };

  const editRuta = async (id, name) => {
    await supabase.from("rutas").update({ name }).eq("id", id);
    setRutas(prev => prev.map(r => r.id === id ? { ...r, name } : r));
  };

  const deleteRuta = async (id) => {
    await supabase.from("rutas").delete().eq("id", id);
    setRutas(prev => prev.filter(r => r.id !== id));
    setSelected(null);
  };

  const editStep = async (stepId, label) => {
    await supabase.from("ruta_steps").update({ label }).eq("id", stepId);
    setStepsMap(prev => {
      const updated = { ...prev };
      for (const rid in updated) {
        updated[rid] = updated[rid].map(s => s.id === stepId ? { ...s, label } : s);
      }
      return updated;
    });
  };

  const deleteStep = async (stepId, rutaId) => {
    await supabase.from("ruta_steps").delete().eq("id", stepId);
    setStepsMap(prev => ({ ...prev, [rutaId]: prev[rutaId].filter(s => s.id !== stepId) }));
  };

  const addRuta = async () => {
    if (!newName.trim()) return;
    const validSteps = newSteps.filter(s => s.text.trim());
    if (!validSteps.length) return;
    const { data: rData } = await supabase.from("rutas").insert([{ name: newName.trim(), completed: false }]).select();
    if (rData) {
      const rid = rData[0].id;
      const stepsToInsert = validSteps.map((s, i) => ({ ruta_id: rid, label: s.text.trim(), type: "encargo", order: i + 1, done: false }));
      const { data: sData } = await supabase.from("ruta_steps").insert(stepsToInsert).select();
      setRutas(prev => [...prev, rData[0]]);
      if (sData) setStepsMap(prev => ({ ...prev, [rid]: sData }));
    }
    setNewName(""); setNewSteps([{ id: 1, text: "" }]); setShowModal(false);
  };

  if (loading) return <Loading />;

  if (selected !== null) {
    const ruta = rutas.find(r => r.id === selected);
    if (!ruta) { setSelected(null); return null; }
    const steps = stepsMap[selected] || [];
    return (
      <RutaDetail
        ruta={ruta}
        steps={steps}
        onBack={() => setSelected(null)}
        onComplete={markComplete}
        onToggleStep={toggleStep}
        onEditRuta={editRuta}
        onDeleteRuta={deleteRuta}
        onEditStep={editStep}
        onDeleteStep={deleteStep}
      />
    );
  }

  const activas = rutas.filter(r => !r.completed);
  const completadas = rutas.filter(r => r.completed);
  const lista = tab === "activas" ? activas : completadas;

  return (
    <div style={{ position: "relative" }}>
      <ScreenHeader title="Rutas" sub={`${activas.length} activas · ${completadas.length} completadas`} btnLabel="+ Ruta" btnColor={COLORS.ruta} onBtn={() => setShowModal(true)} />
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {["activas","completadas"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: `1px solid ${tab === t ? COLORS.ruta : COLORS.border}`, background: tab === t ? COLORS.ruta + "22" : "transparent", color: tab === t ? COLORS.text : COLORS.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{t === "activas" ? "Activas" : "Completadas"}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {lista.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 32 }}>Sin rutas aquí</div>}
        {lista.map(r => {
          const steps = stepsMap[r.id] || [];
          const done = steps.filter(s => s.done).length;
          const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
          return (
            <button key={r.id} onClick={() => setSelected(r.id)} style={{ background: COLORS.surface, border: `1px solid ${r.completed ? COLORS.accent + "44" : COLORS.border}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: r.completed ? COLORS.textMuted : COLORS.text }}>{r.name}</span>
                <span style={{ fontSize: 12, color: r.completed ? COLORS.accent : COLORS.textMuted }}>{r.completed ? "✓" : `${done}/${steps.length}`}</span>
              </div>
              <div style={{ height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: r.completed ? COLORS.accent : COLORS.ruta, borderRadius: 2 }} />
              </div>
            </button>
          );
        })}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Nueva ruta</div>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre de la ruta"
              style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Pasos</div>
              <button onClick={() => setNewSteps(prev => [...prev, { id: Date.now(), text: "" }])} style={{ background: "none", border: "none", color: COLORS.ruta, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Paso</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {newSteps.map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: COLORS.textMuted, flexShrink: 0 }}>{i + 1}</div>
                  <input value={s.text} onChange={e => setNewSteps(prev => prev.map(x => x.id === s.id ? { ...x, text: e.target.value } : x))} placeholder={`Paso ${i + 1}`}
                    style={{ flex: 1, background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "9px 12px", color: COLORS.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  {newSteps.length > 1 && <button onClick={() => setNewSteps(prev => prev.filter(x => x.id !== s.id))} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 18 }}>×</button>}
                </div>
              ))}
            </div>
            <button onClick={addRuta} style={{ width: "100%", background: newName.trim() ? COLORS.ruta : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: COLORS.bg, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Crear ruta</button>
          </div>
        </div>
      )}
    </div>
  );
}