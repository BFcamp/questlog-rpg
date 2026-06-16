import { COLORS } from "../constants/colors";

export function Loading() {
  return <div style={{ color: COLORS.textMuted, fontSize: 14, textAlign: "center", marginTop: 40 }}>Cargando...</div>;
}