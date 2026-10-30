/**
 * AK monogramı: "A" ve "K" ortak bir gövdeyi paylaşır.
 * A'nın sağ bacağı K'nin gövdesine oturur; K'nin üst kolu vurgu rengindedir.
 */
export function AKMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label="AK"
      className={className}
      strokeWidth={6}
      strokeLinecap="square"
      strokeLinejoin="miter"
    >
      <path d="M5 57 L19 8 L33 57" stroke="currentColor" />
      <path d="M11 39 H27" stroke="currentColor" />
      <path d="M33 8 V57" stroke="currentColor" />
      <path d="M33 34 L58 8" stroke="rgb(var(--accent))" />
      <path d="M33 31 L58 57" stroke="currentColor" />
    </svg>
  );
}
