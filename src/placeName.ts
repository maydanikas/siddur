import type { Place } from './shabbatTimes';
import type { Lang } from './supportCopy';

/**
 * The town or city a pair of coordinates belongs to.
 * BigDataCloud answers from the browser and allows that call.
 * The name is then remembered on the phone.
 */
const GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

const SETTLEMENT =
  /насел[её]н|город|столиц|cтолиц|деревн|село|пос[её]л|village|\bcity\b|\btown\b|capital|localit|\bdorp\b|\bstad\b|hoofdstad|\bville\b|capitale/i;

const DIVISION =
  /район|округ|квартал|district|quarter|arrondissement|borough|municip|муницип|общин|gemeente|province|провинц|provincie|commune|\bregion\b|регион|quartier|\bwijk\b/i;

type AdminPlace = {
  name?: unknown;
  description?: unknown;
};

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanCity(value: unknown): string {
  return text(value).replace(/^gemeente\s+/i, '');
}

/** A readable place name from a reverse-geocode payload. */
export function placeNameFromGeocode(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const record = data as {
    locality?: unknown;
    city?: unknown;
    localityInfo?: { administrative?: unknown };
  };
  const admin = record.localityInfo?.administrative;
  if (Array.isArray(admin)) {
    for (let index = admin.length - 1; index >= 0; index -= 1) {
      const item = admin[index] as AdminPlace;
      const name = text(item?.name);
      const description = text(item?.description);
      if (!name || !description) continue;
      const settlement = SETTLEMENT.test(description);
      const division = DIVISION.test(description) || DIVISION.test(name);
      if (settlement && (!division || !DIVISION.test(name))) return name;
    }
  }
  return fallbackName(record.locality, record.city);
}

function fallbackName(locality: unknown, city: unknown): string | null {
  const loc = text(locality);
  const cit = cleanCity(city);
  if (!loc && !cit) return null;
  if (!cit) return loc;
  if (!loc || loc.toLowerCase() === cit.toLowerCase()) return loc || cit;
  if (loc.toLowerCase().includes(cit.toLowerCase())) return cit;
  if (DIVISION.test(loc) && !DIVISION.test(cit)) return cit;
  return loc;
}

/** About two kilometres, close enough to keep the same town name. */
export function sameTown(a: Place, b: Place): boolean {
  return Math.abs(a.latitude - b.latitude) < 0.02 && Math.abs(a.longitude - b.longitude) < 0.02;
}

export async function lookupPlaceName(place: Place, lang: Lang, fetchImpl: typeof fetch = fetch): Promise<string | null> {
  const url = `${GEOCODE_URL}?latitude=${encodeURIComponent(String(place.latitude))}&longitude=${encodeURIComponent(String(place.longitude))}&localityLanguage=${lang}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetchImpl(url, { signal: controller.signal });
    if (!response.ok) return null;
    return placeNameFromGeocode(await response.json());
  } finally {
    clearTimeout(timer);
  }
}
