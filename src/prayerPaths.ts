const RESERVED_SLUGS = new Set(['about']);

export const HOME_TITLE = 'Shacharis — liberal siddur';

export const HOME_DESCRIPTION =
  'A liberal siddur for Shaharit at home, for liberal, Reform, and Conservative communities.';

export function prayerSlug(titleEn: string): string {
  const slug = titleEn
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'prayer';
}

export function uniquePrayerSlug(titleEn: string, id: number, used: Set<string>): string {
  let slug = prayerSlug(titleEn);
  if (RESERVED_SLUGS.has(slug) || used.has(slug)) slug = `${slug}-${id}`;
  used.add(slug);
  return slug;
}

export function prayerSeoDescription(titleEn: string, ru: string): string {
  const flat = ru.replace(/\s+/g, ' ').trim();
  const short = flat.length > 110 ? `${flat.slice(0, 107).trimEnd()}…` : flat;
  return `${titleEn}. ${short}`;
}
