import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { COLORS } from "../constants/colors";
import { Loading } from "../components/Loading";

const EXP_COLOR = "#7ecfb3";

const FRASES = [
  "La información está del otro lado.",
  "Moverse siempre enseña algo.",
  "Hoy es un buen día para probar algo.",
  "¿Qué podés lanzar hoy?",
  "¿Qué querés probar?",
  "¿Qué te da curiosidad?",
  "Elegí una cosa. Hacela. Fijate qué pasa.",
  "Una acción pequeña hoy.",
  "Cada acción es información. No hay movimiento en vano.",
  "Actuar siempre enseña algo. No actuar, nunca.",
  "No sabés lo que no probás.",
  "La duda se resuelve moviéndose, no pensando más.",
  "Probar no es comprometerse. Es aprender.",
  "La realidad siempre tiene más imaginación que nosotros.",
  "Tener tiempo para practicar quien querés ser.",
];

function tiempoDesde(fecha) {
  const diff = Date.now() - new Date(fecha).getTime();
  const dias = Math.floor(diff / 86400000);
  const horas = Math.floor(diff / 3600000);
  const minutos = Math.floor(diff / 60000);
  if (dias > 0) return `hace ${dias} día${dias > 1 ? "s" : ""}`;
  if (horas > 0) return `hace ${horas} hora${horas > 1 ? "s" : ""}`;
  return `hace ${minutos} minuto${minutos > 1 ? "s" : ""}`;
}

function fmtFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
}

// ── MODAL NUEVO ───────────────────────────────────────────────────────────────

function ModalNuevo({ onClose, onAgregar }) {
  const [probar, setProbar] = useState("");
  const [aprender, setAprender] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const handleAgregar = async () => {
    if (!probar.trim() || loading) return;
    setLoading(true);
    await onAgregar({ probar: probar.trim(), aprender: aprender.trim(), fecha });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 32px", border: `1px solid ${EXP_COLOR}44`, boxSizing: "border-box", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: EXP_COLOR + "44", borderRadius: 2, margin: "0 auto 24px" }} />
        <div style={{ fontSize: 18, fontWeight: 700, color: EXP_COLOR, fontFamily: "Georgia, serif", marginBottom: 6 }}>Nuevo experimento</div>
        <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 24, lineHeight: 1.5 }}>No necesitás saber cómo va a terminar. Solo lanzarlo.</div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: EXP_COLOR, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>¿Qué querés probar?</div>
          <textarea value={probar} onChange={e => setProbar(e.target.value)} placeholder="Describilo como querás. No hay formato correcto." autoFocus
            style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${probar ? EXP_COLOR + "66" : COLORS.border}`, borderRadius: 12, padding: "12px 14px", color: COLORS.text, fontSize: 14, outline: "none", resize: "none", minHeight: 90, fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: EXP_COLOR, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>¿Qué querés aprender?</div>
            <span style={{ fontSize: 11, color: COLORS.textMuted, fontStyle: "italic" }}>opcional</span>
          </div>
          <textarea value={aprender} onChange={e => setAprender(e.target.value)} placeholder="A veces no se sabe hasta que se hace."
            style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${aprender ? EXP_COLOR + "44" : COLORS.border}`, borderRadius: 12, padding: "12px 14px", color: COLORS.text, fontSize: 14, outline: "none", resize: "none", minHeight: 70, fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Fecha de inicio</div>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
            style={{ background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 14px", color: COLORS.text, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }} />
        </div>

        <button onClick={handleAgregar} style={{ width: "100%", background: probar.trim() ? EXP_COLOR : COLORS.border, border: "none", borderRadius: 12, padding: "14px 0", color: probar.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: probar.trim() ? "pointer" : "default" }}>
          Crear experimento
        </button>
      </div>
    </div>
  );
}

// ── MODAL RESULTADO ───────────────────────────────────────────────────────────

