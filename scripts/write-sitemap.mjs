import { readFileSync, writeFileSync } from 'node:fs';

const RESERVED = new Set(['about']);

function prayerSlug(titleEn) {
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

const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const titles = [...source.matchAll(/titleEn:\s*"([^"]+)"/g)].map((match) => match[1]);
if (titles.length < 50) {
  throw new Error(`Expected the prayer list, found ${titles.length} titles`);
}

const used = new Set();
const paths = ['/', '/about'];
titles.forEach((title, index) => {
  let slug = prayerSlug(title);
  if (RESERVED.has(slug) || used.has(slug)) slug = `${slug}-${index + 1}`;
  used.add(slug);
  paths.push(`/${slug}`);
});

const body = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...paths.map((path) => `  <url><loc>https://shacharis.app${path === '/' ? '/' : path}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

writeFileSync(new URL('../public/sitemap.xml', import.meta.url), body);
console.log(`Wrote ${paths.length} sitemap urls`);
