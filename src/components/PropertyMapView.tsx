import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Constants, { AppOwnership } from 'expo-constants';
import { useTheme } from '../theme/ThemeProvider';
import { formatIDR } from '../lib/format';
import type { Property } from '../data/properties';

type Props = {
  properties: Property[];
  onSelect: (id: string) => void;
};

// OpenFreeMap's hosted "positron" style — free, no API key, no billing.
// Closest stock match to DESIGN.md's warm-neutral canvas (light, low-saturation basemap).
const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

const isExpoGo = Constants.appOwnership === AppOwnership.Expo;

/**
 * Native map with synchronized price pins (PRD §7.3), backed by MapLibre +
 * OpenFreeMap tiles — free and key-less (Axel's call over Google Maps, which
 * needs an API key + billing). MapLibre's native module isn't bundled in
 * Expo Go, so this renders the same list fallback there as it already does
 * on web; a one-time `eas build --profile development` unlocks the real map
 * on-device. A render-time ErrorBoundary is a second safety net in case the
 * native module is missing for any other reason, so this never crashes the
 * Search screen it lives on.
 */
export function PropertyMapView({ properties, onSelect }: Props) {
  const theme = useTheme();

  if (Platform.OS === 'web' || isExpoGo) {
    return <MapFallback properties={properties} onSelect={onSelect} theme={theme} />;
  }

  return (
    <MapErrorBoundary fallback={<MapFallback properties={properties} onSelect={onSelect} theme={theme} />}>
      <MapLibreView properties={properties} onSelect={onSelect} theme={theme} />
    </MapErrorBoundary>
  );
}

function MapLibreView({ properties, onSelect, theme }: Props & { theme: ReturnType<typeof useTheme> }) {
  // Required inline (not top-level) so web/Expo Go never evaluate this native import.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Map, Camera, ViewAnnotation } = require('@maplibre/maplibre-react-native');

  const center: [number, number] =
    properties.length > 0 ? [properties[0].lng, properties[0].lat] : [106.8, -6.2];

  return (
    <Map style={StyleSheet.absoluteFill} mapStyle={MAP_STYLE_URL}>
      <Camera initialViewState={{ center, zoom: properties.length > 0 ? 11 : 4 }} />
      {properties.map((p) => (
        <ViewAnnotation key={p.id} lngLat={[p.lng, p.lat]} onPress={() => onSelect(p.id)}>
          <View style={[styles.pin, { backgroundColor: theme.colors.inkPrimary }]}>
            <Text style={[theme.type.micro, { color: theme.colors.surface }]}>{formatIDR(p.price)}</Text>
          </View>
        </ViewAnnotation>
      ))}
    </Map>
  );
}

class MapErrorBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // native map module unavailable — MapFallback below covers it silently
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function MapFallback({ properties, onSelect, theme }: Props & { theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={[styles.fallback, { backgroundColor: theme.colors.surfaceSoft }]}>
      <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, padding: 16 }]}>
        Peta interaktif tersedia di build native (development/production). Berikut properti pada area ini:
      </Text>
      {properties.slice(0, 6).map((p) => (
        <Pressable
          key={p.id}
          onPress={() => onSelect(p.id)}
          style={[styles.fallbackRow, { borderColor: theme.colors.border }]}
        >
          <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary }]}>{formatIDR(p.price)}</Text>
          <Text style={[theme.type.caption, { color: theme.colors.inkSecondary }]} numberOfLines={1}>
            {p.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pin: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  fallback: { flex: 1, borderRadius: 20, overflow: 'hidden' },
  fallbackRow: { paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
});
