import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Constants, { AppOwnership } from 'expo-constants';
import { useTheme } from '../theme/ThemeProvider';
import { formatIDR } from '../lib/format';
import type { Property } from '../data/properties';

type Props = {
  properties: Property[];
  onSelect: (id: string) => void;
  selectedId?: string | null;
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
export function PropertyMapView({ properties, onSelect, selectedId }: Props) {
  const theme = useTheme();
  const [retryKey, setRetryKey] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const mappedProperties = useMemo(
    () => properties.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng) && p.lat !== 0 && p.lng !== 0),
    [properties]
  );

  useEffect(() => {
    if (status !== 'loading') return;
    const timeout = setTimeout(() => setStatus('failed'), 15000);
    return () => clearTimeout(timeout);
  }, [status, retryKey]);

  if (Platform.OS === 'web' || isExpoGo) {
    return <MapFallback properties={properties} onSelect={onSelect} theme={theme} />;
  }

  if (mappedProperties.length === 0 && properties.length > 0) {
    return <MapFallback properties={properties} onSelect={onSelect} theme={theme} noCoordinates />;
  }

  if (status === 'failed') {
    return <MapFallback properties={properties} onSelect={onSelect} theme={theme} onRetry={() => {
      setRetryKey((value) => value + 1);
      setStatus('loading');
    }} />;
  }

  return (
    <MapErrorBoundary key={retryKey} fallback={<MapFallback properties={properties} onSelect={onSelect} theme={theme} />}>
      <MapLibreView
        properties={mappedProperties}
        onSelect={onSelect}
        selectedId={selectedId}
        theme={theme}
        onLoad={() => setStatus('ready')}
        onFail={() => setStatus('failed')}
      />
      {status === 'loading' ? (
        <View pointerEvents="none" style={[styles.loading, { backgroundColor: theme.colors.surfaceSoft }]}>
          <Text style={[theme.type.caption, { color: theme.colors.inkSecondary }]}>Memuat peta…</Text>
        </View>
      ) : null}
    </MapErrorBoundary>
  );
}

function MapLibreView({ properties, onSelect, selectedId, theme, onLoad, onFail }: Props & { theme: ReturnType<typeof useTheme>; onLoad: () => void; onFail: () => void }) {
  // Required inline (not top-level) so web/Expo Go never evaluate this native import.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Map, Camera, Marker } = require('@maplibre/maplibre-react-native');

  const cameraState = properties.length > 1
    ? {
        bounds: [
          Math.min(...properties.map((p) => p.lng)),
          Math.min(...properties.map((p) => p.lat)),
          Math.max(...properties.map((p) => p.lng)),
          Math.max(...properties.map((p) => p.lat)),
        ] as [number, number, number, number],
        padding: { top: 52, right: 52, bottom: 52, left: 52 },
      }
    : { center: properties.length ? [properties[0].lng, properties[0].lat] as [number, number] : [117, -2.5] as [number, number], zoom: properties.length ? 12 : 4 };

  return (
    <Map
      style={StyleSheet.absoluteFill}
      mapStyle={MAP_STYLE_URL}
      androidView="texture"
      onDidFinishLoadingMap={onLoad}
      onDidFailLoadingMap={onFail}
    >
      <Camera {...cameraState} duration={0} initialViewState={cameraState} />
      {properties.map((p) => (
        <Marker key={p.id} id={p.id} lngLat={[p.lng, p.lat]} onPress={() => onSelect(p.id)}>
          <View style={[styles.pin, { backgroundColor: selectedId === p.id ? theme.colors.brand : theme.colors.inkPrimary }]}>
            <Text style={[theme.type.micro, { color: selectedId === p.id ? theme.colors.onBrand : theme.colors.surface }]}>{formatIDR(p.price)}</Text>
          </View>
        </Marker>
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

function MapFallback({ properties, onSelect, theme, onRetry, noCoordinates }: Props & { theme: ReturnType<typeof useTheme>; onRetry?: () => void; noCoordinates?: boolean }) {
  return (
    <View style={[styles.fallback, { backgroundColor: theme.colors.surfaceSoft }]}>
      <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, padding: 16 }]}>
        {noCoordinates ? 'Lokasi peta belum tersedia untuk properti ini. Kamu tetap bisa membuka detailnya dari daftar.' : onRetry ? 'Peta belum dapat dimuat. Pilih properti dari daftar atau coba lagi.' : 'Peta interaktif tersedia di build Android/iOS. Berikut properti yang ditemukan:'}
      </Text>
      {onRetry ? <Pressable onPress={onRetry} style={[styles.retry, { backgroundColor: theme.colors.inkPrimary }]}>
        <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>Coba muat peta</Text>
      </Pressable> : null}
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
  pin: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, minHeight: 36, justifyContent: 'center' },
  loading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  retry: { alignSelf: 'flex-start', marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  fallback: { flex: 1, borderRadius: 20, overflow: 'hidden' },
  fallbackRow: { paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
});
