import { ABOUT_COPY, resolveSystemLang } from '../supportCopy';
import { APP_SHARE_URL, SUPPORT_DONATE_URL } from '../support';

export default function AboutScreen() {
  const copy = ABOUT_COPY[resolveSystemLang()];

  return (
    <div className="px-5 pt-1 pb-16 ui-sans">
      <h2 className="text-[22px] font-semibold tracking-tight leading-tight">{copy.title}</h2>
      <p className="mt-4 text-[15px] leading-7 text-zinc-800">{copy.source}</p>
      <p className="mt-3 text-[15px] leading-7 text-zinc-800 font-medium">{copy.principle}</p>
      <p className="mt-3 text-[15px] leading-7 text-zinc-800">{copy.free}</p>
      <p className="mt-3 text-[15px] leading-7 text-zinc-800">{copy.support}</p>

      {SUPPORT_DONATE_URL ? (
        <a
          href={SUPPORT_DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex h-12 items-center justify-center rounded-full bg-[#0D9488] text-white text-[15px] font-semibold shadow-sm hover:bg-teal-700 active:scale-[0.99] transition"
        >
          {copy.button}
        </a>
      ) : (
        <div className="mt-8 flex h-12 items-center justify-center rounded-full bg-[#0D9488] text-white text-[15px] font-semibold shadow-sm">
          {copy.button}
        </div>
      )}

      <section className="mt-12 pt-10 border-t border-zinc-100 text-center">
        <h3 className="text-[15px] font-semibold tracking-tight leading-snug text-zinc-800">
          {copy.shareTitle}
        </h3>
        <a
          href={APP_SHARE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={copy.shareTitle}
          className="mt-5 inline-block rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm hover:border-[#0D9488]/40 transition"
        >
          <img
            src="/share-qr.svg"
            alt={copy.shareTitle}
            width={176}
            height={176}
            className="h-44 w-44"
          />
        </a>
      </section>
    </div>
  );
}
