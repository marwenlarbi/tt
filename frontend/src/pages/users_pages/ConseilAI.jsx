import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import PageSpinner from '../../components/PageSpinner';
import { AlertTriangle, MessageCircle, PawPrint, RotateCcw, Sparkles, Stethoscope } from 'lucide-react';
import api from '../../services/api';

function getAccessToken() {
  const t =
    localStorage.getItem('access_token') ||
    localStorage.getItem('access') ||
    localStorage.getItem('token');
  if (!t || t === 'undefined' || t === 'null') return null;
  return t;
}

/** Normalise les *** mal formés par le modèle (affiche le gras correctement). */
function normalizeMarkdownLine(line) {
  let s = line;
  s = s.replace(/^\s*\*\*\*/g, '**');
  s = s.replace(/\*\*\*(?=\s*\*\*)/g, '**');
  return s.replace(/\*\*\*/g, '**');
}

/**
 * Gras **…** : découpe par « ** » (supporte le texte qui contient des caractères spéciaux).
 */
function InlineBold({ text }) {
  if (!text) return null;
  const normalized = normalizeMarkdownLine(text);
  const segments = normalized.split('**');
  return (
    <>
      {segments.map((seg, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-gray-900 dark:text-gray-50">
            {seg}
          </strong>
        ) : (
          <span key={i}>{seg}</span>
        )
      )}
    </>
  );
}

function ReplyBody({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (!line.trim()) {
          return <div key={i} className="h-2" aria-hidden />;
        }
        const trimmed = line.trim();
        const isBullet =
          /^[-•]\s/.test(trimmed) ||
          /^\d+\.\s/.test(trimmed) ||
          /^\*\s+\S/.test(trimmed);
        const isSubheading =
          /^\*\*[^*]+\*\*:?\s*$/.test(trimmed) ||
          (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length < 120);
        return (
          <p
            key={i}
            className={`text-[15px] leading-relaxed text-gray-800 dark:text-gray-200 ${
              isBullet
                ? 'border-l-[3px] border-[#8657ff]/55 bg-[#8657ff]/5 py-1.5 pl-4 pr-2 dark:bg-[#8657ff]/10'
                : ''
            } ${isSubheading && !isBullet ? 'mt-3 font-medium text-gray-900 first:mt-0 dark:text-gray-100' : ''}`}
          >
            <InlineBold text={line} />
          </p>
        );
      })}
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition ' +
  'placeholder:text-gray-400 focus:border-[#8657ff] focus:outline-none focus:ring-2 focus:ring-[#8657ff]/25 ' +
  'disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-100 ' +
  'dark:placeholder:text-gray-500';

