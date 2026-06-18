import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { COLORS } from "./constants/colors";
import { useGoogleAuth } from './services/useGoogleAuth';
import { useCharacter } from './services/useCharacter';

// Screens
import { TodayScreen } from "./screens/TodayScreen";
import { MisionesScreen } from "./screens/MisionesScreen";
import { TerrenosScreen } from "./screens/TerrenosScreen";
import { CampanasScreen } from "./screens/CampanasScreen";
import { EncargosScreen } from "./screens/EncargosScreen";
import { DesafiosScreen } from "./screens/DesafiosScreen";
import { RutaScreen } from "./screens/RutaScreen";
import { InventarioScreen } from "./screens/InventarioScreen";
import { ArchivoScreen } from "./screens/ArchivoScreen";
import { BitacoraScreen } from "./screens/BitacoraScreen";
import { JefesScreen } from "./screens/JefesScreen";
import { CronicasScreen } from "./screens/CronicasScreen";
import { BandejaScreen } from "./screens/BandejaScreen";
import { ModalCapturar } from "./components/ModalCapturar";
import { PersonajeScreen } from './screens/PersonajeScreen';

const topTabs = [
  { key: "today", label: "Hoy" },
  { key: "bandeja", label: "Bandeja" },
  { key: "misiones", label: "Misiones" },
  { key: "terrenos", label: "Terrenos" },
  { key: "campanas", label: "Campañas" },
  { key: "encargos", label: "Encargos" },
  { key: "jefes", label: "Jefes" },
  { key: "cronicas", label: "Crónicas" },
  { key: "archivo", label: "Archivo" },
  { key: "personaje", label: "🧙" },
];

const bottomTabs = [
  { key: "capturar", label: "Capturar", icon: "＋" },
  { key: "trampas", label: "Trampas", icon: "⚠" },
  { key: "desafios", label: "Desafíos", icon: "🎯" },
  { key: "ruta", label: "Ruta", icon: "🗺" },
];

export default function App() {
  const [topTab, setTopTab] = useState("today");
  const [bottomActive, setBottomActive] = useState(null);
  const [showCapturar, setShowCapturar] = useState(false);
  const [desafios, setDesafios] = useState([]);
  const [archivo, setArchivo] = useState([]);
  const { character, nivelInfo, pct, levelUp, setLevelUp, sumarPC } = useCharacter();
  const { token: googleToken, ready: googleReady, conectar: conectarGoogle } = useGoogleAuth();

  useEffect(() => {
    fetchDesafios();
  }, []);

  const fetchDesafios = async () => {
    const { data } = await supabase.from("desafios").select("*");
    if (data) setDesafios(data);
  };

  const fetchCharacter = async () => {
    const { data } = await supabase.from("character").select("*").limit(1);
    if (data && data.length > 0) setCharacter(data[0]);
    else {
      const { data: newChar } = await supabase.from("character").insert([{ level: 1, xp: 0 }]).select();
      if (newChar) setCharacter(newChar[0]);
    }
  };

  const archivar = async (item) => {
    await supabase.from("archivo").insert([{ label: item.label, type: item.type }]);
  };

  const togglePin = async (id) => {
    const d = desafios.find(x => x.id === id);
    await supabase.from("desafios").update({ pinned: !d.pinned }).eq("id", id);
    setDesafios(prev => prev.map(x => x.id === id ? { ...x, pinned: !x.pinned } : x));
  };

  const addDesafio = async (item) => {
    const { data } = await supabase.from("desafios").insert([item]).select();
    if (data) setDesafios(prev => [...prev, data[0]]);
  };

  const pinnedDesafios = desafios.filter(d => d.pinned);

  const handleBottom = (key) => {
    if (key === "capturar") { setShowCapturar(true); return; }
    setBottomActive(key === bottomActive ? null : key);
  };

  const screen = bottomActive === "desafios" ? "desafios"
    : bottomActive === "ruta" ? "ruta"
    : topTab;

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", background: COLORS.bg, fontFamily: "'Helvetica Neue', sans-serif", position: "relative", overflow: "hidden" }}>

      {/* Barra superior */}
      <div style={{ display: "flex", overflowX: "auto", gap: 4, padding: "12px 12px 0", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0, scrollbarWidth: "none" }}>
        {topTabs.map(t => (
          <button key={t.key} onClick={() => { setTopTab(t.key); setBottomActive(null); }} style={{ background: "none", border: "none", padding: "8px 14px 10px", fontSize: 13, fontWeight: topTab === t.key && !bottomActive ? 700 : 400, color: topTab === t.key && !bottomActive ? COLORS.text : COLORS.textMuted, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, borderBottom: topTab === t.key && !bottomActive ? `2px solid ${COLORS.accent}` : "2px solid transparent" }}>{t.label}</button>
        ))}
      </div>

      {/* Contenido */}
      {screen === "today" ? (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "20px 16px 0" }}>
    <TodayScreen pinnedDesafios={pinnedDesafios} character={character} googleToken={googleToken} onConectarGoogle={conectarGoogle} />
  </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 0", scrollbarWidth: "none" }}>
          {screen === "bandeja" && <BandejaScreen />}
          {screen === "misiones" && <MisionesScreen onBack={() => setTopTab("today")} onArchivar={archivar} onSumarPC={sumarPC} />}          
          {screen === "terrenos" && <TerrenosScreen onSumarPC={sumarPC} />}
          {screen === "campanas" && <CampanasScreen onBack={() => setTopTab("today")} onSumarPC={sumarPC} />}
          {screen === "encargos" && <EncargosScreen onBack={() => setTopTab("today")} onArchivar={archivar} onSumarPC={sumarPC} />}
          {screen === "jefes" && <JefesScreen onBack={() => setTopTab("today")} onArchivar={archivar} onSumarPC={sumarPC}/>}
          {screen === "cronicas" && <CronicasScreen />}
          {screen === "archivo" && <ArchivoScreen />}
          {screen === "desafios" && <DesafiosScreen desafios={desafios} onTogglePin={togglePin} onAddDesafio={addDesafio} onBack={() => setBottomActive(null)} onSumarPC={sumarPC} />}
          {screen === "ruta" && <RutaScreen onSumarPC={sumarPC} />}
          {screen === "personaje" && <PersonajeScreen character={character} />}
          <div style={{ height: 80 }} />
        </div>
      )}

      {/* Barra inferior */}
      <div style={{ display: "flex", borderTop: `1px solid ${COLORS.border}`, background: COLORS.bg, flexShrink: 0, padding: "8px 0 12px" }}>
        {bottomTabs.map(t => {
          const active = t.key !== "capturar" && bottomActive === t.key;
          const isCapturar = t.key === "capturar";
          const isTrampa = t.key === "trampas";
          return (
            <button key={t.key} onClick={() => handleBottom(t.key)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 0" }}>
              <span style={{ fontSize: isCapturar ? 22 : 18, color: active ? COLORS.accent : isCapturar ? COLORS.accent : isTrampa ? "#c0392b" : COLORS.textMuted }}>{t.icon}</span>
              <span style={{ fontSize: 10, color: active ? COLORS.accent : isTrampa ? "#c0392b" : COLORS.textMuted, fontWeight: active ? 700 : 400 }}>{t.label}</span>
            </button>
          );
        })}
      </div>
      {showCapturar && <ModalCapturar onClose={() => setShowCapturar(false)} />}
    </div>
  );
}