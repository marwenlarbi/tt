import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

function getAccessToken() {
  const t =
    localStorage.getItem("access_token") ||
    localStorage.getItem("access") ||
    localStorage.getItem("token");
  if (!t || t === "undefined" || t === "null") return null;
  return t;
}

const POLL_MS = 30000;

/**
 * Notifications JWT : liste, non lus, marquer lu, polling.
 */
export function useNotifications({ enabled = true } = {}) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!getAccessToken()) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    if (!silent) setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/user/notifications/");
      const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
      setItems(list);
      setUnreadCount(
        typeof data?.unread_count === "number" ? data.unread_count : list.filter((n) => !n.is_read).length
      );
    } catch {
      setError("Impossible de charger les notifications.");
      setItems([]);
      setUnreadCount(0);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const markRead = useCallback(
    async (id) => {
      await api.patch(`/user/notifications/${id}/read/`);
      await load(true);
    },
    [load]
  );

  const markAllRead = useCallback(async () => {
    await api.post("/user/notifications/read-all/");
    await load(true);
  }, [load]);

  useEffect(() => {
    if (!enabled || !getAccessToken()) return undefined;
    load();
    const id = window.setInterval(() => load(true), POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, load]);

  return { items, unreadCount, loading, error, load, markRead, markAllRead };
}
