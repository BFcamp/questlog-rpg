import { COLORS } from "../constants/colors";

export function ScreenHeader({ title, sub, btnLabel, btnColor, onBtn, onBack }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {onBack && <button onClick={onBack} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 13, marginBottom: 10, padding: 0 }}>← Volver</button>}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, fontFamily: "Georgia, serif" }}>{title}</div>
          {sub && <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{sub}</div>}
        </div>
        {btnLabel && <button onClick={onBtn} style={{ background: (btnColor || COLORS.accent) + "22", border: `1px solid ${(btnColor || COLORS.accent)}44`, borderRadius: 10, padding: "8px 14px", cursor: "pointer", color: btnColor || COLORS.accent, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{btnLabel}</button>}
      </div>
    </div>
  );
}