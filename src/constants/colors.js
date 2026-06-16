export const COLORS = {
    bg: "#0f0e17", surface: "#1a1828", surfaceLight: "#242235",
    border: "#2e2b45", accent: "#e8c547",
    text: "#e8e6f0", textMuted: "#7b7899",
    mision: "#e05c5c", rutina: "#5ca8e0", campana: "#7e5ce0",
    encargo: "#a0a0a0", desafio: "#5ce0a8", jefe: "#e05ca8", ruta: "#e0895c",
  };
  
  export const typeLabel = {
    mision: "Misión", rutina: "Rutina", campana: "Campaña",
    encargo: "Encargo", desafio: "Desafío", jefe: "Jefe", ruta: "Ruta",
  };
  
  export const typeColor = (t) => COLORS[t] || COLORS.text;