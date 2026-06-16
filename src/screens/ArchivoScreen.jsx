import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { COLORS, typeColor } from "../constants/colors";
import { Badge } from "../components/Badge";
import { Loading } from "../components/Loading";

const TIPO_FILTERS = [
  { key: "all", label: "Todos" }, { key: "mision", label: "Misión" },
  { key: "jefe", label: "Jefe" }, { key: "encargo", label: "Encargo" },
  { key: "campana", label: "Campaña" }, { key: "desafio", label: "Desafío" },
  { key: "ruta", label: "Ruta" }, { key: "rutina", label: "Rutina" },
];

export function ArchivoScreen() {
  const [archivo, setArchivo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("all");
  const [orden, setOrden] = useState("reciente");

  useEffect(() => { fetchArchivo(); }, []);

  const fetchArchivo = async () => {
    const { data } = await supabase.from("archivo").select("*").order("completed_at", { ascending: false });
    if (data) setArchivo(data);
    setLoading(false);
  };

  const filtrados = archivo
    .filter(a => filtro === "all" || a.type === filtro)
    .sort((a, b) => orden === "reciente"
      ? new Date(b.completed_at) - new Date(a.completed_at)
      : new Date(a.completed_at) - new Date(b.completed_at));

  const fmt = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }) + " · " + d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, fontFamily: "Georgia, serif", marginBottom: 14 }}>Archivo</div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12, paddingBottom: 4, scrollbarWidth: "none" }}>
        {TIPO_FILTERS.map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)} style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", border: `1px solid ${filtro === f.key ? typeColor(f.key === "all" ? "mision" : f.key) : COLORS.border}`, background: filtro === f.key ? typeColor(f.key === "all" ? "mision" : f.key) + "22" : "transparent", color: filtro === f.key ? COLORS.text : COLORS.textMuted, whiteSpace: "nowrap" }}>{f.label}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {[["reciente","Más reciente"],["antiguo","Más antiguo"]].map(([k,l]) => (
          <button key={k} onClick={() => setOrden(k)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${orden === k ? COLORS.accent : COLORS.border}`, background: orden === k ? COLORS.accent + "22" : "transparent", color: orden === k ? COLORS.accent : COLORS.textMuted }}>{l}</button>
        ))}
      </div>
      {loading ? <Loading /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtrados.length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 40 }}>Sin tareas completadas aquí</div>}
          {filtrados.map((a, i) => (
            <div key={a.id ?? i} style={{ background: COLORS.surface, borderRadius: 10, padding: "12px 14px", border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14, color: COLORS.textMuted, textDecoration: "line-through", flex: 1 }}>{a.label}</span>
                <Badge type={a.type} small />
              </div>
              <div style={{ fontSize: 11, color: COLORS.textMuted + "99" }}>✓ {fmt(a.completed_at)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}