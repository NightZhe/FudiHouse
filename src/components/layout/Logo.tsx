interface LogoProps {
  /** mark：只有圖形標誌；full：圖形標誌＋中文字標 */
  variant?: 'mark' | 'full';
  /** inverted 用於深色背景（例如後台登入頁） */
  tone?: 'default' | 'inverted';
  className?: string;
}

/**
 * 富地房屋品牌標誌。手繪 SVG：屋頂輪廓＋地基線，代表「安身立地」。
 * 深松綠 + 溫潤黃銅兩色，無漸層與陰影，維持沉穩質感。
 */
export function Logo({ variant = 'full', tone = 'default', className = '' }: LogoProps) {
  const wordmarkColor = tone === 'inverted' ? 'text-white' : 'text-ink-900';
  const taglineColor = tone === 'inverted' ? 'text-white/55' : 'text-ink-500';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 48 48"
        role="img"
        aria-label="富地房屋標誌"
        className="shrink-0"
      >
        <rect x="2" y="2" width="44" height="44" rx="12" className="fill-brand-700" />
        <path d="M24 9.5 L37 20.5 H11 Z" className="fill-surface" />
        <rect x="14.5" y="20.5" width="19" height="14.5" className="fill-surface" />
        <rect x="20.5" y="25.5" width="7" height="9.5" className="fill-brand-700" />
        <rect x="12.5" y="36.5" width="23" height="2.6" rx="1.3" className="fill-accent-500" />
      </svg>
      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className={`font-black text-lg tracking-wide ${wordmarkColor}`}>富地房屋</span>
          <span className={`text-[10px] font-medium tracking-[0.2em] ${taglineColor}`}>FUDI REALTY</span>
        </div>
      )}
    </div>
  );
}
