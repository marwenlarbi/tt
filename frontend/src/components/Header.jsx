import { Moon, Sun, User, Home, PawPrint, Store, Stethoscope, Bell, X } from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
};

export default function Navbar({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const loggedIn = Boolean(getAccessToken());
  const { items: notifications, unreadCount, loading: notificationsLoading, error: notificationsError, load, markRead, markAllRead } =
    useNotifications({ enabled: loggedIn });

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

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#8657ff] dark:bg-[#8657ff] shadow-md transition-colors duration-300">
        <div className="container mx-auto flex justify-between items-center px-4 py-4 md:px-10 lg:px-48">
          <button onClick={() => handleNavigation("/profile")} aria-label="Accéder au profil utilisateur">
            <User className="w-6 h-6 text-white hover:text-purple-300 transition-colors duration-300" />
          </button>

          <div className="flex gap-4 md:gap-8">
            <button onClick={() => handleNavigation("/home")} aria-label="Accéder à l'accueil">
              <Home className="w-6 h-6 text-white hover:text-purple-300 transition-colors duration-300" />
            </button>
            <button onClick={() => handleNavigation("/pets")} aria-label="Voir les animaux">
              <PawPrint className="w-6 h-6 text-white hover:text-purple-300 transition-colors duration-300" />
            </button>
            <button onClick={() => handleNavigation("/product")} aria-label="Voir la boutique">
              <Store className="w-6 h-6 text-white hover:text-purple-300 transition-colors duration-300" />
            </button>
            <button onClick={() => handleNavigation("/vet")} aria-label="Consulter le vétérinaire">
              <Stethoscope className="w-6 h-6 text-white hover:text-purple-300 transition-colors duration-300" />
            </button>
          </div>

          <div className="flex items-center gap-2">
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
                className="p-2 rounded-full bg-opacity-30 hover:bg-opacity-50 bg-gray-600 hover:bg-gray-200 dark:hover:bg-primary-dark transition-colors duration-300 relative"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6 text-white hover:text-purple-200 transition-colors duration-300" />
                {loggedIn && unreadCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-opacity-30 hover:bg-opacity-50 bg-gray-600 hover:bg-gray-200 dark:hover:bg-primary-dark transition-colors duration-300"
              aria-label={darkMode ? "Passer en mode clair" : "Passer en mode sombre"}
            >
              {darkMode ? (
                <Sun className="w-6 h-6 text-yellow-400 hover:text-yellow-300 transition-colors duration-300" />
              ) : (
                <Moon className="w-6 h-6 text-white hover:text-purple-300 transition-colors duration-300" />
              )}
            </button>
          </div>
        </div>
      </nav>

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
                <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">Chargement…</p>
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
                      Publication #{n.post_id}
                      {n.comment_id ? ` · commentaire #${n.comment_id}` : ""}
                      {n.type ? ` · ${TYPE_LABEL[n.type] || n.type}` : ""}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

Navbar.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  setDarkMode: PropTypes.func.isRequired,
};
