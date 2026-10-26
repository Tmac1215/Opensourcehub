/**
 * AdSlot — drop-in display-ad container.
 *
 * To activate:
 *   1. Add your Google AdSense <script> to app/layout.tsx <head>
 *   2. Replace the inner <div> below with an <ins className="adsbygoogle" …> element
 *   3. Remove the placeholder text
 *
 * Slot sizes:
 *   leaderboard  → 728×90   (top / bottom of page)
 *   banner       → 468×60   (in-content divider)
 *   rectangle    → 300×250  (sidebar / mid-content)
 *   sidebar      → 300×600  (tall sidebar)
 */

interface Props {
  /** AdSense data-ad-slot value */
  slot?: string;
  format?: 'leaderboard' | 'banner' | 'rectangle' | 'sidebar';
  className?: string;
}

const SIZE: Record<NonNullable<Props['format']>, string> = {
  leaderboard: 'h-24 max-w-4xl',
  banner:      'h-16 max-w-2xl',
  rectangle:   'h-64 max-w-sm',
  sidebar:     'h-[600px] max-w-xs',
};

export default function AdSlot({ slot = 'default', format = 'rectangle', className = '' }: Props) {
  return (
    <div
      className={[
        'w-full mx-auto flex items-center justify-center',
        'border border-dashed border-slate-700/60 rounded-xl',
        'bg-slate-900/40 text-slate-600 text-xs',
        SIZE[format],
        className,
      ].join(' ')}
      aria-hidden="true"
    >
      {/* ── Swap this comment block with your ad tag ───────────────────────
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ─────────────────────────────────────────────────────────────────── */}
      <span className="select-none">Ad · {format} · slot:{slot}</span>
    </div>
  );
}
