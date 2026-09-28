import type { Property, PropertyType } from '../data/properties';
import type { SearchIntent } from '../store/useAppStore';

export type ParsedChip = {
  key: string;
  label: string;
};

export type ParsedIntent = {
  intent?: SearchIntent;
  type?: PropertyType;
  bedrooms?: number;
  maxInstallment?: number;
  maxPrice?: number;
  location?: string;
  chips: ParsedChip[];
};

const TYPE_WORDS: { pattern: RegExp; type: PropertyType; label: string }[] = [
  { pattern: /\brumah\b/i, type: 'house', label: 'Rumah' },
  { pattern: /\bapartemen\b|\bapt\b/i, type: 'apartment', label: 'Apartemen' },
  { pattern: /\bvilla\b/i, type: 'villa', label: 'Villa' },
  { pattern: /\bkost\b|\bkos\b/i, type: 'kost', label: 'Kost' },
  { pattern: /\btanah\b/i, type: 'land', label: 'Tanah' },
  { pattern: /\bruko\b/i, type: 'ruko', label: 'Ruko' },
  { pattern: /\bkantor\b/i, type: 'office', label: 'Kantor' },
];

/** Parses free-text intent search into editable filter chips (PRD §8.1 "editable extracted filter chips"). */
export function parseIntentQuery(raw: string): ParsedIntent {
  const text = raw.trim();
  const chips: ParsedChip[] = [];
  const result: ParsedIntent = { chips };

  if (/\bsewa\b|\bkontrak\b/i.test(text)) {
    result.intent = 'rent';
    chips.push({ key: 'intent', label: 'Sewa' });
  } else if (/\bbeli\b|\bjual\b/i.test(text)) {
    result.intent = 'buy';
    chips.push({ key: 'intent', label: 'Beli' });
  }

  for (const t of TYPE_WORDS) {
    if (t.pattern.test(text)) {
      result.type = t.type;
      chips.push({ key: 'type', label: t.label });
      break;
    }
  }

  const bedroomMatch = text.match(/(\d+)\s*(kamar|kt|br)\b/i);
  if (bedroomMatch) {
    result.bedrooms = Number(bedroomMatch[1]);
    chips.push({ key: 'bedrooms', label: `${result.bedrooms}+ kamar tidur` });
  }

  const installmentMatch = text.match(/cicilan\s*(?:maks(?:imal)?\s*)?(\d+(?:[.,]\d+)?)\s*(jt|juta|m|miliar)?/i);
  if (installmentMatch) {
    const value = parseFloat(installmentMatch[1].replace(',', '.'));
    const unit = (installmentMatch[2] || 'juta').toLowerCase();
    const multiplier = unit.startsWith('m') ? 1_000_000_000 : 1_000_000;
    result.maxInstallment = Math.round(value * multiplier);
    chips.push({ key: 'maxInstallment', label: `Cicilan maks Rp ${value} ${unit.startsWith('m') ? 'M' : 'jt'}` });
  }

  const priceMatch = !installmentMatch && text.match(/(?:harga\s*(?:maks(?:imal)?\s*)?|budget\s*)(\d+(?:[.,]\d+)?)\s*(jt|juta|m|miliar)/i);
  if (priceMatch) {
    const value = parseFloat(priceMatch[1].replace(',', '.'));
    const unit = priceMatch[2].toLowerCase();
    const multiplier = unit.startsWith('m') ? 1_000_000_000 : 1_000_000;
    result.maxPrice = Math.round(value * multiplier);
    chips.push({ key: 'maxPrice', label: `Harga maks Rp ${value} ${unit.startsWith('m') ? 'M' : 'jt'}` });
  }

  const nearMatch = text.match(/dekat\s+([a-z0-9\s]+?)(?:\s+cicilan|\s+harga|$)/i);
  if (nearMatch) {
    result.location = nearMatch[1].trim();
    chips.push({ key: 'location', label: `Dekat ${result.location}` });
  }

  return result;
}

export type EntitySuggestion = { label: string; kind: 'area' | 'city' };

/**
 * Local area/city suggestions for the search box (part of PRD's "entity
 * suggestions"), built from the actual catalogue rather than a geocoding
 * API this app has no key for. Limited to area/city because those are the
 * only entity types the plain-text search filter (title/area/city
 * substring match) actually matches — suggesting a project or developer
 * name here would just produce a dead-end zero-result search.
 */
export function getEntitySuggestions(query: string, properties: Property[]): EntitySuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const seen = new Set<string>();
  const suggestions: EntitySuggestion[] = [];
  const add = (label: string, kind: EntitySuggestion['kind']) => {
    const key = `${kind}:${label.toLowerCase()}`;
    if (seen.has(key) || !label.toLowerCase().includes(q)) return;
    seen.add(key);
    suggestions.push({ label, kind });
  };

  for (const p of properties) {
    add(p.area, 'area');
    add(p.city, 'city');
  }

  return suggestions.slice(0, 6);
}
