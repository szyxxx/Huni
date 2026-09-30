export type PlaceCategory = 'park' | 'minimarket' | 'mall' | 'food' | 'school';

export type NearbyPlace = {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
};

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const CATEGORY_QUERIES: { category: PlaceCategory; filter: string }[] = [
  { category: 'park', filter: 'leisure=park' },
  { category: 'minimarket', filter: 'shop~"^(convenience|supermarket)$"' },
  { category: 'mall', filter: 'shop=mall' },
  { category: 'food', filter: 'amenity~"^(restaurant|cafe|fast_food)$"' },
  { category: 'school', filter: 'amenity~"^(school|university|college)$"' },
];

// Module-level cache keyed by a coarse cell (rounded coordinates) so
// panning slightly within the same neighborhood doesn't refetch, and
// so Overpass' shared public server (no key, rate-limited) isn't hit
// harder than necessary.
const cache = new Map<string, NearbyPlace[]>();

function cellKey(lat: number, lng: number, radiusMeters: number) {
  const precision = radiusMeters > 5000 ? 1 : 2;
  return `${lat.toFixed(precision)},${lng.toFixed(precision)},${radiusMeters}`;
}

/**
 * Nearby public places (parks, minimarkets, malls, food, schools) from
 * OpenStreetMap via the Overpass API — free, no key, matches the
 * OpenFreeMap basemap already used for the map tiles themselves.
 * Best-effort: returns [] on any failure rather than throwing, since a
 * POI layer is a nice-to-have overlay, never something that should
 * block the map itself from rendering.
 */
export async function fetchNearbyPlaces(lat: number, lng: number, radiusMeters = 10_000): Promise<NearbyPlace[]> {
  const key = cellKey(lat, lng, radiusMeters);
  const cached = cache.get(key);
  if (cached) return cached;

  const clauses = CATEGORY_QUERIES.map(
    ({ filter }) => `node[${filter}](around:${radiusMeters},${lat},${lng});`
  ).join('\n');
  const query = `[out:json][timeout:15];(${clauses});out center 200;`;

  try {
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!response.ok) return [];
    const json = await response.json();
    const elements = Array.isArray(json.elements) ? json.elements : [];
    const places: NearbyPlace[] = elements
      .map((el: any): NearbyPlace | null => {
        const tags = el.tags ?? {};
        const category = categorize(tags);
        if (!category || !el.lat || !el.lon) return null;
        return {
          id: `${el.type}/${el.id}`,
          name: tags.name || defaultNameFor(category),
          category,
          lat: el.lat,
          lng: el.lon,
        };
      })
      .filter(Boolean) as NearbyPlace[];

    cache.set(key, places);
    return places;
  } catch {
    return [];
  }
}

function categorize(tags: Record<string, string>): PlaceCategory | null {
  if (tags.leisure === 'park') return 'park';
  if (tags.shop === 'mall') return 'mall';
  if (tags.shop === 'convenience' || tags.shop === 'supermarket') return 'minimarket';
  if (['restaurant', 'cafe', 'fast_food'].includes(tags.amenity)) return 'food';
  if (['school', 'university', 'college'].includes(tags.amenity)) return 'school';
  return null;
}

function defaultNameFor(category: PlaceCategory): string {
  switch (category) {
    case 'park': return 'Taman';
    case 'minimarket': return 'Minimarket';
    case 'mall': return 'Mall';
    case 'food': return 'Tempat makan';
    case 'school': return 'Sekolah';
  }
}

export const PLACE_CATEGORY_ICON: Record<PlaceCategory, string> = {
  park: 'sunrise',
  minimarket: 'shopping-cart',
  mall: 'shopping-bag',
  food: 'coffee',
  school: 'book-open',
};

export const PLACE_CATEGORY_LABEL: Record<PlaceCategory, string> = {
  park: 'Taman',
  minimarket: 'Minimarket',
  mall: 'Mall',
  food: 'Tempat makan',
  school: 'Sekolah',
};
