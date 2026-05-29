import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import VetLayout from './VetLayout';
import PageSpinner from '../../components/PageSpinner';
import api, { mediaUrl } from '../../services/api';
import { Lightbulb, Trash2, Image as ImageIcon, Video, Type, Pencil } from 'lucide-react';

function readStoredRole() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u?.role ?? null;
  } catch {
    return null;
  }
}

const TYPES = [
  { value: 'text', label: 'Texte', icon: Type },
  { value: 'image', label: 'Photo', icon: ImageIcon },
  { value: 'video', label: 'Vidéo', icon: Video },
];

const VetAdvicePublish = () => {
  const [type, setType] = useState('text');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [mine, setMine] = useState([]);
  const [loadingMine, setLoadingMine] = useState(true);
  const [userRole] = useState(readStoredRole);
  const [editingId, setEditingId] = useState(null);
  const [editType, setEditType] = useState('text');
  const [editContent, setEditContent] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [editError, setEditError] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadMine = useCallback(async () => {
    if (userRole !== 'vet') {
      setMine([]);
      setLoadingMine(false);
      return;
    }
    setLoadingMine(true);
    try {
      const { data } = await api.get('/vet/advice/', { params: { mine: '1' } });
      setMine(Array.isArray(data) ? data : []);
    } catch {
      setMine([]);
    } finally {
      setLoadingMine(false);
    }
  }, [userRole]);

  useEffect(() => {
    loadMine();
  }, [loadMine]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (userRole !== 'vet') {
      setFormError('Seuls les comptes vétérinaires peuvent publier.');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('type', type);
      fd.append('content', content);
      if (type === 'image' && file) fd.append('image', file);
      if (type === 'video' && file) fd.append('video', file);

      await api.post('/vet/advice/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setContent('');
      setFile(null);
      await loadMine();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        (typeof err?.response?.data === 'object'
          ? Object.values(err.response.data).flat().filter(Boolean)[0]
          : null) ||
        'Publication impossible. Vérifiez les champs et votre connexion.';
      setFormError(typeof msg === 'string' ? msg : 'Erreur lors de la publication.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce conseil ?')) return;
    try {
      await api.delete(`/vet/advice/${id}/`);
      setMine((prev) => prev.filter((x) => x.id !== id));
    } catch {
      alert('Suppression impossible.');
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditType(row.type || 'text');
    setEditContent(row.content || '');
    setEditFile(null);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditType('text');
    setEditContent('');
    setEditFile(null);
    setEditError(null);
  };

  const handleSaveEdit = async (row) => {
    setEditError(null);
    setSavingEdit(true);
    try {
      const fd = new FormData();
      fd.append('type', editType);
      fd.append('content', editContent);
      if (editType === 'image' && editFile) fd.append('image', editFile);
      if (editType === 'video' && editFile) fd.append('video', editFile);

      const { data } = await api.patch(`/vet/advice/${row.id}/`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMine((prev) => prev.map((x) => (x.id === row.id ? data : x)));
      cancelEdit();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        (typeof err?.response?.data === 'object'
          ? Object.values(err.response.data).flat().filter(Boolean)[0]
          : null) ||
        'Modification impossible.';
      setEditError(typeof msg === 'string' ? msg : 'Modification impossible.');
    } finally {
      setSavingEdit(false);
    }
  };

  if (userRole !== 'vet') {
    return (
      <VetLayout>
        <div className="p-8 max-w-lg">
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            {userRole == null
              ? 'Connectez-vous avec un compte vétérinaire pour publier des conseils.'
              : 'Cette page est réservée aux vétérinaires.'}
          </p>
          <Link to="/login" className="mt-4 inline-block text-sm font-medium text-[#8657ff] hover:underline">
            Aller à la connexion
          </Link>
        </div>
      </VetLayout>
    );
  }

  return (
    <VetLayout>
      <div className="p-6 md:p-10 max-w-3xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-[#8657ff]/15 p-3 text-[#8657ff]">
            <Lightbulb className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Publier des conseils</h1>
            <p className="text-sm text-gray-600">
              Partagez des conseils en texte, photo ou vidéo avec les propriétaires.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-2">
            {TYPES.map((t) => {
              const Icon = t.icon;
              const active = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setType(t.value);
                    setFile(null);
                    setFormError(null);
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[#8657ff] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {(type === 'text' || type === 'image' || type === 'video') && (
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {type === 'text' ? 'Texte du conseil' : 'Légende (optionnelle)'}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={type === 'text' ? 6 : 3}
                className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-[#8657ff] focus:outline-none focus:ring-1 focus:ring-[#8657ff]"
                placeholder={
                  type === 'text'
                    ? 'Rédigez votre conseil…'
                    : 'Ajoutez une description sous la photo ou la vidéo…'
                }
                required={type === 'text'}
              />
            </label>
          )}

          {type === 'image' && (
            <label className="mb-4 mt-3 block text-sm font-medium text-gray-700">
              Image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-gray-600"
              />
            </label>
          )}

          {type === 'video' && (
            <label className="mb-4 mt-3 block text-sm font-medium text-gray-700">
              Vidéo
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-gray-600"
              />
            </label>
          )}

          {formError && (
            <p className="mb-3 text-sm text-red-600">{formError}</p>
          )}

          <button
            type="submit"
            disabled={submitting || (type === 'text' && !content.trim())}
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-[#8657ff] px-6 py-2.5 font-medium text-white transition hover:bg-[#7040e6] disabled:opacity-50"
          >
            {submitting ? <PageSpinner compact size="sm" borderTone="onDark" /> : 'Publier le conseil'}
          </button>
        </form>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Mes conseils publiés</h2>
          {loadingMine ? (
            <PageSpinner compact size="md" />
          ) : mine.length === 0 ? (
            <p className="text-sm text-gray-500">Vous n&apos;avez pas encore publié de conseil.</p>
          ) : (
            <ul className="space-y-3">
              {mine.map((row) => (
                <li
                  key={row.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium uppercase text-gray-500">{row.type}</div>
                    {editingId === row.id ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {TYPES.map((t) => (
                            <button
                              key={t.value}
                              type="button"
                              onClick={() => {
                                setEditType(t.value);
                                setEditFile(null);
                                setEditError(null);
                              }}
                              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                                editType === t.value
                                  ? 'bg-[#8657ff] text-white'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={editType === 'text' ? 4 : 2}
                          className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                          placeholder={editType === 'text' ? 'Texte du conseil…' : 'Légende (optionnelle)'}
                        />
                        {editType !== 'text' && (
                          <input
                            type="file"
                            accept={editType === 'image' ? 'image/*' : 'video/*'}
                            onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                            className="block w-full text-xs text-gray-600"
                          />
                        )}
                        {editError && <p className="text-xs text-red-600">{editError}</p>}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(row)}
                            disabled={savingEdit || (editType === 'text' && !editContent.trim())}
                            className="rounded-md bg-[#8657ff] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                          >
                            {savingEdit ? 'Enregistrement…' : 'Enregistrer'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={savingEdit}
                            className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-800">{row.content || '(sans texte)'}</p>
                        {row.image && (
                          <img
                            src={mediaUrl(row.image)}
                            alt=""
                            className="mt-2 h-20 w-auto rounded object-cover"
                          />
                        )}
                        {row.video && (
                          <span className="mt-2 inline-block text-xs text-gray-500">Vidéo jointe</span>
                        )}
                      </>
                    )}
                  </div>
                  {editingId !== row.id && (
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(row)}
                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        title="Modifier"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </VetLayout>
  );
};

export default VetAdvicePublish;
