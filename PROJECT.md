# Shacharis PWA — Project Summary

Last updated: 2026-08-04

## What this is

PWA on **Vite + React + TypeScript + Tailwind** — morning prayers (Shacharis) with Hebrew text, transliteration, translations (RU/NL/EN/FR), and TTS audio.

## Local development

```powershell
cd C:\dev\shacharis-pwa\shacharis-pwa
npm install
npm run dev
```

Open **http://localhost:5173/** in Chrome/Edge (not the embedded Cursor preview).

If changes don't appear: `Ctrl+Shift+R`, or DevTools → Application → Unregister Service Worker.

## Git branches

| Branch | Purpose |
|--------|---------|
| `version-1.0` | Stable v1 for production deploy |
| `version-2.0` | Active development |
| `main` | Main branch |

Deploy on Vercel: **Settings → Environments → Production → Branch Tracking** → choose branch.

## Prayer data structure

Each prayer in `src/App.tsx`:

```typescript
{
  id: number,
  titleEn: string,
  titleHe: string,
  he_display: string,  // shown on screen
  he_tts: string,      // sent to TTS (Divine Name replaced at runtime)
  translit: string,
  ru: string,
  nl: string,
  en: string,
  fr: string,
}
```

Total prayers: dynamic — `TOTAL_PRAYERS = prayers[prayers.length - 1].id` (currently **22**).

## Key files

| File | Role |
|------|------|
| `src/App.tsx` | Prayers data, UI, swipe navigation, TTS |
| `src/components/SplashScreen.tsx` | Animated splash (2s + 0.6s fade) |
| `index.html` | Static splash bridge, PWA meta, teal background |
| `vite.config.js` | PWA manifest, Workbox |

## Completed features

### Splash screen
- Static HTML splash in browser only (hidden in installed PWA via `display-mode: standalone`)
- React `SplashScreen`: 2 seconds visible, then 0.6s fade-out
- Avoids triple-flash on Android (native → static → react)

### Navigation
- Swipe from **right edge → left**: next prayer
- Swipe from **left edge → right**: previous prayer
- From first prayer → back to list; from last → stay

### TTS
- Rate: **0.50**
- Divine Name replacement before speak: `יְהוָה|יְהֹוָה|יהוה|יְיָ` → `אֲדֹנָי`

### Hebrew display
- `HebrewDisplay` component splits `[English instruction lines]` (LTR, italic) from Hebrew (RTL)
- Used for reform notes and stage directions in `he_display`

### Content (version-2.0)
- Prayers **1–22** (expanded from original 14)
- Reform/inclusive morning blessings (cards 13–16, 22)
- English `[...]` notes separated from Hebrew text
- Prayer counter shows `id / TOTAL_PRAYERS` (not hardcoded)

## TODO / next steps

- [ ] iOS startup images (`apple-touch-startup-image`) to remove white flash on PWA launch
- [ ] Add remaining Shaharit prayers after #22
- [ ] Align PWA manifest name (currently "Siddur") with "Shacharis" if desired
- [ ] Verify `icon-192.png` and `icon-512.png` in repo / production
- [ ] Deploy `version-2.0` to Vercel when ready
- [ ] Commit and push ongoing `version-2.0` changes

## Prompt template for new chat

```
Project: Shacharis PWA — read PROJECT.md for context.
Branch: version-2.0
Path: C:\dev\shacharis-pwa\shacharis-pwa

Next task: [describe here]
```

## Changelog (high level)

- **2026-08-04**: Branches `version-1.0` and `version-2.0` created; splash unified; swipe nav; TTS 0.50; prayers 13–22; HebrewDisplay; dynamic prayer count.
