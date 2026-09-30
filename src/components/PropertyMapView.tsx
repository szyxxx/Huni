import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Constants, { AppOwnership } from 'expo-constants';
import { useTheme } from '../theme/ThemeProvider';
import { formatIDR } from '../lib/format';
import type { Property } from '../data/properties';

type Props = {
  properties: Property[];
  onSelect: (id: string) => void;
  selectedId?: string | null;
  /** Show OSM public places within 10 km of the selected property. */
  showNearbyPlaces?: boolean;
};

const NEARBY_PLACES_MIN_ZOOM = 14;
const POI_CLASSES = ['park', 'grocery', 'shop', 'cafe', 'fast_food', 'school', 'college'];

function nearbyBoundary(lat: number, lng: number) {
  const earthRadius = 6_371_000;
  const distance = 10_000 / earthRadius;
  const centerLat = lat * Math.PI / 180;
  const centerLng = lng * Math.PI / 180;
  const coordinates = Array.from({ length: 65 }, (_, index) => {
    const bearing = index * 2 * Math.PI / 64;
    const pointLat = Math.asin(Math.sin(centerLat) * Math.cos(distance) + Math.cos(centerLat) * Math.sin(distance) * Math.cos(bearing));
    const pointLng = centerLng + Math.atan2(Math.sin(bearing) * Math.sin(distance) * Math.cos(centerLat), Math.cos(distance) - Math.sin(centerLat) * Math.sin(pointLat));
    return [pointLng * 180 / Math.PI, pointLat * 180 / Math.PI];
  });
  return { type: 'Polygon', coordinates: [coordinates] };
}

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
export function PropertyMapView({ properties, onSelect, selectedId, showNearbyPlaces }: Props) {
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
        showNearbyPlaces={showNearbyPlaces}
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

function MapLibreView({
  properties,
  onSelect,
  selectedId,
  theme,
  onLoad,
  onFail,
  showNearbyPlaces,
}: Props & { theme: ReturnType<typeof useTheme>; onLoad: () => void; onFail: () => void }) {
  // Required inline (not top-level) so web/Expo Go never evaluate this native import.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Map, Camera, Marker, Layer } = require('@maplibre/maplibre-react-native');
  const cameraRef = useRef<{ easeTo: (options: { center: [number, number]; zoom: number; duration: number }) => void }>(null);
  const mapRef = useRef<{ queryRenderedFeatures: (point: [number, number], options: { layers: string[] }) => Promise<{ properties?: { name?: string } }[]> }>(null);
  const [zoom, setZoom] = useState(14);
  const [focusedPlace, setFocusedPlace] = useState<{ propertyId: string; name: string } | null>(null);

  const poiCenter = showNearbyPlaces ? properties.find((p) => p.id === selectedId) ?? properties[0] : null;
  const poiLat = poiCenter?.lat;
  const poiLng = poiCenter?.lng;
  const focusedName = focusedPlace && focusedPlace.propertyId === poiCenter?.id ? focusedPlace.name : null;
  const initialViewState = {
    center: poiCenter ? [poiCenter.lng, poiCenter.lat] as [number, number] : [117, -2.5] as [number, number],
    zoom: poiCenter ? 14 : 4,
  };
  const showPlaces = Boolean(poiCenter) && zoom >= NEARBY_PLACES_MIN_ZOOM;
  const poiFilter = useMemo(() => poiLat != null && poiLng != null ? [
    'all',
    ['in', ['get', 'class'], ['literal', POI_CLASSES]],
    ['has', 'name'],
    ['within', nearbyBoundary(poiLat, poiLng)],
  ] : null, [poiLat, poiLng]);

  useEffect(() => {
    if (poiLat == null || poiLng == null) return;
    cameraRef.current?.easeTo({ center: [poiLng, poiLat], zoom: 14, duration: 350 });
  }, [poiLat, poiLng]);

  const handleRegionDidChange = (event: { nativeEvent?: { zoom?: number } }) => {
    const nextZoom = event.nativeEvent?.zoom;
    if (typeof nextZoom === 'number' && Number.isFinite(nextZoom)) setZoom(nextZoom);
  };

  return (
    <View style={StyleSheet.absoluteFill}>
    <Map
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      mapStyle={MAP_STYLE_URL}
      androidView="texture"
      onDidFinishLoadingMap={onLoad}
      onDidFailLoadingMap={onFail}
      onRegionDidChange={handleRegionDidChange}
      onPress={async (event: { nativeEvent?: { point?: [number, number] } }) => {
        if (!event.nativeEvent?.point || !poiCenter || !showPlaces) return;
        try {
          const features = await mapRef.current?.queryRenderedFeatures(event.nativeEvent.point, { layers: ['huni-nearby-poi'] });
          const name = features?.find((feature) => feature.properties?.name)?.properties?.name;
          if (name) setFocusedPlace({ propertyId: poiCenter.id, name });
        } catch {
          // Tiles can change while the user taps the map.
        }
      }}
    >
      <Camera ref={cameraRef} initialViewState={initialViewState} />
      {showPlaces && poiFilter ? <>
        <Layer id="huni-nearby-poi" type="circle" source="openmaptiles" source-layer="poi" filter={poiFilter}
          paint={{ 'circle-radius': 5, 'circle-color': ['match', ['get', 'class'], 'park', '#426C58', 'school', '#5473A4', 'college', '#5473A4', 'grocery', '#A95F45', '#353C40'], 'circle-stroke-width': 1.5, 'circle-stroke-color': '#FFFFFF' }} />
        <Layer id="huni-nearby-poi-label" type="symbol" source="openmaptiles" source-layer="poi" filter={poiFilter}
          layout={{ 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'text-offset': [0, 1.5], 'text-anchor': 'top', 'text-max-width': 8 }}
          paint={{ 'text-color': '#171716', 'text-halo-color': '#FFFFFF', 'text-halo-width': 1.5 }} />
      </> : null}
      {properties.map((p) => (
        <Marker key={p.id} id={p.id} lngLat={[p.lng, p.lat]} onPress={() => onSelect(p.id)}>
          <View style={[styles.pin, { backgroundColor: selectedId === p.id ? theme.colors.brand : theme.colors.inkPrimary }]}>
            <Text style={[theme.type.micro, { color: selectedId === p.id ? theme.colors.onBrand : theme.colors.surface }]}>{formatIDR(p.price)}</Text>
          </View>
        </Marker>
      ))}
    </Map>
    {poiCenter ? <View pointerEvents="none" style={[styles.poiSummary, { backgroundColor: theme.colors.surface }]}>
      <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary }]} numberOfLines={1}>
        {focusedName ?? `Sekitar ${poiCenter.area} · 10 km`}
      </Text>
      <Text style={[theme.type.micro, { color: theme.colors.inkSecondary, marginTop: 2 }]} numberOfLines={1}>
        {focusedName ? 'Tempat umum di sekitar properti' : !showPlaces ? 'Perbesar peta untuk melihat tempat umum' : 'Taman, belanja, kuliner, dan sekolah dalam radius 10 km'}
      </Text>
    </View> : null}
    </View>
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
  poiSummary: { position: 'absolute', top: 12, left: 12, right: 12, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  loading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  retry: { alignSelf: 'flex-start', marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  fallback: { flex: 1, borderRadius: 20, overflow: 'hidden' },
  fallbackRow: { paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
});
