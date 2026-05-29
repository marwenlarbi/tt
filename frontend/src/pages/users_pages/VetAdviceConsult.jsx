import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { Lightbulb, Stethoscope } from 'lucide-react';
import PageSpinner from '../../components/PageSpinner';
import api, { mediaUrl } from '../../services/api';

function vetDisplayName(vet) {
  if (!vet) return 'Vétérinaire';
  const full = `${vet.first_name || ''} ${vet.last_name || ''}`.trim();
  return full || vet.email || 'Vétérinaire';
}

function vetAvatarUrl(vet) {
  if (!vet) return null;
  const raw = vet.avatar;
  if (typeof raw === 'string' && raw.length) return mediaUrl(raw);
  return null;
}

const VetAdviceConsult = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/vet/advice/');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError('Impossible de charger les conseils vétérinaires.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const formatDate = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Lightbulb className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
              Conseils vétérinaires
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Astuces et recommandations publiées par les vétérinaires de la communauté.
            </p>
          </div>
        </div>

        {loading && <PageSpinner className="!py-16" />}

        {error && !loading && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            {error}
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-gray-600 dark:bg-dark-card">
            <Stethoscope className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucun conseil pour le moment. Revenez plus tard ou suivez les vétérinaires du répertoire.
            </p>
            <button
              type="button"
              onClick={() => navigate('/vet')}
              className="mt-4 text-sm font-medium text-primary hover:underline"
            >
              Voir les vétérinaires
            </button>
          </div>
        )}

        <ul className="space-y-6">
          {items.map((row) => {
            const name = vetDisplayName(row.vet);
            const avatar = vetAvatarUrl(row.vet);
            const type = (row.type || 'text').toLowerCase();
            const img = row.image ? mediaUrl(row.image) : '';
            const vid = row.video ? mediaUrl(row.video) : '';

            return (
              <li
                key={row.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-600 dark:bg-dark-card"
              >
                <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-600">
                  <img
                    src={
                      avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=8657ff&color=fff&size=128`
                    }
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-gray-900 dark:text-dark-text">{name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(row.created_at)}</div>
                  </div>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {type === 'image' ? 'Photo' : type === 'video' ? 'Vidéo' : 'Texte'}
                  </span>
                </div>

                <div className="px-4 py-4">
                  {type === 'text' && (
                    <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{row.content}</p>
                  )}
                  {type === 'image' && img && (
                    <div className="space-y-3">
                      <img src={img} alt="" className="max-h-96 w-full rounded-lg object-contain" />
                      {row.content ? (
                        <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{row.content}</p>
                      ) : null}
                    </div>
                  )}
                  {type === 'video' && vid && (
                    <div className="space-y-3">
                      <video src={vid} controls className="w-full max-h-96 rounded-lg bg-black" playsInline />
                      {row.content ? (
                        <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{row.content}</p>
                      ) : null}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Layout>
  );
};

export default VetAdviceConsult;
