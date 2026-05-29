/**
 * Loader unique du projet : cercle à bordure animée (#8657ff), comme la page Vétérinaires.
 * Utiliser partout à la place de Loader2, Loader lucide, ou texte « Chargement… » seul.
 *
 * @param {'page'|'lg'|'md'|'sm'|'xs'|'2xs'|'3xs'} size
 * @param {boolean} compact — true : pas de py-12 (boutons, lignes, zones étroites)
 * @param {'brand'|'onDark'} borderTone — onDark : bordure blanche sur fond violet
 */
const SIZE_CLASS = {
  page: 'h-12 w-12',
  lg: 'h-10 w-10',
  md: 'h-8 w-8',
  sm: 'h-5 w-5',
  xs: 'h-4 w-4',
  '2xs': 'h-3.5 w-3.5',
  '3xs': 'h-3 w-3',
};

const BORDER_CLASS = {
  brand: 'border-[#8657ff]',
  onDark: 'border-white',
};

export default function PageSpinner({
  className = '',
  size = 'page',
  compact = false,
  borderTone = 'brand',
}) {
  const dim = SIZE_CLASS[size] ?? SIZE_CLASS.page;
  const border = BORDER_CLASS[borderTone] ?? BORDER_CLASS.brand;
  const wrapperClass = compact
    ? `inline-flex items-center justify-center ${className}`.trim()
    : `flex items-center justify-center py-12 ${className}`.trim();

  return (
    <div
      className={wrapperClass}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement"
    >
      <div className={`animate-spin rounded-full border-b-2 ${dim} ${border}`} />
    </div>
  );
}
