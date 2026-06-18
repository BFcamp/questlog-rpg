import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { COLORS } from "../constants/colors";
import { ScreenHeader } from "../components/ScreenHeader";
import { Checkbox } from "../components/Checkbox";
import { SimpleModal } from "../components/SimpleModal";
import { Loading } from "../components/Loading";

const EMOJIS = ["🍳","🏠","💼","🌿","🚗","📚","💪","🛒","🐾","🧹","🔧","💡"];

export function TerrenosScreen({ onSumarPC }) {
  const [terrenos, setTerrenos] = useState([]);
  const [taskMap, setTaskMap] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNuevoTerreno, setShowNuevoTerreno] = useState(false);
  const [showNuevaTarea, setShowNuevaTarea] = useState(false);
  const [newEmoji, setNewEmoji] = useState("🏠");
  const [newName, setNewName] = useState("");
  const [editandoTerreno, setEditandoTerreno] = useState(null);
  const [editandoTarea, setEditandoTarea] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editEmoji, setEditEmoji] = useState("🏠");

  useEffect(() => { fetchTerrenos(); }, []);

  const fetchTerrenos = async () => {
    const { data: tData } = await supabase.from("terrenos").select("*");
    const { data: tasks } = await supabase.from("tasks").select("*").not("terrain_id", "is", null);
    if (tData) setTerrenos(tData);
    if (tasks) {
      const map = {};
      tasks.forEach(t => {
        if (!map[t.terrain_id]) map[t.terrain_id] = [];
        map[t.terrain_id].push(t);
      });
      setTaskMap(map);
    }
    setLoading(false);
  };

  const addTerreno = async () => {
    if (!newName.trim()) return;
    const { data } = await supabase.from("terrenos").insert([{ name: newName.trim(), emoji: newEmoji }]).select();
    if (data) { setTerrenos(prev => [...prev, data[0]]); setTaskMap(prev => ({ ...prev, [data[0].id]: [] })); }
    setNewName(""); setShowNuevoTerreno(false);
  };

  const guardarTerreno = async () => {
    if (!editNombre.trim()) return;
    await supabase.from("terrenos").update({ name: editNombre.trim(), emoji: editEmoji }).eq("id", editandoTerreno.id);
    setTerrenos(prev => prev.map(t => t.id === editandoTerreno.id ? { ...t, name: editNombre.trim(), emoji: editEmoji } : t));
    setEditandoTerreno(null);
  };

  const eliminarTerreno = async (id) => {
    await supabase.from("terrenos").delete().eq("id", id);
    setTerrenos(prev => prev.filter(t => t.id !== id));
    setEditandoTerreno(null);
    setSelected(null);
  };

  const addTarea = async (label) => {
    const t = terrenos.find(x => x.id === selected);
    const { data } = await supabase.from("tasks").insert([{ type: "rutina", label, terrain_id: t.id, done: false }]).select();
    if (data) setTaskMap(prev => ({ ...prev, [t.id]: [...(prev[t.id] || []), data[0]] }));
    setShowNuevaTarea(false);
  };

  const toggleTask = async (tid, taskId) => {
    await supabase.from("tasks").update({ done: true }).eq("id", taskId);
    setTaskMap(prev => ({ ...prev, [tid]: prev[tid].map(t => t.id === taskId ? { ...t, done: true } : t) }));
    if (onSumarPC) await onSumarPC("rutina");
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

  // Vista interior de un terreno
  if (selected !== null) {
    const t = terrenos.find(x => x.id === selected);
    if (!t) { setSelected(null); return null; }
    const tasks = taskMap[t.id] || [];
    const done = tasks.filter(x => x.done).length;

    return (
      <div style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 13, padding: 0 }}>← Terrenos</button>
          <button
            onClick={() => { setEditandoTerreno(t); setEditNombre(t.name); setEditEmoji(t.emoji); }}
            style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: COLORS.textMuted, fontSize: 12 }}>✎ Editar</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, fontFamily: "Georgia, serif" }}>{t.emoji} {t.name}</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{done}/{tasks.length} hoy</div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
          <button onClick={() => setShowNuevaTarea(true)} style={{ background: COLORS.rutina + "22", border: `1px solid ${COLORS.rutina}44`, borderRadius: 10, padding: "8px 14px", cursor: "pointer", color: COLORS.rutina, fontSize: 13, fontWeight: 600 }}>+ Tarea</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tasks.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 32 }}>Sin tareas aún</div>}
          {tasks.map(task => (
            <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.surface, borderRadius: 10, padding: "11px 12px", border: `1px solid ${COLORS.border}` }}>
              <Checkbox done={task.done} onChange={() => !task.done && toggleTask(t.id, task.id)} />
              <span style={{ flex: 1, fontSize: 14, color: task.done ? COLORS.textMuted : COLORS.text, textDecoration: task.done ? "line-through" : "none" }}>{task.label}</span>
              {!task.done && (
                <button
                  onClick={() => { setEditandoTarea(task); setEditNombre(task.label); }}
                  style={{ background: "none", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: COLORS.textMuted, fontSize: 12 }}>✎</button>
              )}
            </div>
          ))}
        </div>

        {showNuevaTarea && <SimpleModal title="Nueva tarea" placeholder="¿Qué hay que hacer?" btnLabel="Agregar" btnColor={COLORS.rutina} onClose={() => setShowNuevaTarea(false)} onAdd={addTarea} />}

        {/* Modal editar tarea */}
        {editandoTarea && (
          <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setEditandoTarea(null)}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box" }}>
              <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Editar tarea</div>
              <input value={editNombre} onChange={e => setEditNombre(e.target.value)} placeholder="Nombre de la tarea"
                style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={guardarTarea} style={{ flex: 1, background: editNombre.trim() ? COLORS.rutina : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: editNombre.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Guardar</button>
                <button onClick={() => eliminarTarea(editandoTarea.id)} style={{ background: "#e05c5c22", border: "1px solid #e05c5c44", borderRadius: 12, padding: "13px 16px", cursor: "pointer", color: "#e05c5c", fontSize: 14, fontWeight: 700 }}>Eliminar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal editar terreno */}
        {editandoTerreno && (
          <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setEditandoTerreno(null)}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box" }}>
              <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Editar terreno</div>
              <input value={editNombre} onChange={e => setEditNombre(e.target.value)} placeholder="Nombre del terreno"
                style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
              <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Emoji</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setEditEmoji(e)} style={{ width: 40, height: 40, borderRadius: 10, fontSize: 20, background: editEmoji === e ? COLORS.accent + "22" : COLORS.surfaceLight, border: `1px solid ${editEmoji === e ? COLORS.accent : COLORS.border}`, cursor: "pointer" }}>{e}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={guardarTerreno} style={{ flex: 1, background: editNombre.trim() ? COLORS.rutina : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: editNombre.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Guardar</button>
                <button onClick={() => eliminarTerreno(editandoTerreno.id)} style={{ background: "#e05c5c22", border: "1px solid #e05c5c44", borderRadius: 12, padding: "13px 16px", cursor: "pointer", color: "#e05c5c", fontSize: 14, fontWeight: 700 }}>Eliminar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista lista de terrenos
  return (
    <div style={{ position: "relative" }}>
      <ScreenHeader title="Terrenos" sub="Rutinas del día" btnLabel="+ Terreno" btnColor={COLORS.rutina} onBtn={() => { setNewName(""); setNewEmoji("🏠"); setShowNuevoTerreno(true); }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {terrenos.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 32 }}>Sin terrenos aún</div>}
        {terrenos.map((t) => {
          const tasks = taskMap[t.id] || [];
          const done = tasks.filter(x => x.done).length;
          const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
          return (
            <button key={t.id} onClick={() => setSelected(t.id)} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{t.emoji}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{t.name}</span>
                </div>
                <span style={{ fontSize: 12, color: COLORS.textMuted }}>{done}/{tasks.length}</span>
              </div>
              <div style={{ height: 4, background: COLORS.border, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: COLORS.rutina, borderRadius: 2 }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal nuevo terreno */}
      {showNuevoTerreno && (
        <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={() => setShowNuevoTerreno(false)}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 28px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box" }}>
            <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Nuevo terreno</div>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre del terreno"
              style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
            <div style={{ fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Emoji</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setNewEmoji(e)} style={{ width: 40, height: 40, borderRadius: 10, fontSize: 20, background: newEmoji === e ? COLORS.accent + "22" : COLORS.surfaceLight, border: `1px solid ${newEmoji === e ? COLORS.accent : COLORS.border}`, cursor: "pointer" }}>{e}</button>
              ))}
            </div>
            <button onClick={addTerreno} style={{ width: "100%", background: newName.trim() ? COLORS.rutina : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: newName.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Crear terreno</button>
          </div>
        </div>
      )}
    </div>
  );
}