function ModalResultado({ exp, onClose, onCerrar }) {
  const [resultado, setResultado] = useState(exp.resultado || "");
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 32px", border: `1px solid ${EXP_COLOR}44`, boxSizing: "border-box", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: EXP_COLOR + "44", borderRadius: 2, margin: "0 auto 24px" }} />
        <div style={{ fontSize: 18, fontWeight: 700, color: EXP_COLOR, fontFamily: "Georgia, serif", marginBottom: 6 }}>¿Qué pasó?</div>
        <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16, lineHeight: 1.5 }}>No hay resultado correcto. Solo el tuyo.</div>

        <div style={{ background: COLORS.surfaceLight, borderRadius: 10, padding: "12px 14px", marginBottom: 20, border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 11, color: EXP_COLOR, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>El experimento</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5 }}>{exp.probar}</div>
          {exp.aprender && (
            <>
              <div style={{ fontSize: 11, color: EXP_COLOR, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 10, marginBottom: 6 }}>Querías aprender</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5 }}>{exp.aprender}</div>
            </>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: EXP_COLOR, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Lo que pasó / lo que aprendiste</div>
          <textarea value={resultado} onChange={e => setResultado(e.target.value)} placeholder="Escribí libremente. Puede ser una sola línea." autoFocus
            style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${resultado ? EXP_COLOR + "66" : COLORS.border}`, borderRadius: 12, padding: "12px 14px", color: COLORS.text, fontSize: 14, outline: "none", resize: "none", minHeight: 120, fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box" }} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={async () => { setLoading(true); await onCerrar(exp.id, resultado); }} style={{ flex: 1, background: resultado.trim() ? EXP_COLOR : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: resultado.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: resultado.trim() ? "pointer" : "default" }}>
            Cerrar experimento
          </button>
          <button onClick={async () => { setLoading(true); await onCerrar(exp.id, ""); }} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "13px 16px", color: COLORS.textMuted, fontSize: 13, cursor: "pointer" }}>
            Sin anotar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DETALLE ───────────────────────────────────────────────────────────────────

function DetalleExperimento({ exp, onBack, onAbrirResultado }) {
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 13, marginBottom: 20, padding: 0 }}>← Experimentos</button>

      <div style={{ fontSize: 11, color: EXP_COLOR, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
        {exp.cerrado ? "Experimento cerrado" : "En curso"} · {fmtFecha(exp.fecha)}
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>¿Qué querías probar?</div>
        <div style={{ fontSize: 16, color: COLORS.text, lineHeight: 1.7, fontFamily: "Georgia, serif" }}>{exp.probar}</div>
      </div>

      {exp.aprender && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>¿Qué querías aprender?</div>
          <div style={{ fontSize: 15, color: COLORS.textMuted, lineHeight: 1.7 }}>{exp.aprender}</div>
        </div>
      )}

      <div style={{ height: 1, background: COLORS.border, marginBottom: 24 }} />

      {exp.cerrado && exp.resultado && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: EXP_COLOR, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Lo que pasó</div>
          <div style={{ fontSize: 15, color: COLORS.text, lineHeight: 1.7, background: EXP_COLOR + "11", borderRadius: 12, padding: "14px 16px", border: `1px solid ${EXP_COLOR}33` }}>{exp.resultado}</div>
        </div>
      )}

      {exp.cerrado && !exp.resultado && (
        <div style={{ fontSize: 14, color: COLORS.textMuted, fontStyle: "italic", marginBottom: 24 }}>Sin resultado anotado.</div>
      )}

      {!exp.cerrado && (
        <button onClick={() => onAbrirResultado(exp)} style={{ width: "100%", background: EXP_COLOR + "22", border: `1px solid ${EXP_COLOR}66`, borderRadius: 12, padding: "13px 0", color: EXP_COLOR, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Anotar resultado y cerrar
        </button>
      )}
    </div>
  );
}

// ── MAIN SCREEN ───────────────────────────────────────────────────────────────

export function ExperimentosScreen() {
  const [experimentos, setExperimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("activos");
  const [showNuevo, setShowNuevo] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [anotando, setAnotando] = useState(null);
  const [frase] = useState(() => FRASES[Math.floor(Math.random() * FRASES.length)]);

  useEffect(() => { fetchExperimentos(); }, []);

  const fetchExperimentos = async () => {
    const { data } = await supabase.from("experimentos").select("*").order("created_at", { ascending: false });
    if (data) setExperimentos(data);
    setLoading(false);
  };

  const agregar = async (data) => {
    const { data: nuevo } = await supabase.from("experimentos").insert([{
      probar: data.probar,
      aprender: data.aprender || null,
      fecha: data.fecha,
      cerrado: false,
      resultado: null,
    }]).select();
    if (nuevo) setExperimentos(prev => [nuevo[0], ...prev]);
  };

  const cerrar = async (id, resultado) => {
    await supabase.from("experimentos").update({ cerrado: true, resultado: resultado || null }).eq("id", id);
    setExperimentos(prev => prev.map(e => e.id === id ? { ...e, cerrado: true, resultado } : e));
    setAnotando(null);
    setDetalle(null);
  };

  const activos = experimentos.filter(e => !e.cerrado);
  const cerrados = experimentos.filter(e => e.cerrado);
  const lista = tab === "activos" ? activos : cerrados;

  if (detalle) {
    return (
      <div style={{ position: "relative" }}>
        <DetalleExperimento
          exp={detalle}
          onBack={() => setDetalle(null)}
          onAbrirResultado={(exp) => { setDetalle(null); setAnotando(exp); }}
        />
        {anotando && <ModalResultado exp={anotando} onClose={() => setAnotando(null)} onCerrar={cerrar} />}
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, fontFamily: "Georgia, serif" }}>Experimentos</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>
            🌱 {cerrados.length} {cerrados.length === 1 ? "camino recorrido" : cerrados.length === 0 ? "El primer camino está por empezar" : "caminos recorridos"}
          </div>
        </div>
        <button onClick={() => setShowNuevo(true)} style={{ background: EXP_COLOR + "22", border: `1px solid ${EXP_COLOR}66`, borderRadius: 10, padding: "8px 14px", cursor: "pointer", color: EXP_COLOR, fontSize: 13, fontWeight: 600 }}>+ Crear</button>
      </div>

      {/* Frase al azar */}
      <div style={{ background: EXP_COLOR + "11", border: `1px solid ${EXP_COLOR}22`, borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: EXP_COLOR, fontStyle: "italic", lineHeight: 1.6 }}>"{frase}"</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {[["activos","En curso",activos.length],["cerrados","Cerrados",cerrados.length]].map(([k,l,count]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${tab === k ? EXP_COLOR : COLORS.border}`, background: tab === k ? EXP_COLOR + "22" : "transparent", color: tab === k ? EXP_COLOR : COLORS.textMuted }}>
            {l} {count > 0 && <span style={{ fontSize: 11 }}>({count})</span>}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 40 }}>Cargando...</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lista.length === 0 && (
            <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 40 }}>
              {tab === "activos" ? "Sin experimentos en curso. ¿Qué querés probar?" : "Sin experimentos cerrados aún"}
            </div>
          )}
          {lista.map(exp => (
            <button key={exp.id} onClick={() => setDetalle(exp)} style={{ background: COLORS.surface, border: `1px solid ${exp.cerrado ? COLORS.border : EXP_COLOR + "44"}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.5, marginBottom: 10 }}>{exp.probar}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {exp.aprender
                  ? <span style={{ fontSize: 11, color: COLORS.textMuted, fontStyle: "italic", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 8 }}>"{exp.aprender.slice(0, 40)}{exp.aprender.length > 40 ? "..." : ""}"</span>
                  : <span />
                }
                <span style={{ fontSize: 11, color: exp.cerrado ? COLORS.textMuted : EXP_COLOR, flexShrink: 0 }}>
                  {exp.cerrado ? `✓ ${fmtFecha(exp.fecha)}` : tiempoDesde(exp.created_at)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {showNuevo && <ModalNuevo onClose={() => setShowNuevo(false)} onAgregar={agregar} />}
      {anotando && <ModalResultado exp={anotando} onClose={() => setAnotando(null)} onCerrar={cerrar} />}
    </div>
  );
}
