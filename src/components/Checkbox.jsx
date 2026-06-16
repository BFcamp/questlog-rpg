import { COLORS } from "../constants/colors";

export function Checkbox({ done, onChange }) {
  return (
    <button onClick={onChange} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${done ? COLORS.accent : COLORS.border}`, background: done ? COLORS.accent : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {done && <span style={{ color: COLORS.bg, fontSize: 13, fontWeight: 900 }}>✓</span>}
    </button>
  );
}