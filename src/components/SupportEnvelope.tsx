type SupportEnvelopeProps = {
  onOpen: () => void;
  onDismiss: () => void;
  dismissLabel: string;
  noteLabel: string;
};

export default function SupportEnvelope({ onOpen, onDismiss, dismissLabel, noteLabel }: SupportEnvelopeProps) {
  return (
    <div className="support-envelope fixed z-30 right-5 bottom-6 flex items-end gap-1">
      <button
        type="button"
        onClick={onDismiss}
        className="h-7 w-7 rounded-full bg-white border border-zinc-200 text-zinc-500 shadow-sm flex items-center justify-center hover:text-zinc-800 hover:border-zinc-300"
        aria-label={dismissLabel}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onOpen}
        className="h-14 w-14 rounded-full bg-[#0D9488] text-white shadow-[0_8px_24px_rgba(13,148,136,0.35)] flex items-center justify-center hover:bg-teal-700 active:scale-95 transition"
        aria-label={noteLabel}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 7 9-7" />
        </svg>
      </button>
    </div>
  );
}
