import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { properties as mockProperties, getPropertyById as getMockPropertyById, type Property } from './properties';
import { projects as mockProjects, getProjectById as getMockProjectById, type DevelopmentProject } from './projects';

type PropertyRow = {
  id: string;
  title: string;
  intent: 'buy' | 'rent';
  type: Property['type'];
  price: number;
  price_unit: Property['priceUnit'];
  estimated_installment: number | null;
  previous_price: number | null;
  area: string;
  city: string;
  bedrooms: number | null;
  bathrooms: number | null;
  land_area: number | null;
  building_area: number | null;
  images: string[];
  furnished: boolean | null;
  video_url: string | null;
  promotion: Property['promotion'];
  facilities: string[];
  description: string;
  lat: number | null;
  lng: number | null;
  last_confirmed_at: string;
  advertisers: { name: string; is_agency: boolean; verification: Property['verification'] } | null;
  property_nearby_places: { label: string; minutes: number }[] | null;
};

function mapPropertyRow(row: PropertyRow): Property {
  return {
    id: row.id,
    title: row.title,
    intent: row.intent,
    type: row.type,
    price: row.price,
    priceUnit: row.price_unit,
    estimatedInstallment: row.estimated_installment ?? undefined,
    previousPrice: row.previous_price ?? undefined,
    area: row.area,
    city: row.city,
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    landArea: row.land_area ?? undefined,
    buildingArea: row.building_area ?? undefined,
    furnished: row.furnished ?? undefined,
    videoUrl: row.video_url ?? undefined,
    images: row.images,
    verification: row.advertisers?.verification ?? 'unverified',
    promotion: row.promotion,
    advertiser: { name: row.advertisers?.name ?? 'Tidak diketahui', isAgency: row.advertisers?.is_agency ?? false },
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
    facilities: row.facilities,
    description: row.description,
    lastConfirmed: row.last_confirmed_at,
    nearby: row.property_nearby_places ?? undefined,
  };
}

const PROPERTY_SELECT = `
  id, title, intent, type, price, price_unit, estimated_installment, previous_price,
  area, city, bedrooms, bathrooms, land_area, building_area, images, furnished, video_url, promotion,
  facilities, description, lat, lng, last_confirmed_at,
  advertisers ( name, is_agency, verification ),
  property_nearby_places ( label, minutes )
`;

/** Live listings when Supabase is configured, otherwise the bundled mock catalogue. */
export async function fetchProperties(): Promise<Property[]> {
  if (!isSupabaseConfigured || !supabase) return mockProperties;
  const { data, error } = await supabase
    .from('properties')
    .select(PROPERTY_SELECT)
    .eq('status', 'active')
    .order('last_confirmed_at', { ascending: false });
  if (error || !data) return mockProperties;
  return (data as unknown as PropertyRow[]).map(mapPropertyRow);
}

export async function fetchPropertyById(id: string): Promise<Property | undefined> {
  if (!isSupabaseConfigured || !supabase) return getMockPropertyById(id);
  const { data, error } = await supabase.from('properties').select(PROPERTY_SELECT).eq('id', id).maybeSingle();
  if (error || !data) return getMockPropertyById(id);
  return mapPropertyRow(data as unknown as PropertyRow);
}

type ProjectRow = {
  id: string;
  name: string;
  city: string;
  area: string;
  images: string[];
  progress_percent: number;
  progress_label: string;
  facilities: string[];
  promo: string | null;
  lat: number | null;
  lng: number | null;
  advertisers: { name: string; verification: string } | null;
  project_units: { id: string; name: string; cluster: string | null; building_area: number; bedrooms: number; bathrooms: number; price_from: number; available: number }[];
  project_nearby_places: { label: string; minutes: number }[];
};

function mapProjectRow(row: ProjectRow): DevelopmentProject {
  return {
    id: row.id,
    name: row.name,
    developer: row.advertisers?.name ?? 'Developer tidak diketahui',
    developerVerified: row.advertisers?.verification === 'official_developer',
    city: row.city,
    area: row.area,
    images: row.images,
    progressPercent: row.progress_percent,
    progressLabel: row.progress_label,
    facilities: row.facilities,
    promo: row.promo ?? undefined,
    units: row.project_units.map((u) => ({
      id: u.id,
      name: u.name,
      cluster: u.cluster ?? undefined,
      buildingArea: u.building_area,
      bedrooms: u.bedrooms,
      bathrooms: u.bathrooms,
      priceFrom: u.price_from,
      available: u.available,
    })),
    nearby: row.project_nearby_places,
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
  };
}

const PROJECT_SELECT = `
  id, name, city, area, images, progress_percent, progress_label, facilities, promo, lat, lng,
  advertisers ( name, verification ),
  project_units ( id, name, cluster, building_area, bedrooms, bathrooms, price_from, available ),
  project_nearby_places ( label, minutes )
`;

export async function fetchProjects(): Promise<DevelopmentProject[]> {
  if (!isSupabaseConfigured || !supabase) return mockProjects;
  const { data, error } = await supabase.from('projects').select(PROJECT_SELECT);
  if (error || !data) return mockProjects;
  return (data as unknown as ProjectRow[]).map(mapProjectRow);
}

export async function fetchProjectById(id: string): Promise<DevelopmentProject | undefined> {
  if (!isSupabaseConfigured || !supabase) return getMockProjectById(id);
  const { data, error } = await supabase.from('projects').select(PROJECT_SELECT).eq('id', id).maybeSingle();
  if (error || !data) return getMockProjectById(id);
  return mapProjectRow(data as unknown as ProjectRow);
}
