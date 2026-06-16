import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { COLORS } from "../constants/colors";
import { ScreenHeader } from "../components/ScreenHeader";
import { Checkbox } from "../components/Checkbox";
import { SimpleModal } from "../components/SimpleModal";
import { Loading } from "../components/Loading";

export function CampanasScreen({ onBack }) {
  const [campanas, setCampanas] = useState([]);
  const [taskMap, setTaskMap] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewCampana, setShowNewCampana] = useState(false);
  const [showNewTarea, setShowNewTarea] = useState(false);

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

  const addTarea = async (label) => {
    const c = campanas[selected];
    const { data } = await supabase.from("tasks").insert([{ type: "campana", label, campana_id: c.id, done: false }]).select();
    if (data) setTaskMap(prev => ({ ...prev, [c.id]: [...(prev[c.id] || []), data[0]] }));
    setShowNewTarea(false);
  };

  const toggleTarea = async (cid, tid) => {
    const task = (taskMap[cid] || []).find(t => t.id === tid);
    const newDone = !task.done;
    await supabase.from("tasks").update({ done: newDone }).eq("id", tid);
    setTaskMap(prev => ({ ...prev, [cid]: prev[cid].map(t => t.id === tid ? { ...t, done: newDone } : t) }));
  };

  if (loading) return <Loading />;

  if (selected !== null) {
    const c = campanas[selected];
    const tasks = taskMap[c.id] || [];
    const done = tasks.filter(t => t.done).length;
    const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    return (
      <div style={{ position: "relative" }}>
        <ScreenHeader title={c.name} sub={`${done}/${tasks.length} tareas`} btnLabel="+ Tarea" btnColor={COLORS.campana} onBtn={() => setShowNewTarea(true)} onBack={() => setSelected(null)} />
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: COLORS.textMuted }}>Progreso</span>
            <span style={{ fontSize: 12, color: COLORS.campana }}>{pct}%</span>
          </div>
          <div style={{ height: 5, background: COLORS.border, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: COLORS.campana, borderRadius: 3 }} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tasks.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 32 }}>Sin tareas aún</div>}
          {tasks.map(t => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.surface, borderRadius: 10, padding: "11px 12px", border: `1px solid ${COLORS.border}` }}>
              <Checkbox done={t.done} onChange={() => toggleTarea(c.id, t.id)} />
              <span style={{ flex: 1, fontSize: 14, color: t.done ? COLORS.textMuted : COLORS.text, textDecoration: t.done ? "line-through" : "none" }}>{t.label}</span>
            </div>
          ))}
        </div>
        {showNewTarea && <SimpleModal title="Nueva tarea" placeholder="¿Qué hay que hacer?" btnLabel="Agregar" btnColor={COLORS.campana} onClose={() => setShowNewTarea(false)} onAdd={addTarea} />}
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <ScreenHeader title="Campañas" sub="Tus proyectos activos" btnLabel="+ Campaña" btnColor={COLORS.campana} onBtn={() => setShowNewCampana(true)} onBack={onBack} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {campanas.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 32 }}>Sin campañas aún</div>}
        {campanas.map((c, i) => {
          const tasks = taskMap[c.id] || [];
          const done = tasks.filter(t => t.done).length;
          const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
          return (
            <button key={c.id} onClick={() => setSelected(i)} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left" }}>
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