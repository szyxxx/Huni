const img = (seed: string) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=1200&q=80`;

export type UnitType = {
  id: string;
  name: string;
  cluster?: string;
  buildingArea: number;
  bedrooms: number;
  bathrooms: number;
  priceFrom: number;
  available: number;
};

export type DevelopmentProject = {
  id: string;
  name: string;
  developer: string;
  developerVerified: boolean;
  city: string;
  area: string;
  images: string[];
  progressPercent: number;
  progressLabel: string;
  facilities: string[];
  promo?: string;
  units: UnitType[];
  nearby: { label: string; minutes: number }[];
  lat: number;
  lng: number;
};

export const projects: DevelopmentProject[] = [
  {
    id: 'pr1',
    name: 'Greenhaven Residence',
    developer: 'Sinar Mas Land',
    developerVerified: true,
    city: 'Tangerang Selatan',
    area: 'BSD City',
    images: [img('photo-1580587771525-78b9dba3b914'), img('photo-1568605114967-8130f3a36994')],
    progressPercent: 65,
    progressLabel: 'Struktur lantai 3 dari 5 selesai',
    facilities: ['Clubhouse', 'Kolam renang', 'Taman bermain', 'Keamanan 24 jam'],
    promo: 'DP 0% untuk 50 unit pertama',
    units: [
      { id: 'u1', name: 'Tipe Aster', cluster: 'Cluster Anggrek', buildingArea: 80, bedrooms: 2, bathrooms: 2, priceFrom: 1_450_000_000, available: 12 },
      { id: 'u2', name: 'Tipe Camelia', cluster: 'Cluster Anggrek', buildingArea: 100, bedrooms: 3, bathrooms: 2, priceFrom: 1_850_000_000, available: 6 },
      { id: 'u3', name: 'Tipe Dahlia', cluster: 'Cluster Melati', buildingArea: 130, bedrooms: 4, bathrooms: 3, priceFrom: 2_400_000_000, available: 3 },
    ],
    nearby: [
      { label: 'Gerbang tol', minutes: 5 },
      { label: 'Sekolah internasional', minutes: 8 },
    ],
    lat: -6.3021,
    lng: 106.6528,
  },
  {
    id: 'pr2',
    name: 'Ubud Hillside Villas',
    developer: 'Ubud Estates',
    developerVerified: true,
    city: 'Gianyar',
    area: 'Ubud',
    images: [img('photo-1571003123894-1f0594d2b5d9'), img('photo-1602343168117-bb8ffe3e2e9f')],
    progressPercent: 100,
    progressLabel: 'Siap huni',
    facilities: ['Kolam renang privat per unit', 'Taman tropis', 'Keamanan 24 jam'],
    units: [
      { id: 'u1', name: 'Villa 3BR', buildingArea: 220, bedrooms: 3, bathrooms: 3, priceFrom: 4_200_000_000, available: 4 },
      { id: 'u2', name: 'Villa 4BR', buildingArea: 280, bedrooms: 4, bathrooms: 4, priceFrom: 4_800_000_000, available: 2 },
    ],
    nearby: [{ label: 'Pusat Ubud', minutes: 10 }],
    lat: -8.5069,
    lng: 115.2625,
  },
];

export const getProjectById = (id: string) => projects.find((p) => p.id === id);
