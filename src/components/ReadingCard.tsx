import { useEffect, useState } from 'react';
import HebrewPlayerBar from './HebrewPlayerBar';
import { IDLE_WORD_CLASS, SPOKEN_WORD_CLASS } from '../hebrewSpeech';
import { useHebrewPlayer } from '../useHebrewPlayer';
import { READING_COPY } from '../readingCopy';
import { loadSefariaPassage, type PassageVerse } from '../sefariaPassage';
import { controlsCopy, type Lang } from '../supportCopy';

function HebrewVerse({
  verse,
  wordStart,
  activeWord,
  onWord,
}: {
  verse: PassageVerse;
  wordStart: number;
  activeWord: number | null;
  onWord: (word: string) => void;
}) {
  const words = verse.hebrew.split(/\s+/).filter(Boolean);
  return (
    <p dir="rtl" lang="he" className="he-serif text-right text-[22px] leading-[1.9] text-zinc-900">
      <span dir="ltr" className="ui-sans me-2 text-[12px] font-medium text-zinc-400">{verse.chapter}:{verse.verse}</span>
      {words.map((word, index) => {
        const wordIndex = wordStart + index;
        const spoken = wordIndex === activeWord;
        return (
          <span key={`${verse.chapter}-${verse.verse}-${index}`}>
            {index > 0 ? ' ' : null}
            <button
              type="button"
              data-reading-word={wordIndex}
              className={`inline appearance-none border-0 p-0 font-[inherit] text-inherit rounded-sm transition-colors ${
                spoken ? SPOKEN_WORD_CLASS : `bg-transparent ${IDLE_WORD_CLASS}`
              }`}
              onClick={() => onWord(word)}
            >
              {word}
            </button>
          </span>
        );
      })}
    </p>
  );
}

export default function ReadingCard({
  title,
  sefariaRef,
  lang,
  nextTitle,
  onNext,
  onHome,
}: {
  title: string;
  sefariaRef: string;
  lang: Lang;
  nextTitle?: string;
  onNext?: () => void;
  onHome: () => void;
}) {
  const copy = READING_COPY[lang];
  const ui = controlsCopy(lang);
  const [verses, setVerses] = useState<PassageVerse[] | null>(null);
  const [transliteration, setTransliteration] = useState('');
  const [failed, setFailed] = useState(false);
  const hebrew = verses ? verses.map((verse) => verse.hebrew).join(' ') : null;
  const player = useHebrewPlayer(hebrew, ui.ttsNoHebrew);

  useEffect(() => {
    const controller = new AbortController();
    setVerses(null);
    setTransliteration('');
    setFailed(false);
    loadSefariaPassage(sefariaRef)
      .then((passage) => {
        if (controller.signal.aborted) return;
        setVerses(passage.verses);
        setTransliteration(passage.transliteration);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [sefariaRef]);

  useEffect(() => {
    if (player.activeWord === null) return;
    document.querySelector(`[data-reading-word="${player.activeWord}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [player.activeWord]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto px-5 pb-[168px]">
        <h2 className="pt-1 text-[22px] font-semibold leading-snug tracking-tight text-[#0D9488]">{title}</h2>
        {verses === null && !failed ? (
          <p className="mt-6 text-[15px] text-zinc-500">{copy.loading}</p>
        ) : null}
        {failed ? <p className="mt-6 text-[15px] text-zinc-500">{copy.error}</p> : null}
        {verses ? (
          <div className="mt-6 space-y-3">
            {(() => {
              let wordStart = 0;
              return verses.map((verse) => {
                const count = verse.hebrew.split(/\s+/).filter(Boolean).length;
                const start = wordStart;
                wordStart += count;
                return (
                  <HebrewVerse
                    key={`${verse.chapter}:${verse.verse}`}
                    verse={verse}
                    wordStart={start}
                    activeWord={player.activeWord}
                    onWord={player.speakWord}
                  />
                );
              });
            })()}
          </div>
        ) : null}
        {transliteration ? (
          <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-[15px] italic leading-7 text-zinc-700">
            {transliteration}
          </div>
        ) : null}
        {verses ? (
          <p className="mt-6 text-[11px] leading-4 text-zinc-400">
            Miqra according to the Masorah ·{' '}
            <a
              href={`https://www.sefaria.org/${sefariaRef}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-zinc-300 underline-offset-2"
            >
              Sefaria
            </a>
            {' '}· CC-BY-SA
          </p>
        ) : null}
        {nextTitle && onNext ? (
          <button
            type="button"
            onClick={onNext}
            className="mt-8 block text-left text-[15px] font-medium text-[#0D9488] underline decoration-[#0D9488]/40 underline-offset-2"
          >
            {copy.next} · {nextTitle}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onHome}
          className="mt-4 h-11 w-full rounded-full border border-[#0D9488] text-[14px] font-medium text-[#0D9488]"
        >
          {copy.home}
        </button>
      </div>
      {verses ? (
        <HebrewPlayerBar
          caption={title}
          isPlaying={player.isPlaying}
          progress={player.progress}
          currentSec={player.currentSec}
          durationSec={player.durationSec}
          notice={player.notice}
          listenLabel={ui.listen}
          playLabel={ui.play}
          pauseLabel={ui.pause}
          onToggle={player.toggle}
        />
      ) : null}
    </div>
  );
}
