export const lightPalette = {
  canvas: '#F5F3F0',
  surface: '#FFFFFF',
  surfaceRaised: '#FCFBF9',
  surfaceSoft: '#F0EEEA',
  surfaceGlass: 'rgba(255,255,255,0.72)',
  inkPrimary: '#151515',
  inkSecondary: '#6D6A66',
  inkTertiary: '#98938D',
  border: '#E7E3DE',
  borderStrong: '#D7D1CA',
  brand: '#FF7C63',
  brandHover: '#F06F57',
  brandSoft: '#FFF0EB',
  brandInk: '#A74431',
  success: '#2E7D5A',
  warning: '#B8751A',
  danger: '#C94E48',
  scrim: 'rgba(0,0,0,0.30)',
  onBrand: '#FFFFFF',
};

export const darkPalette = {
  canvas: '#0E0E0F',
  surface: '#171718',
  surfaceRaised: '#1D1D1F',
  surfaceSoft: '#232326',
  surfaceGlass: 'rgba(28,28,30,0.70)',
  inkPrimary: '#F6F4F1',
  inkSecondary: '#B5B0AA',
  inkTertiary: '#837E78',
  border: '#303033',
  borderStrong: '#3B3B3F',
  brand: '#FF8B73',
  brandHover: '#FF9D87',
  brandSoft: '#3A211C',
  brandInk: '#FFCFC2',
  success: '#69B58B',
  warning: '#D39B4A',
  danger: '#E17870',
  scrim: 'rgba(0,0,0,0.45)',
  onBrand: '#151515',
};

export type Palette = typeof lightPalette;

/** DESIGN.md §8 "Radius scale" — the single source of truth other code should reach for. */
export const radius = {
  xs: 8, // small indicators / thumbnails
  sm: 12, // compact controls
  md: 16, // fields / chips / buttons
  lg: 20, // standard cards
  xl: 24, // media cards / sheets
  xxl: 28, // large sheets / floating bars
  hero: 32, // hero cards
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const type = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '600' as const, letterSpacing: -0.4 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '600' as const, letterSpacing: -0.3 },
  headline: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const, letterSpacing: -0.1 },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' as const },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  captionStrong: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, letterSpacing: 0.3 },
};

export const shadow = {
  soft: {
    shadowColor: '#141210',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  raised: {
    shadowColor: '#141210',
    shadowOpacity: 0.12,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
};
