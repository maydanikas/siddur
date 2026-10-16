import { useEffect, useState } from 'react';
import { lookupPlaceName, sameTown } from './placeName.ts';
import type { Place } from './shabbatTimes';
import { isLang, type Lang } from './supportCopy.ts';

const PLACE_KEY = 'shacharis_place';

/** A saved latitude and longitude, plus the town name when we already know it. */
export function parsePlace(raw: string | null): Place | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as {
      latitude?: unknown;
      longitude?: unknown;
      name?: unknown;
      nameLang?: unknown;
    };
    const { latitude, longitude } = data;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return null;
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return null;
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const nameLang = isLang(typeof data.nameLang === 'string' ? data.nameLang : null) ? data.nameLang : undefined;
    if (!name || !nameLang) return { latitude, longitude };
    return { latitude, longitude, name, nameLang };
  } catch {
    return null;
  }
}

export function readCachedPlace(): Place | null {
  try {
    return parsePlace(localStorage.getItem(PLACE_KEY));
  } catch {
    return null;
  }
}

export function rememberPlace(place: Place): void {
  try {
    localStorage.setItem(PLACE_KEY, JSON.stringify(place));
  } catch {
    /* private mode */
  }
}

function withKnownName(coords: Place, lang: Lang): Place {
  const cached = readCachedPlace();
  if (cached?.name && cached.nameLang === lang && sameTown(cached, coords)) {
    return { ...coords, name: cached.name, nameLang: lang };
  }
  return { latitude: coords.latitude, longitude: coords.longitude };
}

/**
 * The phone's coordinates, remembered on the device.
 * Asked only on a day that has candle lighting or havdalah.
 * Sunset needs a place; the timezone alone is not enough.
 * The town name follows the reader's language.
 */
export function useReaderPlace(needed: boolean, lang: Lang): Place | null {
  const [place, setPlace] = useState<Place | null>(() => readCachedPlace());

  useEffect(() => {
    if (!needed) return;
    let cancelled = false;
    let request = 0;

    const publish = (coords: Place) => {
      const token = ++request;
      const known = withKnownName(coords, lang);
      rememberPlace(known);
      if (!cancelled) setPlace(known);
      if (known.name) return;
      lookupPlaceName(coords, lang)
        .then((name) => {
          if (!name || cancelled || token !== request) return;
          const named = { ...coords, name, nameLang: lang };
          rememberPlace(named);
          setPlace(named);
        })
        .catch(() => {
          /* the clock still shows without a town name */
        });
    };

    const ask = () => {
      if (cancelled || typeof navigator === 'undefined' || !navigator.geolocation) return;
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const next = parsePlace(JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }));
            if (next) publish(next);
          },
          () => {},
          { enableHighAccuracy: false, maximumAge: 6 * 60 * 60 * 1000, timeout: 10_000 },
        );
      } catch {
        /* geolocation unavailable */
      }
    };
    ask();
    const onVisible = () => {
      if (document.visibilityState === 'visible') ask();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', ask);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', ask);
    };
  }, [needed, lang]);

  return place;
}
