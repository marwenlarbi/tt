import { useEffect } from 'react';
import api from '../services/api';

function getAccessToken() {
  const t =
    localStorage.getItem('access_token') ||
    localStorage.getItem('access') ||
    localStorage.getItem('token');
  if (!t || t === 'undefined' || t === 'null') return null;
  return t;
}

/**
 * Envoie un heartbeat au serveur pour la présence (last_seen), comme sur Facebook.
 */
export function usePresencePing(intervalMs = 45000) {
  useEffect(() => {
    const ping = () => {
      if (!getAccessToken()) return;
      api.post('/user/presence/ping/').catch(() => {});
    };

    ping();
    const id = setInterval(ping, intervalMs);
    const onVis = () => {
      if (document.visibilityState === 'visible') ping();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [intervalMs]);
}
