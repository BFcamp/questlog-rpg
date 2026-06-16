import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { COLORS } from "../constants/colors";
import { Section } from "../components/Section";
import { Checkbox } from "../components/Checkbox";
import { Loading } from "../components/Loading";
import { BitacoraScreen } from "./BitacoraScreen";

export function TodayScreen({ pinnedDesafios, character, googleToken, onConectarGoogle }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState("hoy");

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    const { data } = await supabase.from("tasks").select("*").eq("done", false);
    if (data) setTasks(data);
    setLoading(false);
  };

  const toggle = async (id) => {
    await supabase.from("tasks").update({ done: true }).eq("id", id);
    setTasks(t => t.filter(x => x.id !== id));
  };

  const terrainGroups = {};
  tasks.filter(t => t.type === "rutina").forEach(t => {
    const key = t.terrain_id || "sin terreno";
    if (!terrainGroups[key]) terrainGroups[key] = [];
    terrainGroups[key].push(t);
  });

  const xpPct = character ? Math.round((character.xp % 1000) / 10) : 0;
  const level = character ? character.level : 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Solo visible en sub-tab Hoy */}
      {subTab === "hoy" && (
        <>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, fontFamily: "Georgia, serif" }}>Buenos días</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{tasks.filter(x => x.done).length}/{tasks.length} completadas hoy</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>Nv {level}</div>
            <div style={{ flex: 1, height: 6, background: COLORS.border, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${xpPct}%`, height: "100%", background: COLORS.accent, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>{xpPct}%</div>
          </div>
        </>
      )}

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {[["hoy","Hoy"],["bitacora","Bitácora"]].map(([k,l]) => (
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
        <>
          {loading ? <Loading /> : (
            <>
              <Section label="Misiones" color={COLORS.mision}>
                {tasks.filter(t => t.type === "mision").map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.surface, borderRadius: 10, padding: "10px 12px", border: `1px solid ${COLORS.border}` }}>
                    <Checkbox done={false} onChange={() => toggle(t.id)} />
                    <span style={{ flex: 1, fontSize: 14, color: COLORS.text }}>{t.label}</span>
                  </div>
                ))}
              </Section>
              {Object.entries(terrainGroups).map(([tid, items]) => (
                <Section key={tid} label="Rutinas" color={COLORS.rutina}>
                  {items.map(t => (
                    <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.surface, borderRadius: 10, padding: "10px 12px", border: `1px solid ${COLORS.border}` }}>
                      <Checkbox done={false} onChange={() => toggle(t.id)} />
                      <span style={{ flex: 1, fontSize: 14, color: COLORS.text }}>{t.label}</span>
                    </div>
                  ))}
                </Section>
              ))}
              <Section label="Campañas" color={COLORS.campana}>
                {tasks.filter(t => t.type === "campana").map(t => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, background: COLORS.surface, borderRadius: 10, padding: "10px 12px", border: `1px solid ${COLORS.border}` }}>
                    <Checkbox done={false} onChange={() => toggle(t.id)} />
                    <span style={{ flex: 1, fontSize: 14, color: COLORS.text }}>{t.label}</span>
                  </div>
                ))}
              </Section>
              {pinnedDesafios.length > 0 && (
                <Section label="Desafíos" color={COLORS.desafio}>
                  {pinnedDesafios.map(d => (
                    <div key={d.id} style={{ background: COLORS.surface, borderRadius: 10, padding: "11px 12px", border: `1px solid ${COLORS.desafio}44`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 14, color: COLORS.text, flex: 1 }}>{d.label}</span>
                      <span style={{ fontSize: 11, color: COLORS.desafio }}>{d.progress}/{d.total}</span>
                    </div>
                  ))}
                </Section>
              )}
            </>
          )}
        </>
      )}

    {subTab === "bitacora" && (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, margin: "0 -16px" }}>
    <BitacoraScreen googleToken={googleToken} onConectarGoogle={onConectarGoogle} />
  </div>
)}

    </div>
  );
}