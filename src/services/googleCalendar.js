const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/tasks'
  ].join(' ');
  
  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  // Colores por tipo de tarea en Google Calendar
  const CALENDAR_COLORS = {
    mision: '11',   // Rojo tomate
    jefe: '4',      // Rosa flamingo
    campana: '3',   // Uva
    desafio: '2',   // Sage verde
    ruta: '6',      // Naranja
    encargo: '8',   // Grafito
  };
  
  // Nombres de calendarios por tipo
  const CALENDAR_NAMES = {
    mision: 'QuestLog — Misiones',
    jefe: 'QuestLog — Jefes',
    campana: 'QuestLog — Campañas',
    desafio: 'QuestLog — Desafíos',
    ruta: 'QuestLog — Rutas',
  };
  
  // Inicializar Google Identity Services
  export function initGoogleAuth(callback) {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => callback();
    document.body.appendChild(script);
  }
  
  // Obtener token de acceso
  export function getAccessToken(callback) {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.access_token) {
          localStorage.setItem('google_token', response.access_token);
          callback(response.access_token);
        }
      },
    });
    client.requestAccessToken();
  }
  
  // Obtener o crear calendario por tipo
  async function getOrCreateCalendar(token, type) {
    const name = CALENDAR_NAMES[type] || 'QuestLog';
  
    // Buscar calendarios existentes
    const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const existing = data.items?.find(c => c.summary === name);
    if (existing) return existing.id;
  
    // Crear nuevo calendario
    const createRes = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary: name })
    });
    const created = await createRes.json();
    return created.id;
  }
  
  // Crear evento en Google Calendar
  export async function createCalendarEvent(token, task, date, time) {
    const calendarId = await getOrCreateCalendar(token, task.type);
    const [hour, minute] = time.split(':');
    const start = new Date(date);
    start.setHours(parseInt(hour), parseInt(minute), 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);
  
    await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: task.label,
        colorId: CALENDAR_COLORS[task.type] || '8',
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      })
    });
  }
  
  // Crear tarea en Google Tasks (para Encargos)
  export async function createTask(token, label) {
    // Buscar lista QuestLog Tasks
    const res = await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    let list = data.items?.find(l => l.title === 'QuestLog — Encargos');
  
    if (!list) {
      const createRes = await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'QuestLog — Encargos' })
      });
      list = await createRes.json();
    }
  
    await fetch(`https://www.googleapis.com/tasks/v1/lists/${list.id}/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: label })
    });
  }