const ConseilAI = () => {
  const navigate = useNavigate();
  const loggedIn = Boolean(getAccessToken());
  const replyRef = useRef(null);

  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState('');
  const [disclaimer, setDisclaimer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (reply && replyRef.current) {
      replyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [reply]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setReply('');
    setDisclaimer('');

    const q = question.trim();
    if (q.length < 3) {
      setError('Veuillez saisir une question (au moins 3 caractères).');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(
        '/user/pet-advice/ai/',
        { question: q },
        { timeout: 90000 }
      );
      setReply(data.reply || '');
      setDisclaimer(data.disclaimer || '');
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Une erreur est survenue.';
      setError(typeof detail === 'string' ? detail : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAnswer = () => {
    setReply('');
    setDisclaimer('');
    setError(null);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 pb-12 pt-8">
        {/* En-tête */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-[#8657ff]/20 bg-gradient-to-br from-[#8657ff]/12 via-white to-purple-50/80 p-6 shadow-sm dark:border-[#8657ff]/30 dark:from-[#8657ff]/20 dark:via-dark-card dark:to-gray-900/50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#8657ff] text-white shadow-md shadow-[#8657ff]/30">
                <Sparkles className="h-7 w-7" strokeWidth={1.75} aria-hidden />
              </div>
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-dark-text">
                    Conseil IA
                  </h1>
                  <span className="rounded-full bg-[#8657ff]/15 px-2.5 py-0.5 text-xs font-semibold text-[#6b3fd4] dark:bg-[#8657ff]/25 dark:text-purple-200">
                    Gemini
                  </span>
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Posez une question sur le bien-être de votre animal. Réponses en{' '}
                  <span className="font-medium text-gray-800 dark:text-gray-300">résumés structurés</span>, à titre
                  informatif uniquement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Avertissement médical */}
        <div className="mb-8 flex gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/90 p-4 shadow-sm dark:border-amber-800/60 dark:bg-amber-950/35">
          <div className="shrink-0 pt-0.5">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden />
          </div>
          <p className="text-sm leading-relaxed text-amber-950 dark:text-amber-100">
            <span className="font-semibold">Important.</span> Ceci ne remplace pas une consultation chez un vétérinaire.
            En urgence, contactez immédiatement un professionnel de santé animale.
          </p>
        </div>

        {!loggedIn && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center dark:border-gray-600 dark:bg-dark-card/80">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-[#8657ff]/70" />
            <p className="mb-1 text-lg font-semibold text-gray-900 dark:text-dark-text">Connexion requise</p>
            <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Connectez-vous pour poser votre question à l’assistant IA.
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center justify-center rounded-xl bg-[#8657ff] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#8657ff]/25 transition hover:brightness-110"
            >
              Se connecter
            </button>
          </div>
        )}

        {loggedIn && (
          <section
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-md dark:border-gray-700 dark:bg-dark-card sm:p-6"
            aria-busy={loading}
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-dark-text">
              <PawPrint className="h-5 w-5 text-[#8657ff]" aria-hidden />
              Votre demande
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="question" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Question
                </label>
                <textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={loading}
                  rows={6}
                  maxLength={4000}
                  required
                  placeholder="Ex. mon chien boite depuis hier, que faire en attendant le véto ?"
                  className={`${inputClass} min-h-[140px] resize-y`}
                />
                <div className="mt-1.5 flex justify-end">
                  <span
                    className={`text-xs tabular-nums ${
                      question.length > 3800 ? 'font-medium text-amber-600 dark:text-amber-400' : 'text-gray-500'
                    }`}
                  >
                    {question.length} / 4000
                  </span>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-100"
                >
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#8657ff] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#8657ff]/25 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <PageSpinner size="sm" compact borderTone="onDark" className="!py-0" />
                      <span>Génération du conseil…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 shrink-0" />
                      Obtenir un conseil
                    </>
                  )}
                </button>
                {reply && !loading && (
                  <button
                    type="button"
                    onClick={handleResetAnswer}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700/80"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Nouvelle question
                  </button>
                )}
              </div>

              {loading && (
                <p className="flex items-start gap-2 text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400 sm:text-left">
                  <span className="mt-0.5 inline-block h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-[#8657ff]" />
                  Le modèle prépare une réponse structurée (souvent 10 à 40 secondes selon Google).
                </p>
              )}
            </form>
          </section>
        )}

        {loggedIn && reply && (
          <section
            ref={replyRef}
            className="mt-8 scroll-mt-24 rounded-2xl border border-gray-200 bg-white shadow-lg ring-1 ring-gray-100 dark:border-gray-600 dark:bg-dark-card dark:ring-gray-800"
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-[#8657ff]/8 to-transparent px-5 py-4 dark:border-gray-700 dark:from-[#8657ff]/15">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-dark-text">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8657ff]/15 text-[#8657ff] dark:bg-[#8657ff]/25">
                  <MessageCircle className="h-5 w-5" aria-hidden />
                </span>
                Réponse
              </h2>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <div className="max-h-[min(65vh,560px)] overflow-y-auto pr-1">
                <ReplyBody text={reply} />
              </div>
            </div>

            {disclaimer && (
              <div className="border-t border-gray-100 bg-gray-50/80 px-5 py-4 dark:border-gray-700 dark:bg-gray-900/40">
                <div className="flex gap-3">
                  <Stethoscope className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                  <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{disclaimer}</p>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ConseilAI;
