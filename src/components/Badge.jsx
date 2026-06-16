import { typeColor, typeLabel } from "../constants/colors";

export function Badge({ type, small }) {
  return (
    <span style={{ fontSize: small ? 9 : 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: typeColor(type), border: `1px solid ${typeColor(type)}44`, borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" }}>{typeLabel[type]}</span>
  );
}