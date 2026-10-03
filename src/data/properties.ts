export type PropertyIntent = 'buy' | 'rent';
export type PropertyType = 'house' | 'apartment' | 'villa' | 'kost' | 'land' | 'ruko' | 'office';
export type VerificationTier = 'unverified' | 'verified_owner' | 'verified_agent' | 'verified_agency' | 'official_developer';
export type PromotionTier = 'normal' | 'featured' | 'premium' | 'sponsored';

export type Property = {
  id: string;
  title: string;
  intent: PropertyIntent;
  type: PropertyType;
  price: number;
  priceUnit: 'total' | 'month' | 'year';
  estimatedInstallment?: number;
  area: string;
  city: string;
  bedrooms?: number;
  bathrooms?: number;
  landArea?: number;
  buildingArea?: number;
  furnished?: boolean;
  videoUrl?: string;
  virtualTourUrl?: string;
  virtualTourKind?: 'model3d' | 'panorama';
  images: string[];
  verification: VerificationTier;
  promotion: PromotionTier;
  fitReason?: string;
  advertiser: { name: string; isAgency: boolean; contactPhone?: string; connected?: boolean };
  lat: number;
  lng: number;
  facilities: string[];
  description: string;
  lastConfirmed: string;
  previousPrice?: number;
  nearby?: { label: string; minutes: number }[];
};

