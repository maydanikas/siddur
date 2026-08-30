# Siddur / Shacharis PWA — база знаний

Последнее обновление: **2026-08-30**

## Что это

PWA-молитвенник **Шахарит** (утренние молитвы) с:
- ивритом с никудом на экране;
- транслитерацией (опционально);
- переводами: RU / NL / EN / FR;
- TTS (озвучка) через Web Speech API;
- офлайн-режимом (service worker).

**Репозиторий:** [github.com/maydanikas/siddur](https://github.com/maydanikas/siddur)  
**Локальный путь:** `C:\dev\shacharis-pwa\shacharis-pwa`

---

## Стек

| Слой | Технология |
|------|------------|
| Сборка | Vite 5 |
| UI | React 18 + TypeScript |
| Стили | Tailwind CSS 3 |
| PWA | vite-plugin-pwa + Workbox |
| Аналитика | @vercel/analytics |
| Данные | Inline-массив `prayers[]` в `src/App.tsx` (~1600 строк) |

---

## Ветки и деплой (Vercel)

| Vercel-проект | Git-ветка | Назначение |
|---------------|-----------|------------|
| **siddur** | `version-2.0` | **Основная** — production и активная разработка |
| **siddur-beta** | `version-2.1` | Beta / эксперименты (TTS Android, новые фичи) |

| Ветка | Статус |
|-------|--------|
| `main` | Главная ветка на GitHub (legacy) |
| `version-1.0` | Старая стабильная v1 |
| **`version-2.0`** | **Основная рабочая ветка** — prod + новые задачи |
| `version-2.1` | Beta: TTS, подсветка слов, Amida (cherry-pick в 2.0 по необходимости) |

**Важно:** вкладка Changes в Cursor может показывать diff **ветки vs main**, а не uncommitted changes.

Триггер деплоя: push в соответствующую ветку (или empty commit `chore: trigger deploy`).

---

## Локальная разработка

```powershell
cd C:\dev\shacharis-pwa\shacharis-pwa
npm install
npm run dev
```

- Браузер: **http://localhost:5173/**
- На телефоне в той же Wi‑Fi: **http://<IP-компьютера>:5173/** (Vite настроен с `host: true`)
- `localhost` на телефоне **не работает** — это сам телефон, не ПК

Если изменения не видны:
1. `Ctrl+Shift+R` (hard reload)
2. DevTools → Application → Unregister Service Worker

Сборка: `npm run build` → выход в `dist/`

---

## Структура файлов

| Файл | Назначение |
|------|------------|
| `src/App.tsx` | Все данные молитв, UI, навигация, TTS, подсветка слов |
| `src/components/SplashScreen.tsx` | Анимированный splash (2 с + 0.6 с fade) |
| `src/main.tsx` | Точка входа React |
| `src/index.css` | Tailwind + шрифты (he-serif, ui-sans) |
| `index.html` | Static splash для браузера, PWA meta, teal `#0D9488` |
| `vite.config.js` | PWA manifest, Workbox, dev server `host: true` |
| `tailwind.config.js` | Конфиг Tailwind |
| `public/icon-192.png`, `icon-512.png` | Иконки PWA |

---

## Данные молитв

### Счётчик

```typescript
const TOTAL_PRAYERS = prayers[prayers.length - 1].id; // сейчас 52
```

В массиве **52 карточки**, id от **1 до 52** (без пропусков).

### Базовая схема `Prayer`

```typescript
type Prayer = {
  id: number;
  titleEn: string;
  titleHe: string;
  he_display: string;  // текст на экране (может содержать инструкции, /, ○)
  he_tts: string;      // текст для TTS (без инструкций, плоский)
  translit: string;
  ru: string;
  nl: string;
  en: string;
  fr: string;
};
```

### Опциональные поля (есть в данных, не в type)

| Поле | Пример | Смысл |
|------|--------|-------|
| `include_in_home: true` | карточки 41–52 | Метаданные (пока список показывает все `prayers`) |
| `no_interruption: true` | 43 | Не перебивать (Amida) |
| `said_softly: true` | 43 | Тихая молитва |
| `replaces: "4-16"` | 47 (Havinenu) | Заменяет другие брахот |
| `version: "reform_inclusive"` | 51 | Reform-версия |
| `skip_traditional_version_I: true` | 51 | Пропуск традиционной Aleinu I |

### `he_display` vs `he_tts`

- **`he_display`** — что видит пользователь: переносы строк, `[инструкции на EN/NL]`, варианты через `/`, маркеры `○`.
- **`he_tts`** — что читает TTS: без `[скобок]`, без переносов внутри предложений, иногда больше текста (сезонные вставки для озвучки).

**Имя Божие на экране:** `יְיָ` и варианты.  
**В TTS:** заменяется на `אֲדֹנָי` через `prepareTtsText()` перед speak.

### Редакционные особенности

- Reform/inclusive благословения (утренние 13–16, Aleinu II).
- Amida: полные карточки 43–46 с инструкциями (дубликаты удалены).
- Сезонные вставки в переводах в `[скобках]`; в `he_display` — краткие подсказки, в `he_tts` — полный текст для чтения.

---

## UI и навигация

### Главный экран
- Список всех 52 молитв (id + titleEn + titleHe).
- Футер: *Text displayed with niqqud. Tap a Hebrew word to hear it. Audio uses he-IL voice at 0.50x. Version 2.1, 2026*

### Экран молитвы
- Счётчик `id / TOTAL_PRAYERS`
- HebrewDisplay (RTL) + переключатель транслитерации
- Переключатель языка перевода: RU / NL / EN / FR (сохраняется в `localStorage` ключ `shacharis_lang`)
- Previous / Next
- Fixed footer: Play/Pause, progress bar, таймер

### Свайпы (на экране молитвы)
| Жест | Действие |
|------|----------|
| От правого края (48 px) влево ≥ 60 px | Следующая молитва |
| От левого края вправо ≥ 60 px | Предыдущая / на первой → список |

---

## TTS и подсветка слов

### Общие параметры
- Язык: `he-IL`
- Скорость: **0.50** (`SPEECH_RATE`)
- Голос: первый доступный с `lang` содержащим `he`

### Tap-to-speak
Каждое ивритское слово — кликабельный `<span>`. Тап → `speakWord()` произносит одно слово.

### Подсветка при Play

**iPhone / Desktop (Chrome, Safari):**
- Один длинный `SpeechSynthesisUtterance` на всю молитву.
- Подсветка через `utter.onboundary` (`name === 'word'`) — **точная синхронизация**.
- Fallback-таймер до первого boundary.

**Android Chrome:**
- Web Speech API **не даёт надёжных word-boundary** на длинных текстах.
- **Алгоритм:** текст делится на **предложения** (до `.` `!` `?`), каждое — отдельный utterance (естественная интонация).
- В начале каждого предложения — точная подсветка (`onstart`).
- Внутри предложения — короткий таймер + `onboundary` если приходит.
- **Автокалибровка** внутри одного Play: после каждого предложения сравнивается реальная длительность с оценкой, коэффициент подстраивается для следующих предложений. Сбрасывается при новом Play.

### Ключевые функции (App.tsx)

| Функция | Роль |
|---------|------|
| `buildHebrewWordLayout()` | Связка he_display ↔ he_tts по словам |
| `alignSpeakableWords()` | Выравнивание display-слов с TTS-индексами |
| `HebrewDisplay` | Рендер слов, подсветка, клики |
| `splitTtsIntoSentences()` | Разбивка для Android |
| `updateDurationScale()` | Автокалибровка Android |
| `prepareTtsText()` | Замена Divine Name для TTS |

### Известные ограничения TTS

- Android: подсветка **не идеальна** — зависит от нагрузки CPU, длины предложения, движка TTS.
- Пословное чтение (отдельный utterance на слово) — точное, но **некрасивое** (отвергнуто).
- Идеальная синхронизация на Android потребует облачного TTS с таймкодами или pre-recorded audio.

---

## Splash screen

1. **Static HTML** (`index.html`) — только в браузере, скрыт в installed PWA (`display-mode: standalone`).
2. **React SplashScreen** — 2 с видим, 0.6 с fade, удаляет static splash.

Цвет: `#0D9488` (teal). Логотип: ש + SHAHARIS.

---

## PWA

- Manifest name: **Siddur** (short: Siddur)
- `index.html` title: **Shacharis**
- Display: standalone, portrait
- `registerType: autoUpdate` — SW обновляется автоматически
- Workbox: precache JS/CSS/HTML/icons, runtime cache для Google Fonts

---

## Git: типичные операции

```powershell
# Текущая beta-ветка
git checkout version-2.1

# Коммит (только по запросу)
git add .
git commit -m "описание"
git push origin version-2.1

# Cherry-pick фикса на production
git checkout version-2.0
git cherry-pick <commit-hash>
git push origin version-2.0
```

---

## История изменений (кратко)

| Дата | Что |
|------|-----|
| 2026-08-04 | Splash, swipe, TTS 0.50, молитвы 1–22, HebrewDisplay |
| 2026-08-14 | Ветки 2.0/2.1, Vercel prod/beta, молитвы до 52, Amida |
| 2026-08-14 | Tap-to-speak, подсветка слов (onboundary) |
| 2026-08-14 | Удалены дубликаты карточек Amida 43–46 |
| 2026-08-14 | Android: предложения + автокалибровка подсветки |
| 2026-08-14 | Футер Version 2.1, 2026; vite host для теста с телефона |
| 2026-08-30 | PROJECT.md, AGENT_TASKS.md, AGENTS.md, cursor rule agent-workflow |
| 2026-08-30 | version-2.0 — основная ветка; agent docs на production |

---

## TODO / идеи на будущее

- [ ] iOS startup images (убрать белую вспышку при запуске PWA)
- [ ] Добавить оставшиеся молитвы Шахарита после #52
- [ ] Использовать `include_in_home` для фильтрации списка
- [ ] Вынести `prayers[]` в отдельный JSON/TS файл
- [ ] Облачный TTS с word timestamps (идеальная Android-синхронизация)
- [ ] Согласовать naming: Siddur vs Shacharis в manifest

---

## Шаблон для нового чата в Cursor

```
Проект: Siddur / Shacharis PWA
1. Прочитай PROJECT.md
2. Прочитай AGENT_TASKS.md
3. Смотри AGENTS.md и .cursor/rules/agent-workflow.mdc

Ветка: version-2.0 (основная) · version-2.1 (beta, cherry-pick при необходимости)
Путь: C:\dev\shacharis-pwa\shacharis-pwa

Задача: [описание]
```

---

## Файлы для агентов

| Файл | Назначение |
|------|------------|
| `PROJECT.md` | База знаний (этот файл) |
| `AGENT_TASKS.md` | Стек задач, Active/Queue, журнал выполненного |
| `AGENTS.md` | Точка входа для AI-агентов |
| `.cursor/rules/agent-workflow.mdc` | Правило Cursor: always apply |

**Workflow:** перед задачей — читать базу + стек; после задачи — записать в Completed log в `AGENT_TASKS.md`.

---

## Контакты / автор

GitHub: **maydanikas/siddur**
