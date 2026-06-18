import { COLORS } from "../constants/colors";

const NIVELES = [
  { nivel: 1, nombre: "Aldeano", minPC: 0, objeto: null, objetoDesc: null },
  { nivel: 2, nombre: "Aprendiz", minPC: 1000, objeto: "📖 Pluma de Aethon", objetoDesc: "Cambiá el color del texto en Crónicas" },
  { nivel: 3, nombre: "Escudero", minPC: 2000, objeto: "🛡 Escudo de Miren", objetoDesc: "Protege tu racha 1 día por semana" },
  { nivel: 4, nombre: "Guerrero", minPC: 3000, objeto: "⚔️ Espada del Guerrero", objetoDesc: "Declarás una Misión Épica por semana (doble PC)" },
  { nivel: 5, nombre: "Cazador", minPC: 4500, objeto: "🏹 Arco del Cazador", objetoDesc: "Radar de encargos olvidados" },
  { nivel: 6, nombre: "Caballero", minPC: 7500, objeto: null, objetoDesc: null },
  { nivel: 7, nombre: "Paladín", minPC: 12000, objeto: null, objetoDesc: null },
  { nivel: 8, nombre: "Sabio", minPC: 18000, objeto: null, objetoDesc: null },
  { nivel: 9, nombre: "Mago Blanco", minPC: 26000, objeto: null, objetoDesc: null },
  { nivel: 10, nombre: "Mago Supremo", minPC: 36000, objeto: null, objetoDesc: null },
];

function calcularNivel(xp) {
  const nivel = [...NIVELES].reverse().find(n => xp >= n.minPC);
  return nivel || NIVELES[0];
}

function PersonajeContent({ character }) {
  if (!character) return null;

  const nivelInfo = calcularNivel(character.xp);
  const nivelSiguiente = NIVELES.find(n => n.nivel === nivelInfo.nivel + 1);
  const pcEnNivel = character.xp - nivelInfo.minPC;
  const pcParaSiguiente = nivelSiguiente ? nivelSiguiente.minPC - nivelInfo.minPC : 1;
  const pct = Math.min(100, Math.round((pcEnNivel / pcParaSiguiente) * 100));

  return (
    <div>
      {/* Header personaje */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🧙</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.text, fontFamily: "Georgia, serif" }}>Bruno</div>
        <div style={{ fontSize: 14, color: COLORS.accent, fontWeight: 600, marginTop: 4 }}>
          {nivelInfo.nombre} — Nivel {nivelInfo.nivel}
        </div>
      </div>

      {/* Barra de progreso */}
      <div style={{ background: COLORS.surface, borderRadius: 12, padding: "14px 16px", marginBottom: 14, border: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>Progreso al siguiente nivel</span>
          <span style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: 8, background: COLORS.border, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
          <div style={{ width: `${pct}%`, height: "100%", background: COLORS.accent, borderRadius: 4, transition: "width 0.3s ease" }} />
        </div>
        {nivelSiguiente && (
          <div style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "center" }}>
            {pcEnNivel.toLocaleString()} / {pcParaSiguiente.toLocaleString()} PC para {nivelSiguiente.nombre}
          </div>
        )}
        {!nivelSiguiente && (
          <div style={{ fontSize: 12, color: COLORS.accent, textAlign: "center", fontWeight: 700 }}>
            ¡Nivel máximo alcanzado!
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { icon: "⚡", label: "PC Totales", value: character.xp.toLocaleString(), color: COLORS.accent },
          { icon: "👑", label: "Coronas", value: (character.coronas || 0).toLocaleString(), color: "#e8c547" },
          { icon: "🔥", label: "Racha", value: `${character.racha || 0} días`, color: COLORS.mision },
        ].map(s => (
          <div key={s.label} style={{ background: COLORS.surface, borderRadius: 12, padding: "12px 10px", border: `1px solid ${COLORS.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Próximo objeto */}
      {nivelSiguiente && nivelSiguiente.objeto && (
        <div style={{ background: COLORS.accent + "11", border: `1px solid ${COLORS.accent}33`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            Próximo objeto
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{nivelSiguiente.objeto}</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted }}>{nivelSiguiente.objetoDesc}</div>
          <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 8 }}>
            Al llegar a {nivelSiguiente.nombre} (nivel {nivelSiguiente.nivel})
          </div>
        </div>
      )}

      {/* Objeto actual desbloqueado */}
      {nivelInfo.objeto && (
        <div style={{ background: COLORS.surfaceLight, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            Objeto desbloqueado
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{nivelInfo.objeto}</div>
          <div style={{ fontSize: 13, color: COLORS.textMuted }}>{nivelInfo.objetoDesc}</div>
        </div>
      )}
    </div>
  );
}

// ── PANTALLA COMPLETA ─────────────────────────────────────────────────────────

export function PersonajeScreen({ character }) {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, fontFamily: "Georgia, serif", marginBottom: 20 }}>Personaje</div>
      <PersonajeContent character={character} />
    </div>
  );
}

// ── MODAL RÁPIDO (para tocar la barra de XP en Hoy) ──────────────────────────

export function PersonajeModal({ character, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000000bb", zIndex: 100, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: COLORS.bg, borderRadius: "20px 20px 0 0", padding: "20px 16px 32px", border: `1px solid ${COLORS.border}`, boxSizing: "border-box", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: "0 auto 20px" }} />
        <PersonajeContent character={character} />
      </div>
    </div>
  );
}