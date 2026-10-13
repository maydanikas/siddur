import { useEffect, useState } from 'react';
import type { Place } from './shabbatTimes';

const PLACE_KEY = 'shacharis_place';

/** A saved latitude and longitude. Anything else is ignored. */
export function parsePlace(raw: string | null): Place | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as { latitude?: unknown; longitude?: unknown };
    const { latitude, longitude } = data;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return null;
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return null;
    return { latitude, longitude };
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

/**
 * The phone's coordinates, remembered on the device.
 * Asked only on a day that has candle lighting or havdalah.
 * Sunset needs a place; the timezone alone is not enough.
 */
export function useReaderPlace(needed: boolean): Place | null {
  const [place, setPlace] = useState<Place | null>(() => readCachedPlace());

  useEffect(() => {
    if (!needed) return;
    let cancelled = false;
    const ask = () => {
      if (cancelled || typeof navigator === 'undefined' || !navigator.geolocation) return;
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const next = parsePlace(JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }));
            if (!next) return;
            rememberPlace(next);
            if (!cancelled) setPlace(next);
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
  }, [needed]);

  return place;
}
