#!/usr/bin/env node
/**
 * Scrapes https://oldschool.runescape.wiki/w/Item_set to build the canonical
 * list of item set IDs, resolved via the prices mapping API.
 *
 * Writes the result to src/data/item-set-ids.json.
 *
 * Usage:
 *   node scripts/generate-item-set-ids.js
 *   # or via package.json:
 *   npm run generate:item-set-ids
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = resolve(__dirname, '../src/data/item-set-ids.json');

const WIKI_API =
  'https://oldschool.runescape.wiki/api.php' +
  '?action=parse&page=Item_set&prop=text&format=json&disablelimitreport=1';
const MAPPING_URL = 'https://prices.runescape.wiki/api/v1/osrs/mapping';
const HEADERS = { 'User-Agent': 'flipperino-item-set-ids-scraper/1.0' };

console.log('Fetching Item_set page and prices mapping in parallel…');

const [wikiRes, mappingRes] = await Promise.all([
  fetch(WIKI_API, { headers: HEADERS }),
  fetch(MAPPING_URL, { headers: HEADERS }),
]);

if (!wikiRes.ok) throw new Error(`Wiki fetch failed: HTTP ${wikiRes.status}`);
if (!mappingRes.ok) throw new Error(`Mapping fetch failed: HTTP ${mappingRes.status}`);

const [wikiJson, mapping] = await Promise.all([wikiRes.json(), mappingRes.json()]);

const html = wikiJson?.parse?.text?.['*'];
if (!html) throw new Error('Unexpected API response shape');

const nameToId = new Map(mapping.map((item) => [item.name.toLowerCase(), item.id]));
console.log(`Mapping loaded: ${nameToId.size} items`);

function decodeHtmlEntities(str) {
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

// Each set row has a cell with class="plinkt-link" containing an <a title="Set name">
const linkRe = /class="plinkt-link"[\s\S]*?<a\s[^>]*title="([^"]+)"/g;

const ids = [];
const unresolved = [];
const seen = new Set();

let match;
while ((match = linkRe.exec(html)) !== null) {
  const name = decodeHtmlEntities(match[1]);
  if (seen.has(name)) continue;
  seen.add(name);

  const id = nameToId.get(name.toLowerCase());
  if (id !== undefined) {
    ids.push(id);
  } else {
    unresolved.push(name);
  }
}

if (unresolved.length) {
  console.warn(`\nUnresolved set names (not in mapping):\n  ${unresolved.join('\n  ')}`);
}

ids.sort((a, b) => a - b);

writeFileSync(OUT_FILE, JSON.stringify(ids, null, 2) + '\n', 'utf8');
console.log(`\nExtracted ${ids.length} set IDs (${unresolved.length} unresolved)`);
console.log(`Written to ${OUT_FILE}`);