const img = (seed: string) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=80`;

export const properties: Property[] = [
  {
    id: 'p1',
    title: 'Rumah Minimalis 2 Lantai di Dago Atas',
    intent: 'buy',
    type: 'house',
    price: 2_450_000_000,
    priceUnit: 'total',
    estimatedInstallment: 14_200_000,
    area: 'Dago Atas',
    city: 'Bandung',
    bedrooms: 3,
    bathrooms: 2,
    landArea: 120,
    buildingArea: 150,
    images: [img('photo-1600585154340-be6161a56a0c'), img('photo-1600596542815-ffad4c1539a9')],
    verification: 'verified_agent',
    promotion: 'featured',
    fitReason: 'Sesuai anggaran cicilan bulanan kamu',
    advertiser: { name: 'Sinta Property', isAgency: true },
    lat: -6.8619,
    lng: 107.6186,
    facilities: ['Carport', 'Taman', 'Keamanan 24 jam'],
    description: 'Hunian nyaman dengan sirkulasi udara baik, dekat kampus dan pusat kuliner Dago.',
    lastConfirmed: '2026-09-24',
    previousPrice: 2_600_000_000,
    nearby: [
      { label: 'Kantor tersimpan', minutes: 18 },
      { label: 'Sekolah tersimpan', minutes: 9 },
    ],
  },
  {
    id: 'p2',
    title: 'Apartemen Studio Furnished Sudirman',
    intent: 'rent',
    type: 'apartment',
    price: 5_500_000,
    priceUnit: 'month',
    area: 'Sudirman',
    city: 'Jakarta Selatan',
    bedrooms: 1,
    bathrooms: 1,
    buildingArea: 28,
    furnished: true,
    videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    images: [img('photo-1522708323590-d24dbb6b0267'), img('photo-1502672260266-1c1ef2d93688')],
    verification: 'verified_agency',
    promotion: 'sponsored',
    fitReason: '12 menit dari kantor favoritmu',
    advertiser: { name: 'Metro Living', isAgency: true },
    lat: -6.2088,
    lng: 106.8228,
    facilities: ['Gym', 'Kolam renang', 'Laundry'],
    description: 'Unit siap huni dengan pemandangan kota, akses mudah ke MRT Sudirman.',
    lastConfirmed: '2026-09-26',
    nearby: [{ label: 'Kantor tersimpan', minutes: 12 }],
  },
  {
    id: 'p3',
    title: 'Villa Tropis Ubud dengan Kolam Privat',
    intent: 'buy',
    type: 'villa',
    price: 4_800_000_000,
    priceUnit: 'total',
    estimatedInstallment: 27_800_000,
    area: 'Ubud',
    city: 'Gianyar',
    bedrooms: 4,
    bathrooms: 4,
    landArea: 400,
    buildingArea: 280,
    // Demo-only placeholder asset (Google's public model-viewer sample GLB) to
    // exercise the viewer end to end — swap for a real advertiser-uploaded
    // scan once the seller-side upload flow exists.
    virtualTourUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    virtualTourKind: 'model3d',
    images: [img('photo-1571003123894-1f0594d2b5d9'), img('photo-1602343168117-bb8ffe3e2e9f')],
    verification: 'official_developer',
    promotion: 'premium',
    advertiser: { name: 'Ubud Estates', isAgency: true },
    lat: -8.5069,
    lng: 115.2625,
    facilities: ['Kolam renang privat', 'Taman tropis', 'Dapur outdoor'],
    description: 'Villa desain kontemporer dikelilingi sawah, cocok untuk investasi maupun hunian.',
    lastConfirmed: '2026-09-20',
  },
  {
    id: 'p4',
    title: 'Kost Eksklusif Putri Dekat ITB',
    intent: 'rent',
    type: 'kost',
    price: 2_200_000,
    priceUnit: 'month',
    area: 'Coblong',
    city: 'Bandung',
    bedrooms: 1,
    bathrooms: 1,
    buildingArea: 12,
    furnished: true,
    images: [img('photo-1560448204-e02f11c3d0e2'), img('photo-1540518614846-7eded433c457')],
    verification: 'verified_owner',
    promotion: 'normal',
    fitReason: 'Sesuai preferensi dekat kampus',
    advertiser: { name: 'Bu Ratna', isAgency: false },
    lat: -6.8915,
    lng: 107.6107,
    facilities: ['WiFi', 'AC', 'Kamar mandi dalam'],
    description: 'Kost putri dengan keamanan ketat, 5 menit jalan kaki ke Kampus ITB Ganesha.',
    lastConfirmed: '2026-09-25',
  },
  {
    id: 'p5',
    title: 'Ruko 3 Lantai Strategis Kelapa Gading',
    intent: 'buy',
    type: 'ruko',
    price: 6_200_000_000,
    priceUnit: 'total',
    estimatedInstallment: 35_600_000,
    area: 'Kelapa Gading',
    city: 'Jakarta Utara',
    landArea: 90,
    buildingArea: 270,
    images: [img('photo-1497366754035-f200968a6e72'), img('photo-1481253127861-534498168948')],
    verification: 'verified_agent',
    promotion: 'normal',
    advertiser: { name: 'Gading Commercial', isAgency: true },
    lat: -6.1588,
    lng: 106.9056,
    facilities: ['Akses jalan utama', 'Area parkir luas'],
    description: 'Cocok untuk kantor atau ritel, berada di jalur utama dengan lalu lintas tinggi.',
    lastConfirmed: '2026-09-18',
  },
  {
    id: 'p6',
    title: 'Rumah Baru Cluster Modern BSD',
    intent: 'buy',
    type: 'house',
    price: 1_850_000_000,
    priceUnit: 'total',
    estimatedInstallment: 10_700_000,
    area: 'BSD City',
    city: 'Tangerang Selatan',
    bedrooms: 3,
    bathrooms: 2,
    landArea: 90,
    buildingArea: 100,
    images: [img('photo-1580587771525-78b9dba3b914'), img('photo-1568605114967-8130f3a36994')],
    verification: 'official_developer',
    promotion: 'featured',
    fitReason: 'Dalam anggaran cicilan bulananmu',
    advertiser: { name: 'Sinar Mas Land', isAgency: true },
    lat: -6.3021,
    lng: 106.6528,
    facilities: ['Clubhouse', 'Taman bermain', 'Keamanan 24 jam'],
    description: 'Cluster baru dengan konsep hijau, dekat gerbang tol dan sekolah internasional.',
    lastConfirmed: '2026-09-27',
    previousPrice: 1_950_000_000,
    nearby: [{ label: 'Sekolah tersimpan', minutes: 6 }],
  },
];

export const getPropertyById = (id: string) => properties.find((p) => p.id === id);

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: 'Rumah',
  apartment: 'Apartemen',
  villa: 'Villa',
  kost: 'Kost',
  land: 'Tanah',
  ruko: 'Ruko',
  office: 'Kantor',
};

/**
 * Areas ranked by how many live listings they actually have, computed from
 * `list` rather than hand-typed counts. The type label only describes
 * inventory we can verify in the catalogue.
 */
export function getPopularAreas(list: Property[]) {
  const byArea = new Map<string, Property[]>();
  for (const p of list) {
    byArea.set(p.area, [...(byArea.get(p.area) ?? []), p]);
  }
  return Array.from(byArea.entries())
    .map(([name, areaProperties]) => {
      const typeCounts = new Map<PropertyType, number>();
      for (const p of areaProperties) typeCounts.set(p.type, (typeCounts.get(p.type) ?? 0) + 1);
      const dominantType = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
      return {
        id: name,
        name,
        count: areaProperties.length,
        image: areaProperties[0].images[0],
        vibe: PROPERTY_TYPE_LABELS[dominantType],
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
}
