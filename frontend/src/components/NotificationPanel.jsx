import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, X } from "lucide-react";
import PageSpinner from "./PageSpinner";
import { useNotifications } from "../hooks/useNotifications";

function getAccessToken() {
  const t =
    localStorage.getItem("access_token") ||
    localStorage.getItem("access") ||
    localStorage.getItem("token");
  if (!t || t === "undefined" || t === "null") return null;
  return t;
}

const TYPE_LABEL = {
  like: "J’aime",
  love: "J’adore",
  comment: "Commentaire",
  reply: "Réponse",
  share: "Partage",
  appt_request: "Demande de RDV",
  appt_update: "Rendez-vous",
  consultation: "Consultation",
  post_removed: "Modération",
};

/**
 * Cloche + panneau notifications (flux social + échanges vétérinaire / propriétaire).
 */
export default function NotificationPanel({
  enabled = true,
  bellButtonClassName = "",
}) {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const loggedIn = Boolean(getAccessToken());
  const { items: notifications, unreadCount, loading: notificationsLoading, error: notificationsError, load, markRead, markAllRead } =
    useNotifications({ enabled: enabled && loggedIn });

  useEffect(() => {
    if (notificationsOpen && loggedIn) load(true);
  }, [notificationsOpen, loggedIn, load]);

  const handleOpenNotification = async (n) => {
    if (!n.is_read) {
      try {
        await markRead(n.id);
      } catch {
        /* ignore */
      }
    }
    setNotificationsOpen(false);

    if (n.post_id == null || n.post_id === undefined) {
      if (n.type === "appt_request") {
        navigate("/vet/appointments");
      } else if (n.type === "appt_update" || n.type === "consultation") {
        navigate("/pets");
      } else {
        navigate("/home");
      }
      return;
    }

    const hash = n.comment_id ? `post-${n.post_id}-comment-${n.comment_id}` : `post-${n.post_id}`;
    navigate(`/home#${hash}`);
    window.setTimeout(() => {
      const postEl = document.getElementById(`post-${n.post_id}`);
      postEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (n.comment_id) {
        const cEl = document.getElementById(`feed-comment-${n.comment_id}`);
        cEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch {
      /* ignore */
    }
  };

  const defaultBell =
    "p-2 rounded-full bg-opacity-30 hover:bg-opacity-50 bg-gray-600 hover:bg-gray-200 dark:hover:bg-primary-dark transition-colors duration-300 relative";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (!loggedIn) {
            navigate("/login");
            return;
          }
          setNotificationsOpen(true);
        }}
        className={bellButtonClassName || defaultBell}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-white hover:text-yellow-200 transition-colors duration-300" />
        {loggedIn && unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {notificationsOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 px-4 pt-24 pb-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notifications-title"
          onClick={() => setNotificationsOpen(false)}
        >
          <div
            className="relative max-h-[min(70vh,28rem)] w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-dark-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-600">
              <h2 id="notifications-title" className="text-lg font-semibold text-gray-900 dark:text-dark-text">
                Notifications 🔔
              </h2>
              <div className="flex items-center gap-2">
                {loggedIn && unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => void handleMarkAllRead()}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Tout lu
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="max-h-[min(60vh,24rem)] overflow-y-auto">
              {notificationsLoading && (
                <div className="flex justify-center px-4 py-6">
                  <PageSpinner compact size="md" />
                </div>
              )}
              {!notificationsLoading && notificationsError && (
                <p className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-400">{notificationsError}</p>
              )}
              {!notificationsLoading && !notificationsError && notifications.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aucune notification pour le moment.
                </p>
              )}
              {!notificationsLoading &&
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => void handleOpenNotification(n)}
                    className={`flex w-full flex-col gap-1 border-b border-gray-100 px-4 py-3 text-left text-sm transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 ${
                      !n.is_read ? "bg-primary/5 dark:bg-primary/10" : ""
                    }`}
                  >
                    <span className="font-medium text-gray-900 dark:text-dark-text">{n.message}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {n.post_id != null && n.post_id !== undefined
                        ? `Publication #${n.post_id}${n.comment_id ? ` · commentaire #${n.comment_id}` : ""}${
                            n.type ? ` · ${TYPE_LABEL[n.type] || n.type}` : ""
                          }`
                        : TYPE_LABEL[n.type] || n.type || "Notification"}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
