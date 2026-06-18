import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { COLORS } from "../constants/colors";
import { ScreenHeader } from "../components/ScreenHeader";
import { Checkbox } from "../components/Checkbox";
import { SimpleModal } from "../components/SimpleModal";
import { Loading } from "../components/Loading";

export function CampanasScreen({ onBack, onSumarPC }) {
  const [campanas, setCampanas] = useState([]);
  const [taskMap, setTaskMap] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewCampana, setShowNewCampana] = useState(false);
  const [showNewTarea, setShowNewTarea] = useState(false);
  const [editandoCampana, setEditandoCampana] = useState(null);
  const [editandoTarea, setEditandoTarea] = useState(null);
  const [editNombre, setEditNombre] = useState("");

  useEffect(() => { fetchCampanas(); }, []);

  const fetchCampanas = async () => {
    const { data: cData } = await supabase.from("campanas").select("*");
    const { data: tasks } = await supabase.from("tasks").select("*").not("campana_id", "is", null);
    if (cData) setCampanas(cData);
    if (tasks) {
      const map = {};
      tasks.forEach(t => {
        if (!map[t.campana_id]) map[t.campana_id] = [];
        map[t.campana_id].push(t);
      });
      setTaskMap(map);
    }
    setLoading(false);
  };

  const addCampana = async (name) => {
    const { data } = await supabase.from("campanas").insert([{ name }]).select();
    if (data) { setCampanas(prev => [...prev, data[0]]); setTaskMap(prev => ({ ...prev, [data[0].id]: [] })); }
    setShowNewCampana(false);
  };

  const guardarCampana = async () => {
    if (!editNombre.trim()) return;
    await supabase.from("campanas").update({ name: editNombre.trim() }).eq("id", editandoCampana.id);
    setCampanas(prev => prev.map(c => c.id === editandoCampana.id ? { ...c, name: editNombre.trim() } : c));
    setEditandoCampana(null);
  };

  const eliminarCampana = async (id) => {
    await supabase.from("campanas").delete().eq("id", id);
    setCampanas(prev => prev.filter(c => c.id !== id));
    setEditandoCampana(null);
    setSelected(null);
  };

  const addTarea = async (label) => {
    const c = campanas.find(x => x.id === selected);
    const { data } = await supabase.from("tasks").insert([{ type: "campana", label, campana_id: c.id, done: false }]).select();
    if (data) setTaskMap(prev => ({ ...prev, [c.id]: [...(prev[c.id] || []), data[0]] }));
    setShowNewTarea(false);
  };

  const toggleTarea = async (cid, tid) => {
    const task = (taskMap[cid] || []).find(t => t.id === tid);
    const newDone = !task.done;
    await supabase.from("tasks").update({ done: newDone }).eq("id", tid);
    setTaskMap(prev => ({ ...prev, [cid]: prev[cid].map(t => t.id === tid ? { ...t, done: newDone } : t) }));

    // Si se completan todas las tareas, suma PC de campaña
    const updatedTasks = (taskMap[cid] || []).map(t => t.id === tid ? { ...t, done: newDone } : t);
    const todasCompletadas = updatedTasks.every(t => t.done);
    if (todasCompletadas && onSumarPC) await onSumarPC("campana");
  };

  const guardarTarea = async () => {
    if (!editNombre.trim()) return;
    await supabase.from("tasks").update({ label: editNombre.trim() }).eq("id", editandoTarea.id);
    setTaskMap(prev => ({
      ...prev,
      [selected]: prev[selected].map(t => t.id === editandoTarea.id ? { ...t, label: editNombre.trim() } : t)
    }));
    setEditandoTarea(null);
  };

  const eliminarTarea = async (taskId) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    setTaskMap(prev => ({ ...prev, [selected]: prev[selected].filter(t => t.id !== taskId) }));
    setEditandoTarea(null);
  };

  if (loading) return <Loading />;

  // Vista interior de una campaña
  if (selected !== null) {
    const c = campanas.find(x => x.id === selected);
    if (!c) { setSelected(null); return null; }
    const tasks = taskMap[c.id] || [];
    const done = tasks.filter(t => t.done).length;
    const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

    return (
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 13, padding: 0 }}>← Campañas</button>
          <button
            onClick={() => { setEditandoCampana(c); setEditNombre(c.name); }}
            style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: COLORS.textMuted, fontSize: 12 }}>✎ Editar</button>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, fontFamily: "Georgia, serif", marginBottom: 2 }}>{c.name}</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted }}>{done}/{tasks.length} tareas</div>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: COLORS.textMuted }}>Progreso</span>
              <span style={{ fontSize: 12, color: COLORS.campana }}>{pct}%</span>
            </div>
            <div style={{ height: 5, background: COLORS.border, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: COLORS.campana, borderRadius: 3 }} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
          <button onClick={() => setShowNewTarea(true)} style={{ background: COLORS.campana + "22", border: `1px solid ${COLORS.campana}44`, borderRadius: 10, padding: "8px 14px", cursor: "pointer", color: COLORS.campana, fontSize: 13, fontWeight: 600 }}>+ Tarea</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tasks.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 32 }}>Sin tareas aún</div>}
          {tasks.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.surface, borderRadius: 10, padding: "11px 12px", border: `1px solid ${COLORS.border}` }}>
              <Checkbox done={t.done} onChange={() => toggleTarea(c.id, t.id)} />
              <span style={{ flex: 1, fontSize: 14, color: t.done ? COLORS.textMuted : COLORS.text, textDecoration: t.done ? "line-through" : "none" }}>{t.label}</span>
              {!t.done && (
                <button
                  onClick={() => { setEditandoTarea(t); setEditNombre(t.label); }}
                  style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: COLORS.textMuted, fontSize: 12 }}>✎</button>
              )}
            </div>
          ))}
        </div>

        {showNewTarea && <SimpleModal title="Nueva tarea" placeholder="¿Qué hay que hacer?" btnLabel="Agregar" btnColor={COLORS.campana} onClose={() => setShowNewTarea(false)} onAdd={addTarea} />}

        {/* Modal editar tarea */}
        {editandoTarea && (
          <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setEditandoTarea(null)}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box" }}>
              <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Editar tarea</div>
              <input value={editNombre} onChange={e => setEditNombre(e.target.value)} placeholder="Nombre de la tarea"
                style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={guardarTarea} style={{ flex: 1, background: editNombre.trim() ? COLORS.campana : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: editNombre.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Guardar</button>
                <button onClick={() => eliminarTarea(editandoTarea.id)} style={{ background: "#e05c5c22", border: "1px solid #e05c5c44", borderRadius: 12, padding: "13px 16px", cursor: "pointer", color: "#e05c5c", fontSize: 14, fontWeight: 700 }}>Eliminar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal editar campaña */}
        {editandoCampana && (
          <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setEditandoCampana(null)}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box" }}>
              <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Editar campaña</div>
              <input value={editNombre} onChange={e => setEditNombre(e.target.value)} placeholder="Nombre de la campaña"
                style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={guardarCampana} style={{ flex: 1, background: editNombre.trim() ? COLORS.campana : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: editNombre.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Guardar</button>
                <button onClick={() => eliminarCampana(editandoCampana.id)} style={{ background: "#e05c5c22", border: "1px solid #e05c5c44", borderRadius: 12, padding: "13px 16px", cursor: "pointer", color: "#e05c5c", fontSize: 14, fontWeight: 700 }}>Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista lista de campañas
  return (
    <div style={{ position: "relative" }}>
      <ScreenHeader title="Campañas" sub="Tus proyectos activos" btnLabel="+ Campaña" btnColor={COLORS.campana} onBtn={() => setShowNewCampana(true)} onBack={onBack} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {campanas.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 32 }}>Sin campañas aún</div>}
        {campanas.map((c) => {
          const tasks = taskMap[c.id] || [];
          const done = tasks.filter(t => t.done).length;
          const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
          return (
            <button key={c.id} onClick={() => setSelected(c.id)} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{c.name}</span>
                <span style={{ fontSize: 12, color: COLORS.textMuted }}>{done}/{tasks.length}</span>
              </div>
              <div style={{ height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ width: `${pct}%`, height: "100%", background: COLORS.campana, borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 12, color: COLORS.campana }}>{pct}% completado</div>
            </button>
          );
        })}
      </div>
      {showNewCampana && <SimpleModal title="Nueva campaña" placeholder="Nombre de la campaña" btnLabel="Crear campaña" btnColor={COLORS.campana} onClose={() => setShowNewCampana(false)} onAdd={addCampana} />}
    </div>
  );
}