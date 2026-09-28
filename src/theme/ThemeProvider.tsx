import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkPalette, lightPalette, radius, spacing, type, shadow, type Palette } from './tokens';

type Theme = {
  colors: Palette;
  radius: typeof radius;
  spacing: typeof spacing;
  type: typeof type;
  shadow: typeof shadow;
  scheme: 'light' | 'dark';
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const value = useMemo<Theme>(
    () => ({
      colors: scheme === 'dark' ? darkPalette : lightPalette,
      radius,
      spacing,
      type,
      shadow,
      scheme,
    }),
    [scheme]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
