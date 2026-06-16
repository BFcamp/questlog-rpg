import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { COLORS } from "../constants/colors";
import { Loading } from "../components/Loading";

const PAPER = {
  bg: "#f2ead8",
  text: "#2c2010",
  textMuted: "#8a7a60",
  border: "#d4c4a0",
  accent: "#8b5e2a",
};

function fmtFecha(date) {
  return date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

function fmtFechaCorta(date) {
  const t = new Date();
  if (date.toDateString() === t.toDateString()) return "Hoy";
  const y = new Date(t); y.setDate(t.getDate() - 1);
  if (date.toDateString() === y.toDateString()) return "Ayer";
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function isToday(date) {
  return date.toDateString() === new Date().toDateString();
}

function EditorEntrada({ entrada, onBack, onSave }) {
  const [titulo, setTitulo] = useState(entrada.titulo || "");
  const [contenido, setContenido] = useState(entrada.contenido || "");
  const hasChanges = titulo !== (entrada.titulo || "") || contenido !== (entrada.contenido || "");

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%", position: "relative",
      background: "linear-gradient(160deg, #f5edd8 0%, #ede3c4 40%, #e8dab8 100%)",
      margin: "-20px -16px 0", padding: "20px 20px 0", boxSizing: "border-box",
    }}>
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexShrink: 0 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: PAPER.textMuted, cursor: "pointer", fontSize: 13, padding: 0, fontFamily: "Georgia, serif" }}>← Crónicas</button>
          <button onClick={() => hasChanges && onSave(entrada.id, titulo, contenido)} style={{
            background: hasChanges ? PAPER.accent + "22" : "transparent",
            border: `1px solid ${hasChanges ? PAPER.accent + "88" : PAPER.border}`,
            borderRadius: 8, padding: "6px 14px", cursor: hasChanges ? "pointer" : "default",
            color: hasChanges ? PAPER.accent : PAPER.textMuted, fontSize: 12, fontWeight: 600,
            fontFamily: "Georgia, serif",
          }}>Guardar</button>
        </div>
        <div style={{ fontSize: 11, color: PAPER.textMuted, marginBottom: 14, textTransform: "capitalize", flexShrink: 0, fontStyle: "italic", letterSpacing: "0.04em" }}>
          {fmtFecha(new Date(entrada.fecha))}
        </div>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título (opcional)"
          style={{ background: "none", border: "none", outline: "none", fontSize: 22, fontWeight: 700, color: PAPER.text, fontFamily: "Georgia, serif", marginBottom: 14, width: "100%", boxSizing: "border-box", flexShrink: 0 }} />
        <div style={{ height: 1, background: PAPER.border, marginBottom: 14, flexShrink: 0 }} />
        <textarea value={contenido} onChange={e => setContenido(e.target.value)} placeholder="Escribí lo que quieras..."
          style={{ background: "none", border: "none", outline: "none", fontSize: 15, color: PAPER.text, lineHeight: 2, width: "100%", flex: 1, resize: "none", fontFamily: "Georgia, serif", boxSizing: "border-box" }} />
        {contenido && (
          <div style={{ fontSize: 11, color: PAPER.textMuted, textAlign: "right", marginTop: 8, flexShrink: 0, fontStyle: "italic" }}>
            {contenido.trim().split(/\s+/).filter(Boolean).length} palabras
          </div>
        )}
      </div>
    </div>
  );
}

export function CronicasScreen() {
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchEntradas(); }, []);

  const fetchEntradas = async () => {
    const { data } = await supabase.from("cronicas").select("*").order("fecha", { ascending: false });
    if (data) {
      // Asegurar que hoy siempre esté
      const hoy = new Date().toISOString().slice(0, 10);
      const tieneHoy = data.some(e => e.fecha === hoy);
      if (!tieneHoy) {
        const { data: nueva } = await supabase.from("cronicas").insert([{ fecha: hoy, titulo: "", contenido: "" }]).select();
        if (nueva) setEntradas([...nueva, ...data]);
        else setEntradas(data);
      } else {
        setEntradas(data);
      }
    }
    setLoading(false);
  };

  const handleSave = async (id, titulo, contenido) => {
    await supabase.from("cronicas").update({ titulo, contenido }).eq("id", id);
    setEntradas(prev => prev.map(e => e.id === id ? { ...e, titulo, contenido } : e));
    setSelected(prev => ({ ...prev, titulo, contenido }));
  };

  if (loading) return <Loading />;

  if (selected) {
    return (
      <EditorEntrada
        entrada={selected}
        onBack={() => setSelected(null)}
        onSave={handleSave}
      />
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, fontFamily: "Georgia, serif" }}>Crónicas</div>
        <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>
          {entradas.filter(e => e.contenido).length} entradas escritas
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entradas.map(e => {
          const vacia = !e.contenido && !e.titulo;
          const esHoy = isToday(new Date(e.fecha));
          return (
            <button key={e.id} onClick={() => setSelected(e)} style={{
              background: esHoy ? COLORS.accent + "11" : COLORS.surface,
              border: `1px solid ${esHoy ? COLORS.accent + "44" : vacia ? COLORS.border + "66" : COLORS.border}`,
              borderRadius: 12, padding: "14px 16px", cursor: "pointer",
              textAlign: "left", opacity: vacia && !esHoy ? 0.5 : 1,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: vacia ? 0 : 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: esHoy ? COLORS.accent : COLORS.text, textTransform: "capitalize" }}>
                    {fmtFechaCorta(new Date(e.fecha))}
                  </span>
                  {esHoy && <span style={{ fontSize: 10, color: COLORS.accent, fontWeight: 700, letterSpacing: "0.06em" }}>HOY</span>}
                </div>
                {!vacia && (
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                    {e.contenido.trim().split(/\s+/).filter(Boolean).length} palabras
                  </span>
                )}
              </div>
              {!vacia && (
                <>
                  {e.titulo && <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 4, fontFamily: "Georgia, serif" }}>{e.titulo}</div>}
                  <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{e.contenido}</div>
                </>
              )}
              {vacia && esHoy && <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>Tocá para escribir tu entrada de hoy...</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}