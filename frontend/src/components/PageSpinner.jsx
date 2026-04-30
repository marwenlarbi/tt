/**
 * Spinner aligné sur l’interface vétérinaire (bordure violette animée).
 * Réutilisable : fil global, pages, overlay API.
 */
export default function PageSpinner({ className = '' }) {
  return (
    <div
      className={`flex items-center justify-center py-12 ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement"
    >
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8657ff]" />
    </div>
  );
}
