import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../theme/ThemeProvider';
import { useAppStore } from '../store/useAppStore';
import { fetchProperties } from '../data/repository';
import type { Property } from '../data/properties';
import { formatPriceLine } from '../lib/format';

const ROWS: { label: string; get: (p: Property | undefined) => string }[] = [
  { label: 'Harga', get: (p) => (p ? formatPriceLine(p.price, p.priceUnit) : '-') },
  { label: 'Lokasi', get: (p) => (p ? `${p.area}, ${p.city}` : '-') },
  { label: 'Kamar tidur', get: (p) => (p?.bedrooms ? `${p.bedrooms}` : '-') },
  { label: 'Kamar mandi', get: (p) => (p?.bathrooms ? `${p.bathrooms}` : '-') },
  { label: 'Luas tanah', get: (p) => (p?.landArea ? `${p.landArea} m²` : '-') },
  { label: 'Luas bangunan', get: (p) => (p?.buildingArea ? `${p.buildingArea} m²` : '-') },
  { label: 'Verifikasi', get: (p) => (p ? p.verification.replace('_', ' ') : '-') },
];

export default function CompareScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const compareIds = useAppStore((s) => s.compareIds);
  const clearCompare = useAppStore((s) => s.clearCompare);
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });
  const items = compareIds.map((id) => properties.find((p) => p.id === id)).filter(Boolean) as Property[];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={{ fontSize: 20, color: theme.colors.inkPrimary }}>←</Text>
        </Pressable>
        <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginLeft: 12 }]}>Bandingkan</Text>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => { clearCompare(); router.back(); }} hitSlop={10}>
          <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>Hapus semua</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <View style={styles.row}>
            <View style={styles.labelCol} />
            {items.map((p) => (
              <Pressable key={p.id} onPress={() => router.push(`/property/${p.id}`)} style={styles.col}>
                <Image source={{ uri: p.images[0] }} style={styles.thumb} contentFit="cover" />
                <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary, marginTop: 6 }]} numberOfLines={2}>
                  {p.title}
                </Text>
              </Pressable>
            ))}
          </View>

          {ROWS.map((row) => (
            <View key={row.label} style={[styles.row, { borderTopColor: theme.colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
              <View style={styles.labelCol}>
                <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>{row.label}</Text>
              </View>
              {items.map((p) => (
                <View key={p.id} style={styles.col}>
                  <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary }]}>{row.get(p)}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[theme.type.body, { color: theme.colors.inkSecondary }]}>
            Pilih minimal 2 properti dari hasil pencarian untuk membandingkan.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  row: { flexDirection: 'row', paddingVertical: 12 },
  labelCol: { width: 120, justifyContent: 'center' },
  col: { width: 140, paddingHorizontal: 8 },
  thumb: { width: 124, height: 90, borderRadius: 12 },
  empty: { padding: 32, alignItems: 'center' },
});
