function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export default function HebrewPlayerBar({
  caption,
  isPlaying,
  progress,
  currentSec,
  durationSec,
  notice,
  listenLabel,
  playLabel,
  pauseLabel,
  onToggle,
}: {
  caption: string;
  isPlaying: boolean;
  progress: number;
  currentSec: number;
  durationSec: number;
  notice: string | null;
  listenLabel: string;
  playLabel: string;
  pauseLabel: string;
  onToggle: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] ui-sans z-20">
      <div className="max-w-[720px] mx-auto px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onToggle}
              className="h-11 w-11 rounded-full bg-[#0D9488] text-white flex items-center justify-center hover:bg-teal-700 active:scale-95 transition shadow-sm shrink-0"
              aria-label={isPlaying ? pauseLabel : playLabel}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="5" width="4" height="14" rx="1" /><rect x="13" y="5" width="4" height="14" rx="1" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-[2px]"><path d="M7 5.5c0-1.2 1.3-1.9 2.3-1.1l9 7c.8.6.8 1.8 0 2.4l-9 7c-1 .7-2.3 0-2.3-1.2v-14z" /></svg>
              )}
            </button>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold leading-none">{listenLabel}</div>
              <div className="text-[11px] text-zinc-500 mt-1 truncate">{caption} • he-IL 0.50×</div>
            </div>
          </div>
          <div className="text-[11px] font-medium text-zinc-600 tabular-nums">{formatTime(currentSec)} / {formatTime(durationSec || 0)}</div>
        </div>
        <div className="mt-3 h-[6px] w-full bg-zinc-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#0D9488] rounded-full transition-all duration-150" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
        {notice ? <p className="mt-2 text-[11px] leading-4 text-zinc-500">{notice}</p> : null}
      </div>
    </div>
  );
}
