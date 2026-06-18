import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { COLORS, typeColor } from "../constants/colors";
import { Loading } from "../components/Loading";

const typeLabel = {
  mision: "Misión", rutina: "Rutina", campana: "Campaña",
  encargo: "Encargo", desafio: "Desafío", jefe: "Jefe",
};

const TYPES = [
  { key: "mision", label: "Misión", icon: "⚡" },
  { key: "rutina", label: "Rutina", icon: "🔁" },
  { key: "campana", label: "Campaña", icon: "📌" },
  { key: "encargo", label: "Encargo", icon: "📋" },
  { key: "desafio", label: "Desafío", icon: "🎯" },
  { key: "jefe", label: "Jefe", icon: "💀" },
];

function fmtFecha(date) {
  return new Date(date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) + " · " +
    new Date(date).toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

function ModalClasificar({ item, terrenos, campanas, onClose, onClasificar, pasoDirecto }) {
  const [selected, setSelected] = useState(pasoDirecto ? item.type : null);
  const [paso, setPaso] = useState(pasoDirecto ? 2 : 1);
  const [contenedor, setContenedor] = useState(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [creandoNuevo, setCreandoNuevo] = useState(false);

  const necesitaContenedor = selected === "rutina" || selected === "campana";
  const lista = selected === "rutina" ? terrenos : campanas;
  const labelContenedor = selected === "rutina" ? "terreno" : "campaña";

  const handleTipoSeleccionado = (tipo) => {
    setSelected(tipo);
    if (tipo === "rutina" || tipo === "campana") setPaso(2);
  };

  const handleConfirmar = async () => {
    if (!selected) return;
    if (necesitaContenedor && !contenedor && !creandoNuevo) return;
    await onClasificar(item.id, selected, contenedor, nuevoNombre.trim());
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 32px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box", maxHeight: "80vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />

        {paso === 1 && (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>Clasificar</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 18, lineHeight: 1.4 }}>{item.text}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
              {TYPES.map(t => (
                <button key={t.key} onClick={() => handleTipoSeleccionado(t.key)} style={{ background: selected === t.key ? typeColor(t.key) + "22" : COLORS.surfaceLight, border: `1px solid ${selected === t.key ? typeColor(t.key) : COLORS.border}`, borderRadius: 10, padding: "10px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  <span style={{ fontSize: 11, color: selected === t.key ? typeColor(t.key) : COLORS.textMuted, fontWeight: 600 }}>{t.label}</span>
                </button>
              ))}
            </div>
            {selected && !necesitaContenedor && (
              <button onClick={handleConfirmar} style={{ width: "100%", background: typeColor(selected), border: "none", borderRadius: 12, padding: "13px 0", color: COLORS.bg, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Mover a {typeLabel[selected]}
              </button>
            )}
          </>
        )}

        {paso === 2 && (
          <>
            {!pasoDirecto && (
              <button onClick={() => { setPaso(1); setContenedor(null); setCreandoNuevo(false); }} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 13, marginBottom: 16, padding: 0 }}>← Volver</button>
            )}
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>¿A qué {labelContenedor} va?</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 18 }}>{item.text}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              {lista.length === 0 && !creandoNuevo && (
                <div style={{ color: COLORS.textMuted, fontSize: 13, textAlign: "center", marginBottom: 8 }}>No hay {labelContenedor}s creados aún</div>
              )}
              {lista.map(c => (
                <button key={c.id} onClick={() => { setContenedor(c.id); setCreandoNuevo(false); }} style={{ display: "flex", alignItems: "center", gap: 10, background: contenedor === c.id ? (selected === "rutina" ? COLORS.rutina : COLORS.campana) + "22" : COLORS.surfaceLight, border: `1px solid ${contenedor === c.id ? (selected === "rutina" ? COLORS.rutina : COLORS.campana) : COLORS.border}`, borderRadius: 10, padding: "11px 14px", cursor: "pointer", textAlign: "left" }}>
                  {selected === "rutina" && c.emoji && <span style={{ fontSize: 18 }}>{c.emoji}</span>}
                  <span style={{ fontSize: 14, color: COLORS.text }}>{c.name}</span>
                </button>
              ))}
            </div>
            {!creandoNuevo ? (
              <button onClick={() => { setCreandoNuevo(true); setContenedor(null); }} style={{ width: "100%", background: "transparent", border: `1px dashed ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", cursor: "pointer", color: COLORS.textMuted, fontSize: 13, marginBottom: 12 }}>
                + Crear {labelContenedor} nuevo
              </button>
            ) : (
              <input value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} placeholder={`Nombre del ${labelContenedor}`}
                style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
            )}
            {!pasoDirecto && (
              <button onClick={() => onClasificar(item.id, selected, null, null, true)} style={{ width: "100%", background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", color: COLORS.textMuted, fontSize: 13, marginBottom: 16 }}>
                Asignar después
              </button>
            )}
            <button onClick={handleConfirmar} disabled={!contenedor && (!creandoNuevo || !nuevoNombre.trim())} style={{ width: "100%", background: (contenedor || (creandoNuevo && nuevoNombre.trim())) ? (selected === "rutina" ? COLORS.rutina : COLORS.campana) : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: (contenedor || (creandoNuevo && nuevoNombre.trim())) ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              {creandoNuevo ? `Crear ${labelContenedor} y asignar` : "Asignar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ModalEditar({ item, onClose, onGuardar }) {
  const [text, setText] = useState(item.text);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.surface, borderRadius: "20px 20px 0 0", padding: "20px 16px 32px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box" }}>
        <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Editar</div>
        <textarea value={text} onChange={e => setText(e.target.value)}
          style={{ width: "100%", background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", color: COLORS.text, fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box", resize: "none", minHeight: 80, fontFamily: "inherit", lineHeight: 1.5 }} />
        <button onClick={() => text.trim() && onGuardar(item.id, text.trim())} style={{ width: "100%", background: text.trim() ? COLORS.accent : COLORS.border, border: "none", borderRadius: 12, padding: "13px 0", color: text.trim() ? COLORS.bg : COLORS.textMuted, fontSize: 14, fontWeight: 700, cursor: text.trim() ? "pointer" : "default" }}>
          Guardar
        </button>
      </div>
    </div>
  );
}

export function BandejaScreen() {
  const [items, setItems] = useState([]);
  const [terrenos, setTerrenos] = useState([]);
  const [campanas, setCampanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("sin_clasificar");
  const [clasificando, setClasificando] = useState(null);
  const [asignandoDirecto, setAsignandoDirecto] = useState(null);
  const [editando, setEditando] = useState(null);

  useEffect(() => { fetchItems(); fetchContenedores(); }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from("bandeja").select("*").order("created_at", { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  };

  const fetchContenedores = async () => {
    const [{ data: tData }, { data: cData }] = await Promise.all([
      supabase.from("terrenos").select("*"),
      supabase.from("campanas").select("*"),
    ]);
    if (tData) setTerrenos(tData);
    if (cData) setCampanas(cData);
  };

  const clasificar = async (id, type, contenedorId, nuevoNombre, asignarDespues = false) => {
    const item = items.find(x => x.id === id);
    if (!item) return;

    if (asignarDespues) {
      await supabase.from("bandeja").update({ type }).eq("id", id);
      setItems(prev => prev.map(x => x.id === id ? { ...x, type } : x));
      setClasificando(null);
      return;
    }

    if (type === "rutina") {
      let tid = contenedorId;
      if (!tid && nuevoNombre) {
        const { data } = await supabase.from("terrenos").insert([{ name: nuevoNombre, emoji: "🏠" }]).select();
        if (data) { tid = data[0].id; setTerrenos(prev => [...prev, data[0]]); }
      }
      await supabase.from("tasks").insert([{ type: "rutina", label: item.text, terrain_id: tid, done: false }]);
    } else if (type === "campana") {
      let cid = contenedorId;
      if (!cid && nuevoNombre) {
        const { data } = await supabase.from("campanas").insert([{ name: nuevoNombre }]).select();
        if (data) { cid = data[0].id; setCampanas(prev => [...prev, data[0]]); }
      }
      await supabase.from("tasks").insert([{ type: "campana", label: item.text, campana_id: cid, done: false }]);
    } else {
      await supabase.from("tasks").insert([{ type, label: item.text, done: false }]);
    }

    await supabase.from("bandeja").delete().eq("id", id);
    setItems(prev => prev.filter(x => x.id !== id));
    setClasificando(null);
    setAsignandoDirecto(null);
  };

  const editar = async (id, text) => {
    await supabase.from("bandeja").update({ text }).eq("id", id);
    setItems(prev => prev.map(x => x.id === id ? { ...x, text } : x));
    setEditando(null);
  };

  const eliminar = async (id) => {
    await supabase.from("bandeja").delete().eq("id", id);
    setItems(prev => prev.filter(x => x.id !== id));
  };

  const sinClasificar = items.filter(x => !x.type);
  const clasificadas = items.filter(x => x.type);
  const lista = tab === "sin_clasificar" ? sinClasificar : clasificadas;
  const necesitaAsignacion = (item) => item.type === "rutina" || item.type === "campana";

  return (
    <div style={{ position: "relative" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, fontFamily: "Georgia, serif" }}>Bandeja</div>
        <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>
          {sinClasificar.length} sin clasificar · {clasificadas.length} clasificadas
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {[["sin_clasificar","Sin clasificar", sinClasificar.length],["clasificadas","Clasificadas", clasificadas.length]].map(([k,l,count]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${tab === k ? COLORS.accent : COLORS.border}`, background: tab === k ? COLORS.accent + "22" : "transparent", color: tab === k ? COLORS.text : COLORS.textMuted }}>
            {l} {count > 0 && <span style={{ fontSize: 11 }}>({count})</span>}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {lista.length === 0 && (
            <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 40 }}>
              {tab === "sin_clasificar" ? "Todo clasificado 🎉" : "Sin ítems clasificados aún"}
            </div>
          )}
          {lista.map(item => (
            <div key={item.id} style={{ background: COLORS.surface, borderRadius: 12, padding: "14px 14px", border: `1px solid ${item.type ? typeColor(item.type) + "44" : COLORS.border}` }}>
              <div style={{ fontSize: 14, color: COLORS.text, marginBottom: 10, lineHeight: 1.4 }}>{item.text}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>{fmtFecha(item.created_at)}</span>
                  {item.type && (
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: typeColor(item.type), border: `1px solid ${typeColor(item.type)}44`, borderRadius: 4, padding: "1px 6px" }}>{typeLabel[item.type]}</span>
                  )}
                  {necesitaAsignacion(item) && (
                    <span style={{ fontSize: 10, color: COLORS.textMuted, fontStyle: "italic" }}>sin asignar</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {!item.type && (
                    <button onClick={() => setClasificando(item)} style={{ background: COLORS.accent + "22", border: `1px solid ${COLORS.accent}44`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: COLORS.accent, fontSize: 11, fontWeight: 600 }}>Clasificar</button>
                  )}
                  {necesitaAsignacion(item) && (
                    <button onClick={() => setAsignandoDirecto(item)} style={{ background: typeColor(item.type) + "22", border: `1px solid ${typeColor(item.type)}44`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: typeColor(item.type), fontSize: 11, fontWeight: 600 }}>
                      Asignar {item.type === "rutina" ? "terreno" : "campaña"}
                    </button>
                    {item.type && !necesitaAsignacion(item) && (
                      <button
                        onClick={() => clasificar(item.id, item.type, null, null, false)}
                        style={{ background: typeColor(item.type) + "22", border: `1px solid ${typeColor(item.type)}44`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: typeColor(item.type), fontSize: 11, fontWeight: 600 }}>
                        Mover a {typeLabel[item.type]}
                      </button>
                  )}
                  <button onClick={() => setEditando(item)} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: COLORS.textMuted, fontSize: 11 }}>✎</button>
                  <button onClick={() => eliminar(item.id)} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: COLORS.textMuted, fontSize: 11 }}>×</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {clasificando && <ModalClasificar item={clasificando} terrenos={terrenos} campanas={campanas} onClose={() => setClasificando(null)} onClasificar={clasificar} pasoDirecto={false} />}
      {asignandoDirecto && <ModalClasificar item={asignandoDirecto} terrenos={terrenos} campanas={campanas} onClose={() => setAsignandoDirecto(null)} onClasificar={clasificar} pasoDirecto={true} />}
      {editando && <ModalEditar item={editando} onClose={() => setEditando(null)} onGuardar={editar} />}
    </div>
  );
}