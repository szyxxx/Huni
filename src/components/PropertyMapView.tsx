import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { formatIDR } from '../lib/format';
import type { Property } from '../data/properties';

type Props = {
  properties: Property[];
  onSelect: (id: string) => void;
};

/**
 * Native map with synchronized price pins (PRD §7.3). Requires a Google Maps API key
 * (app.json android.config.googleMaps.apiKey / ios.config.googleMapsApiKey) to render
 * tiles on a real device build — placeholder pins still render without it in Expo Go/dev.
 * Web has no first-class react-native-maps support, so it renders the same list-style
 * fallback as required by DESIGN.md's "map-only info needs a list alternative" rule.
 */
export function PropertyMapView({ properties, onSelect }: Props) {
  const theme = useTheme();

  if (Platform.OS === 'web') {
    return <MapFallback properties={properties} onSelect={onSelect} theme={theme} />;
  }

  const MapView = require('react-native-maps').default;
  const { Marker } = require('react-native-maps');

  const region =
    properties.length > 0
      ? {
          latitude: properties[0].lat,
          longitude: properties[0].lng,
          latitudeDelta: 0.4,
          longitudeDelta: 0.4,
        }
      : { latitude: -6.2, longitude: 106.8, latitudeDelta: 4, longitudeDelta: 4 };

  return (
    <MapView style={StyleSheet.absoluteFill} initialRegion={region}>
      {properties.map((p) => (
        <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }} onPress={() => onSelect(p.id)}>
          <View style={[styles.pin, { backgroundColor: theme.colors.inkPrimary }]}>
            <Text style={[theme.type.micro, { color: theme.colors.surface }]}>{formatIDR(p.price)}</Text>
          </View>
        </Marker>
      ))}
    </MapView>
  );
}

function MapFallback({ properties, onSelect, theme }: Props & { theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={[styles.fallback, { backgroundColor: theme.colors.surfaceSoft }]}>
      <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, padding: 16 }]}>
        Peta interaktif tersedia di aplikasi native. Berikut properti pada area ini:
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
