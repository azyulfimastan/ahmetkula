/** Imza detay: köşe artı işareti + bölüm numarası ("AK/02"). Tüm bölümlerde tekrar eder. */
export function SectionTag({ index, label, className }: { index: string; label: string; className?: string }) {
  return (
    <div className={`mono-label flex items-center gap-3 text-[0.68rem] text-muted ${className ?? ""}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="text-accent">
        <path d="M6 0V12M0 6H12" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <span>AK/{index}</span>
      <span aria-hidden="true" className="h-px w-8 bg-fg/30" />
      <span className="text-fg">{label}</span>
    </div>
  );
}
