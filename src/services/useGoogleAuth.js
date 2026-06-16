import { useState, useEffect } from 'react';
import { initGoogleAuth, getAccessToken } from './googleCalendar';

export function useGoogleAuth() {
  const [token, setToken] = useState(localStorage.getItem('google_token'));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initGoogleAuth(() => setReady(true));
  }, []);

  const conectar = () => {
    getAccessToken((newToken) => setToken(newToken));
  };

  const desconectar = () => {
    localStorage.removeItem('google_token');
    setToken(null);
  };

  return { token, ready, conectar, desconectar };
}