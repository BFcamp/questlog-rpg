import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { COLORS, typeColor } from "../constants/colors";
import { Checkbox } from "../components/Checkbox";
import { Badge } from "../components/Badge";
import { Loading } from "../components/Loading";
import { BandejaScreen } from "./BandejaScreen";
import { PersonajeModal } from "./PersonajeScreen";

const SLOT_HEIGHT = 64; // alto de cada tarjeta + gap, usado para el cálculo de drag

const typeLabel = {
  mision: "Misión", rutina: "Rutina", campana: "Campaña", desafio: "Desafío",
};

function getNivelMinPC(nivel) {
  const tabla = [0, 0, 1000, 2000, 3000, 4500, 7500, 12000, 18000, 26000, 36000];
  return tabla[nivel] || 0;
}
function getNivelSiguientePC(nivel) {
  const tabla = [0, 1000, 2000, 3000, 4500, 7500, 12000, 18000, 26000, 36000, 36000];
  return tabla[nivel] || 36000;
}

export function TodayScreen({ pinnedDesafios, character, googleToken, onConectarGoogle, onSumarPC }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState("hoy");
  const [showPersonaje, setShowPersonaje] = useState(false);

  // drag state
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const dragRef = useRef({ startY: 0 });

  useEffect(() => { fetchItems(); }, [pinnedDesafios]);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("done", false)
      .in("type", ["mision", "rutina", "campana"]);

    const tareas = (data || []).map(t => ({
      id: t.id,
      label: t.label,
      type: t.type,
      source: "tasks",
      orden: t.orden,
      created_at: t.created_at,
    }));

    const desafios = (pinnedDesafios || []).map(d => ({
      id: d.id,
      label: d.label,
      type: "desafio",
      source: "desafios",
      orden: d.orden,
      created_at: d.created_at,
      progress: d.progress,
      total: d.total,
    }));

    const combined = [...tareas, ...desafios].sort((a, b) => {
      const oa = a.orden ?? 999999;
      const ob = b.orden ?? 999999;
      if (oa !== ob) return oa - ob;
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    });

    setItems(combined);
    setLoading(false);
  };

  const toggle = async (item) => {
    await supabase.from("tasks").update({ done: true }).eq("id", item.id);
    setItems(prev => prev.filter(x => x.id !== item.id || x.source !== "tasks"));
    if (onSumarPC && (item.type === "mision" || item.type === "rutina")) {
      await onSumarPC(item.type);
    }
    // Campaña: solo se marca, el PC se otorga desde la pantalla Campañas al completar todas
  };

  const persistirOrden = async (lista) => {
    const tareasIds = lista.filter(i => i.source === "tasks").map((i, idx) => ({ id: i.id, orden: lista.indexOf(i) }));
    const desafiosIds = lista.filter(i => i.source === "desafios").map((i) => ({ id: i.id, orden: lista.indexOf(i) }));
    await Promise.all([
      ...lista.map((it, idx) =>
        supabase.from(it.source === "tasks" ? "tasks" : "desafios").update({ orden: idx }).eq("id", it.id)
      ),
    ]);
  };

  // ── DRAG HANDLERS ──────────────────────────────────────────────────────────

  const handlePointerDown = (e, index) => {
    dragRef.current.startY = e.clientY;
    setDraggingIndex(index);
    setDragOffset(0);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (draggingIndex === null) return;
    let delta = e.clientY - dragRef.current.startY;

    // swap hacia abajo
    while (delta > SLOT_HEIGHT / 2 && draggingIndex < items.length - 1) {
      setItems(prev => {
        const arr = [...prev];
        const cur = draggingIndex;
        [arr[cur], arr[cur + 1]] = [arr[cur + 1], arr[cur]];
        return arr;
      });
      setDraggingIndex(i => i + 1);
      dragRef.current.startY += SLOT_HEIGHT;
      delta -= SLOT_HEIGHT;
    }
    // swap hacia arriba
    while (delta < -SLOT_HEIGHT / 2 && draggingIndex > 0) {
      setItems(prev => {
        const arr = [...prev];
        const cur = draggingIndex;
        [arr[cur], arr[cur - 1]] = [arr[cur - 1], arr[cur]];
        return arr;
      });
      setDraggingIndex(i => i - 1);
      dragRef.current.startY -= SLOT_HEIGHT;
      delta += SLOT_HEIGHT;
    }
    setDragOffset(delta);
  };

  const handlePointerUp = () => {
    if (draggingIndex === null) return;
    setDraggingIndex(null);
    setDragOffset(0);
    persistirOrden(items);
  };

  // ── XP BAR ─────────────────────────────────────────────────────────────────

  const level = character ? character.level : 1;
  const xpPct = character
    ? Math.min(100, Math.max(0, Math.round(((character.xp - getNivelMinPC(level)) / (getNivelSiguientePC(level) - getNivelMinPC(level))) * 100)))
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {subTab === "hoy" && (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, fontFamily: "Georgia, serif" }}>Buenos días</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{items.length} pendientes hoy</div>
          </div>

          <div
            onClick={() => setShowPersonaje(true)}
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, cursor: "pointer", background: COLORS.surface, borderRadius: 10, padding: "10px 12px", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>Nv {level}</div>
            <div style={{ flex: 1, height: 6, background: COLORS.border, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${xpPct}%`, height: "100%", background: COLORS.accent, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, color: COLORS.accent }}>👁 ver</div>
          </div>
        </>
      )}

      {/* Sub-tabs: Hoy / Bandeja */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {[["hoy","Hoy"],["bandeja","Bandeja"]].map(([k,l]) => (
          <button key={k} onClick={() => setSubTab(k)} style={{
            flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13,
            fontWeight: 600, cursor: "pointer",
            border: `1px solid ${subTab === k ? COLORS.accent : COLORS.border}`,
            background: subTab === k ? COLORS.accent + "22" : "transparent",
            color: subTab === k ? COLORS.text : COLORS.textMuted,
          }}>{l}</button>
        ))}
      </div>

      <div style={{ height: 1, background: COLORS.border, marginBottom: 18 }} />

      {subTab === "hoy" && (
        loading ? <Loading /> : (
          <div
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ display: "flex", flexDirection: "column", gap: 8, touchAction: draggingIndex !== null ? "none" : "auto" }}
          >
            {items.length === 0 && (
              <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 40 }}>Todo listo por hoy 🎉</div>
            )}
            {items.map((item, index) => {
              const isDragging = draggingIndex === index;
              return (
                <div
                  key={`${item.source}-${item.id}`}
                  onPointerDown={(e) => handlePointerDown(e, index)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: COLORS.surface, borderRadius: 10, padding: "11px 12px",
                    border: `1px solid ${isDragging ? typeColor(item.type) : COLORS.border}`,
                    cursor: "grab", userSelect: "none",
                    transform: isDragging ? `translateY(${dragOffset}px) scale(1.02)` : "none",
                    boxShadow: isDragging ? "0 8px 20px #00000066" : "none",
                    zIndex: isDragging ? 10 : 1,
                    position: "relative",
                    transition: isDragging ? "none" : "transform 0.15s ease",
                  }}
                >
                  <span style={{ color: COLORS.textMuted, fontSize: 14, lineHeight: 1, flexShrink: 0 }}>⠿</span>

                  {item.type === "desafio" ? (
                    <>
                      <span style={{ flex: 1, fontSize: 14, color: COLORS.text }}>{item.label}</span>
                      <span style={{ fontSize: 11, color: typeColor("desafio"), flexShrink: 0 }}>{item.progress}/{item.total}</span>
                    </>
                  ) : (
                    <>
                      <Checkbox done={false} onChange={() => toggle(item)} />
                      <span style={{ flex: 1, fontSize: 14, color: COLORS.text }}>{item.label}</span>
                    </>
                  )}

                  <Badge type={item.type} small />
                </div>
              );
            })}
          </div>
        )
      )}

      {subTab === "bandeja" && (
        <div style={{ flex: 1, overflowY: "auto", margin: "0 -16px", padding: "0 16px" }}>
          <BandejaScreen />
        </div>
      )}

      {showPersonaje && <PersonajeModal character={character} onClose={() => setShowPersonaje(false)} />}
    </div>
  );
}
