import { useEffect, useState } from 'react';
import HebrewPlayerBar from './HebrewPlayerBar';
import TextSizeControl from './TextSizeControl';
import { IDLE_WORD_CLASS, SPOKEN_WORD_CLASS } from '../hebrewSpeech';
import { useHebrewPlayer } from '../useHebrewPlayer';
import { READING_COPY } from '../readingCopy';
import { draftLine, type PassageTranslationLang } from '../readingDraft';
import { loadSefariaPassage, type PassageTranslation, type PassageVerse } from '../sefariaPassage';
import { controlsCopy, type Lang } from '../supportCopy';
import { TYPE_SCALE, type TypeSize } from '../textSize';

type BelowHe = 'translation' | 'translit';

function HebrewVerse({
  verse,
  wordStart,
  activeWord,
  onWord,
  fontSize,
}: {
  verse: PassageVerse;
  wordStart: number;
  activeWord: number | null;
  onWord: (word: string) => void;
  fontSize: number;
}) {
  const words = verse.hebrew.split(/\s+/).filter(Boolean);
  return (
    <p dir="rtl" lang="he" className="he-serif text-right leading-[1.75] text-zinc-900" style={{ fontSize }}>
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
  homeLabel,
  typeSize,
  onTypeSize,
  belowHe,
  onBelowHe,
  translationLang,
  onTranslationLang,
}: {
  title: string;
  sefariaRef: string;
  lang: Lang;
  nextTitle?: string;
  onNext?: () => void;
  onHome: () => void;
  homeLabel?: string;
  typeSize: TypeSize;
  onTypeSize: (size: TypeSize) => void;
  belowHe: BelowHe;
  onBelowHe: (mode: BelowHe) => void;
  translationLang: PassageTranslationLang | null;
  onTranslationLang: (lang: PassageTranslationLang) => void;
}) {
  const copy = READING_COPY[lang];
  const ui = controlsCopy(lang);
  const [verses, setVerses] = useState<PassageVerse[] | null>(null);
  const [transliteration, setTransliteration] = useState('');
  const [translations, setTranslations] = useState<Partial<Record<ReadingTranslationLang, PassageTranslation>>>({});
  const [failed, setFailed] = useState(false);
  const hebrew = verses ? verses.map((verse) => verse.hebrew).join(' ') : null;
  const player = useHebrewPlayer(hebrew, ui.ttsNoHebrew);
  const draftLang = translationLang === 'ru' || translationLang === 'nl' ? translationLang : null;
  const draftReady = verses?.some((verse) => draftLine(sefariaRef, verse.chapter, verse.verse)) ?? false;
  const draftLines = draftLang && verses
    ? verses.map((verse) => draftLine(sefariaRef, verse.chapter, verse.verse)?.[draftLang] ?? '')
    : [];
  const published = translationLang === 'en' || translationLang === 'fr' ? translations[translationLang] : undefined;
  const framedTranslation = published
    ? { lines: published.lines, fallback: published.text, credit: published.credit }
    : draftLines.some(Boolean)
      ? { lines: draftLines, fallback: draftLines.filter(Boolean).join('\n'), credit: copy.translationCredit }
      : null;

  useEffect(() => {
    const controller = new AbortController();
    setVerses(null);
    setTransliteration('');
    setTranslations({});
    setFailed(false);
    loadSefariaPassage(sefariaRef, controller.signal)
      .then((passage) => {
        if (controller.signal.aborted) return;
        setVerses(passage.verses);
        setTransliteration(passage.transliteration);
        setTranslations(passage.translations);
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
        <div className="pt-1 flex items-center justify-between gap-3">
          <h2 className="min-w-0 text-[22px] font-semibold leading-snug tracking-tight text-[#0D9488]">{title}</h2>
          <TextSizeControl
            value={typeSize}
            onChange={onTypeSize}
            label={ui.textSize}
            nameM={ui.textSizeM}
            nameL={ui.textSizeL}
            nameXl={ui.textSizeXl}
          />
        </div>
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
                    fontSize={TYPE_SCALE[typeSize].he}
                  />
                );
              });
            })()}
          </div>
        ) : null}
        {verses ? (
          <div className="mt-8 ui-sans">
            <div className="flex p-1 rounded-full bg-zinc-100" role="tablist" aria-label={`${ui.translation} / ${ui.transliteration}`}>
              {([
                { mode: 'translation' as const, label: ui.translation },
                { mode: 'translit' as const, label: ui.transliteration },
              ]).map(({ mode, label }) => {
                const active = belowHe === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onBelowHe(mode)}
                    className={`flex-1 h-10 rounded-full text-[13px] font-semibold transition-all ${
                      active ? 'bg-[#0D9488] text-white shadow-sm' : 'text-zinc-600'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(['RU', 'NL', 'EN', 'FR'] as const).map((code) => {
                const lower = code.toLowerCase() as PassageTranslationLang;
                const available = lower === 'en' || lower === 'fr' ? Boolean(translations[lower]) : draftReady;
                const active = available && translationLang === lower;
                return (
                  <button
                    key={code}
                    type="button"
                    disabled={!available}
                    aria-disabled={!available}
                    onClick={() => onTranslationLang(lower)}
                    className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
                      active
                        ? 'bg-[#0D9488] text-white shadow-sm'
                        : available
                          ? 'border border-zinc-300 bg-white text-zinc-600'
                          : 'cursor-not-allowed border border-zinc-200 bg-zinc-50 text-zinc-300'
                    }`}
                  >
                    {code}
                  </button>
                );
              })}
            </div>
            {belowHe === 'translit' && transliteration ? (
              <div
                className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 italic text-zinc-700"
                style={{ fontSize: TYPE_SCALE[typeSize].translit, lineHeight: 1.6 }}
              >
                {transliteration}
              </div>
            ) : null}
            {belowHe === 'translation' && verses && framedTranslation ? (
              <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                {framedTranslation.lines.length === verses.length ? (
                  <div className="space-y-3">
                    {verses.map((verse, index) => (
                      <p
                        key={`${verse.chapter}:${verse.verse}`}
                        className="text-zinc-800"
                        style={{ fontSize: TYPE_SCALE[typeSize].translation, lineHeight: 1.7 }}
                      >
                        <span className="me-2 text-[12px] font-medium text-zinc-400">{verse.chapter}:{verse.verse}</span>
                        {framedTranslation.lines[index]}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p
                    className="whitespace-pre-wrap text-zinc-800"
                    style={{ fontSize: TYPE_SCALE[typeSize].translation, lineHeight: 1.7 }}
                  >
                    {framedTranslation.fallback}
                  </p>
                )}
                <p className="mt-4 text-[11px] leading-4 text-zinc-400">{framedTranslation.credit}</p>
              </div>
            ) : null}
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
        <div className="mt-10 flex items-stretch gap-3 ui-sans">
          <button
            type="button"
            onClick={onHome}
            className="flex min-h-11 flex-1 items-center justify-center rounded-full border border-[#0D9488] bg-white px-3 py-2 text-center text-[14px] font-medium leading-tight text-[#0D9488] transition-all hover:bg-teal-50"
          >
            {homeLabel ?? copy.home}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!onNext}
            className={`flex min-h-11 flex-1 flex-col items-center justify-center rounded-full px-3 py-2 text-center text-[14px] font-medium leading-tight transition-all ${
              onNext
                ? 'bg-[#0D9488] text-white shadow-sm hover:bg-teal-700'
                : 'bg-zinc-100 text-zinc-400'
            }`}
          >
            <span>{copy.next}</span>
            {nextTitle && onNext ? (
              <span className="mt-0.5 text-[12px] font-normal leading-snug opacity-90">{nextTitle}</span>
            ) : null}
          </button>
        </div>
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
