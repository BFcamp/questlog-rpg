import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const NIVELES = [
  { nivel: 1, nombre: "Aldeano", minPC: 0 },
  { nivel: 2, nombre: "Aprendiz", minPC: 1000 },
  { nivel: 3, nombre: "Escudero", minPC: 2000 },
  { nivel: 4, nombre: "Guerrero", minPC: 3000 },
  { nivel: 5, nombre: "Cazador", minPC: 4500 },
  { nivel: 6, nombre: "Caballero", minPC: 7500 },
  { nivel: 7, nombre: "Paladín", minPC: 12000 },
  { nivel: 8, nombre: "Sabio", minPC: 18000 },
  { nivel: 9, nombre: "Mago Blanco", minPC: 26000 },
  { nivel: 10, nombre: "Mago Supremo", minPC: 36000 },
];

const PC_POR_TIPO = {
  rutina: 50,
  encargo: 100,
  mision: 200,
  jefe: 500,
  campana: 400,
  desafio: 150,
  ruta: 500,
};

const CORONAS_POR_TIPO = {
  rutina: 5,
  encargo: 10,
  mision: 20,
  jefe: 50,
  campana: 40,
  desafio: 15,
  ruta: 50,
};

const RACHA_MINIMA = (nivel) => {
  if (nivel <= 3) return 3;
  if (nivel <= 6) return 5;
  return 10;
};

function calcularNivel(xp) {
  const nivel = [...NIVELES].reverse().find(n => xp >= n.minPC);
  return nivel || NIVELES[0];
}

export function useCharacter() {
  const [character, setCharacter] = useState(null);
  const [levelUp, setLevelUp] = useState(null);

  useEffect(() => { fetchCharacter(); }, []);

  const fetchCharacter = async () => {
    const { data } = await supabase.from('character').select('*').limit(1);
    if (data && data.length > 0) setCharacter(data[0]);
    else {
      const { data: newChar } = await supabase
        .from('character')
        .insert([{ level: 1, xp: 0, coronas: 0, racha: 0 }])
        .select();
      if (newChar) setCharacter(newChar[0]);
    }
  };

  const sumarPC = async (tipo, pcCustom = null, coronasCustom = null) => {
    if (!character) return;

    const pc = pcCustom !== null ? pcCustom : (PC_POR_TIPO[tipo] || 0);
    const coronas = coronasCustom !== null ? coronasCustom : (CORONAS_POR_TIPO[tipo] || 0);
    if (!pc && !coronas) return;

    // Calcular racha
    const hoy = new Date().toISOString().slice(0, 10);
    const ultimaRacha = character.ultima_racha;
    const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    let nuevaRacha = character.racha;
    let pcRacha = 0;
    let coronasRacha = 0;
    let actualizarRacha = false;

    if (ultimaRacha !== hoy) {
      actualizarRacha = true;
      if (ultimaRacha === ayer) {
        nuevaRacha = character.racha + 1;
      } else {
        nuevaRacha = 1;
      }

      // Bonus racha diaria
      pcRacha = 50;
      coronasRacha = 5;

      // Bonus racha 7 días
      if (nuevaRacha % 7 === 0) {
        pcRacha += 200;
        coronasRacha += 20;
      }
    }

    const xpFinal = character.xp + pc + pcRacha;
    const coronasFinal = character.coronas + coronas + coronasRacha;

    // Verificar subida de nivel
    const nivelActual = calcularNivel(character.xp);
    const nivelNuevo = calcularNivel(xpFinal);
    if (nivelNuevo.nivel > nivelActual.nivel) {
      setLevelUp(nivelNuevo);
    }

    const updates = {
      xp: xpFinal,
      coronas: coronasFinal,
      level: nivelNuevo.nivel,
      racha: nuevaRacha,
      ...(actualizarRacha ? { ultima_racha: hoy } : {}),
    };

    await supabase.from('character').update(updates).eq('id', character.id);
    setCharacter(prev => ({ ...prev, ...updates }));

    return { pc, coronas, pcRacha, coronasRacha, total_pc: pc + pcRacha, total_coronas: coronas + coronasRacha };
  };

  const restarPC = async (minutos) => {
    if (!character) return;
    const pc = Math.floor(minutos / 10) * 80;
    const nuevoXP = Math.max(0, character.xp - pc);
    const nivelNuevo = calcularNivel(nuevoXP);
    const updates = { xp: nuevoXP, level: nivelNuevo.nivel };
    await supabase.from('character').update(updates).eq('id', character.id);
    setCharacter(prev => ({ ...prev, ...updates }));
    return { pc_perdidos: pc };
  };

  // Info calculada
  const nivelInfo = character ? calcularNivel(character.xp) : NIVELES[0];
  const nivelSiguiente = NIVELES.find(n => n.nivel === nivelInfo.nivel + 1);
  const pcEnNivel = character ? character.xp - nivelInfo.minPC : 0;
  const pcParaSiguiente = nivelSiguiente ? nivelSiguiente.minPC - nivelInfo.minPC : 1;
  const pct = Math.min(100, Math.round((pcEnNivel / pcParaSiguiente) * 100));
  const rachaNecesaria = RACHA_MINIMA(nivelInfo.nivel);

  return {
    character,
    nivelInfo,
    nivelSiguiente,
    pct,
    levelUp,
    setLevelUp,
    sumarPC,
    restarPC,
    fetchCharacter,
    rachaNecesaria,
    PC_POR_TIPO,
    CORONAS_POR_TIPO,
  };
}