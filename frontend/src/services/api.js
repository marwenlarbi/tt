import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',   // ← ton backend Django
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let pendingRequests = [];

// Ajouter le token automatiquement si connecté
api.interceptors.request.use((config) => {
  // Récupère le token (clé historique possible)
  const accessToken =
    localStorage.getItem('access_token') ||
    localStorage.getItem('access') ||
    localStorage.getItem('token');

  if (accessToken && accessToken !== 'undefined' && accessToken !== 'null') {
    const tokenHeader = `Bearer ${accessToken}`;
    // IMPORTANT: ne pas toucher à `headers.common` (sinon certains setups
    // envoient un header navigateur nommé "common" => CORS préflight KO).
    config.headers = config.headers || {};
    config.headers.Authorization = tokenHeader;
  }
  return config;
});

// Si le token est absent/expiré, on force l'utilisateur à se reconnecter.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const statusCode = error?.response?.status;

    const originalRequest = error?.config || {};
    const refreshToken = localStorage.getItem('refresh_token');

    // Tentative unique de refresh token en cas de 401
    if (statusCode === 401 && refreshToken && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', {
          refresh: refreshToken,
        });
        const newAccessToken = refreshResponse?.data?.access;
        if (!newAccessToken) {
          throw new Error('Token refresh response invalide');
        }

        localStorage.setItem('access_token', newAccessToken);
        pendingRequests.forEach(({ resolve }) => resolve(newAccessToken));
        pendingRequests = [];

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        pendingRequests.forEach(({ reject }) => reject(refreshError));
        pendingRequests = [];
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('user');
        if (window.location?.pathname?.startsWith('/admin')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (statusCode === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('user');
      if (window.location?.pathname?.startsWith('/admin')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/** Origine du serveur (sans `/api`) pour les URLs médias */
export function getApiOrigin() {
  const base = api.defaults.baseURL || '';
  return base.replace(/\/?api\/?$/i, '') || '';
}

/**
 * URL absolue vers un fichier média Django.
 * En base, les champs ImageField / default_storage renvoient souvent un chemin relatif
 * (ex. `posts/abc.jpg`) servi sous MEDIA_URL (`/media/...`), pas une URL complète.
 */
export function mediaUrl(path) {
  if (path == null || path === '') return '';
  const raw = String(path).trim().replace(/\\/g, '/');
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw;

  const origin = getApiOrigin();

  if (raw.startsWith('/media/')) {
    return `${origin}${raw}`;
  }
  if (raw.startsWith('media/')) {
    return `${origin}/${raw}`;
  }
  // Chemin type "posts/xxx.jpg" ou "avatars/…" → toujours sous /media/
  if (!raw.startsWith('/')) {
    return `${origin}/media/${raw.replace(/^\/+/, '')}`;
  }
  // Ex. "/static/…" ou autre chemin absolu sur le même hôte
  return `${origin}${raw}`;
}

export default api;