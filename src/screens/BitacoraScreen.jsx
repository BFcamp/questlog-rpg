import { useState, useRef, useEffect } from "react";
import { COLORS, typeColor } from "../constants/colors";
import { Badge } from "../components/Badge";
import { createCalendarEvent } from "../services/googleCalendar";

const SLOT_POOL = [
  { id: "m1", label: "Enviar informe Q2", type: "mision" },
  { id: "m2", label: "Llamar al cliente", type: "mision" },
  { id: "m3", label: "Reunión con dirección", type: "jefe" },
  { id: "e1", label: "Comprar regalo cumpleaños", type: "encargo" },
  { id: "e2", label: "Canilla que gotea", type: "encargo" },
  { id: "c1", label: "Revisar mockups App", type: "campana" },
  { id: "d1", label: "Meditar 10 minutos", type: "desafio" },
  { id: "d2", label: "30 min de lectura", type: "desafio" },
];

const ALL_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${String(h).padStart(2, "0")}:${m}`;
});

function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function isToday(date) { return date.toDateString() === new Date().toDateString(); }
function makeKey(date, time) { return `${date.toISOString().slice(0, 10)}|${time}`; }

function TaskPanel({ tasks, assigned, onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const filters = ["all", "mision", "jefe", "campana", "encargo", "desafio", "ruta"];
  const assignedIds = Object.values(assigned).map(t => t.id);
  const available = tasks.filter(t => {
    if (assignedIds.includes(t.id)) return false;
    if (filter !== "all" && t.type !== filter) return false;
    if (search && !t.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#00000066", zIndex: 150 }} />
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 390, background: COLORS.surface, borderRadius: "20px 20px 0 0", border: `1px solid ${COLORS.border}`, zIndex: 200, display: "flex", flexDirection: "column", maxHeight: "70vh" }}>
        <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 14px" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>Tareas pendientes</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>{available.length} disponibles</div>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar tarea..."
            style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "9px 12px", color: COLORS.text, fontSize: 13, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2, marginBottom: 12 }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ flexShrink: 0, padding: "5px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", border: `1px solid ${filter === f ? typeColor(f === "all" ? "mision" : f) : COLORS.border}`, background: filter === f ? typeColor(f === "all" ? "mision" : f) + "22" : "transparent", color: filter === f ? COLORS.text : COLORS.textMuted }}>
                {f === "all" ? "Todas" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowY: "auto", padding: "0 16px 24px", flex: 1, scrollbarWidth: "none" }}>
          {available.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13, textAlign: "center", marginTop: 24 }}>Sin tareas disponibles</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {available.map(t => (
              <button key={t.id} onClick={() => onSelect(t)} style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.surfaceLight, border: `1px solid ${typeColor(t.type)}33`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: typeColor(t.type), flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: COLORS.text }}>{t.label}</span>
                <Badge type={t.type} small />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function DayView({ date, assignments, onSlotTap, onRemove }) {
  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 14 * 40; }, [date.toDateString()]);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ padding: "10px 0", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: isToday(date) ? COLORS.accent : COLORS.text }}>{date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}</div>
        {isToday(date) && <span style={{ fontSize: 10, color: COLORS.accent, fontWeight: 700 }}>HOY</span>}
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        {ALL_SLOTS.map((time) => {
          const key = makeKey(date, time);
          const task = assignments[key];
          const isHour = time.endsWith(":00");
          return (
            <div key={time} style={{ display: "flex", alignItems: "stretch", minHeight: 40, borderBottom: `1px solid ${isHour ? COLORS.border : COLORS.border + "44"}` }}>
              <div style={{ width: 50, flexShrink: 0, display: "flex", alignItems: "center", paddingLeft: 4, fontSize: 11, color: isHour ? COLORS.textMuted : "transparent" }}>{isHour ? time : ""}</div>
              <div onClick={() => task ? onRemove(key) : onSlotTap(key)} style={{ flex: 1, margin: "2px 6px 2px 0", borderRadius: 6, cursor: "pointer", background: task ? typeColor(task.type) + "33" : "transparent", border: task ? `1px solid ${typeColor(task.type)}66` : "1px solid transparent", display: "flex", alignItems: "center", paddingLeft: task ? 8 : 0, minHeight: 36 }}>
                {task && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, overflow: "hidden" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: typeColor(task.type), flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{task.label}</span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted, paddingRight: 8 }}>×</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

function ThreeDayView({ startDate, assignments, onSlotTap, onRemove, onDaySelect }) {
  const days = [0,1,2].map(n => addDays(startDate, n));
  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 14 * 32; }, [startDate.toDateString()]);
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
        <div style={{ width: 40, flexShrink: 0 }} />
        {days.map((d, i) => (
          <button key={i} onClick={() => onDaySelect(d)} style={{ flex: 1, padding: "8px 4px", background: "none", border: "none", cursor: "pointer", borderBottom: isToday(d) ? `2px solid ${COLORS.accent}` : "2px solid transparent" }}>
            <div style={{ fontSize: 10, color: isToday(d) ? COLORS.accent : COLORS.textMuted, textTransform: "uppercase" }}>{d.toLocaleDateString("es-AR", { weekday: "short" }).slice(0,3)}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: isToday(d) ? COLORS.accent : COLORS.text }}>{d.getDate()}</div>
          </button>
        ))}
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        {ALL_SLOTS.map((time) => {
          const isHour = time.endsWith(":00");
          return (
            <div key={time} style={{ display: "flex", alignItems: "stretch", minHeight: 32, borderBottom: `1px solid ${isHour ? COLORS.border : COLORS.border + "33"}` }}>
              <div style={{ width: 40, flexShrink: 0, display: "flex", alignItems: "center", paddingLeft: 4, fontSize: 10, color: isHour ? COLORS.textMuted : "transparent" }}>{isHour ? time : ""}</div>
              {days.map((d, di) => {
                const key = makeKey(d, time);
                const task = assignments[key];
                return (
                  <div key={di} onClick={() => task ? onRemove(key) : onSlotTap(key, d)} style={{ flex: 1, margin: "1px 2px", borderRadius: 4, cursor: "pointer", background: task ? typeColor(task.type) + "44" : "transparent", borderLeft: task ? `2px solid ${typeColor(task.type)}` : "none", display: "flex", alignItems: "center", overflow: "hidden" }}>
                    {task && <span style={{ fontSize: 9, color: COLORS.text, paddingLeft: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.label}</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}

export function BitacoraScreen({ googleToken, onConectarGoogle }) {
  const [view, setView] = useState("3dias");
  const today = new Date(); today.setHours(0,0,0,0);
  const [startDate, setStartDate] = useState(today);
  const [selectedDay, setSelectedDay] = useState(today);
  const [assignments, setAssignments] = useState({});
  const [showPanel, setShowPanel] = useState(false);
  const [pendingSlot, setPendingSlot] = useState(null);

  const handleSlotTap = (key, dayForView) => {
    if (dayForView) setSelectedDay(dayForView);
    setPendingSlot(key);
    setShowPanel(true);
  };

  const handleSelect = async (task) => {
    setAssignments(prev => ({ ...prev, [pendingSlot]: task }));
    setShowPanel(false);

    if (googleToken && pendingSlot) {
      const [dateStr, time] = pendingSlot.split('|');
      const date = new Date(dateStr);
      try {
        await createCalendarEvent(googleToken, task, date, time);
      } catch (err) {
        console.error('Error enviando a Calendar:', err);
      }
    }

    setPendingSlot(null);
  };

  const handleRemove = (key) => {
    setAssignments(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleDaySelect = (d) => { setSelectedDay(d); setView("dia"); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      <div style={{ flexShrink: 0, paddingBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, fontFamily: "Georgia, serif" }}>Bitácora</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {!googleToken ? (
              <button onClick={onConectarGoogle} style={{ display: "flex", alignItems: "center", gap: 5, background: "#4285f422", border: "1px solid #4285f444", borderRadius: 10, padding: "7px 12px", cursor: "pointer", color: "#4285f4", fontSize: 12, fontWeight: 600 }}>
                <span style={{ fontSize: 13 }}>📅</span> Calendar
              </button>
            ) : (
              <span style={{ fontSize: 11, color: COLORS.desafio, fontWeight: 600 }}>✓ Calendar</span>
            )}
            <button onClick={() => {}} style={{ display: "flex", alignItems: "center", gap: 5, background: "#c0392b22", border: "1px solid #c0392b66", borderRadius: 10, padding: "7px 12px", cursor: "pointer", color: "#c0392b", fontSize: 12, fontWeight: 700 }}>
              <span style={{ fontSize: 13 }}>⚠</span> Trampas
            </button>
            <button onClick={() => { setPendingSlot(null); setShowPanel(true); }} style={{ display: "flex", alignItems: "center", gap: 5, background: COLORS.accent + "22", border: `1px solid ${COLORS.accent}44`, borderRadius: 10, padding: "7px 12px", cursor: "pointer", color: COLORS.accent, fontSize: 12, fontWeight: 600 }}>
              <span style={{ fontSize: 13 }}>📋</span> Tareas
            </button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 4, flex: 1 }}>
            {[["3dias","3 Días"],["dia","Día"]].map(([k,l]) => (
              <button key={k} onClick={() => setView(k)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${view === k ? COLORS.accent : COLORS.border}`, background: view === k ? COLORS.accent + "22" : "transparent", color: view === k ? COLORS.accent : COLORS.textMuted }}>{l}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => view === "3dias" ? setStartDate(d => addDays(d, -3)) : setSelectedDay(d => addDays(d, -1))} style={{ background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: COLORS.textMuted, fontSize: 16 }}>←</button>
            <button onClick={() => view === "3dias" ? setStartDate(d => addDays(d, 3)) : setSelectedDay(d => addDays(d, 1))} style={{ background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: COLORS.textMuted, fontSize: 16 }}>→</button>
          </div>
        </div>
      </div>

      {view === "3dias" && <ThreeDayView startDate={startDate} assignments={assignments} onSlotTap={handleSlotTap} onRemove={handleRemove} onDaySelect={handleDaySelect} />}
      {view === "dia" && <DayView date={selectedDay} assignments={assignments} onSlotTap={(key) => handleSlotTap(key)} onRemove={handleRemove} />}
      {showPanel && <TaskPanel tasks={SLOT_POOL} assigned={assignments} onSelect={handleSelect} onClose={() => { setShowPanel(false); setPendingSlot(null); }} />}
    </div>
  );
}