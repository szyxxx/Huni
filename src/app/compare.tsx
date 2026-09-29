import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../theme/ThemeProvider';
import { useAppStore } from '../store/useAppStore';
import { fetchProperties } from '../data/repository';
import type { Property } from '../data/properties';
import { formatPriceLine } from '../lib/format';
import { VERIFICATION_LABELS } from '../components/VerificationBadge';

const ROWS: { label: string; get: (p: Property | undefined) => string }[] = [
  { label: 'Lokasi', get: (p) => (p ? `${p.area}, ${p.city}` : '-') },
  { label: 'Kamar tidur', get: (p) => (p?.bedrooms ? `${p.bedrooms}` : '-') },
  { label: 'Kamar mandi', get: (p) => (p?.bathrooms ? `${p.bathrooms}` : '-') },
  { label: 'Luas tanah', get: (p) => (p?.landArea ? `${p.landArea} m²` : '-') },
  { label: 'Luas bangunan', get: (p) => (p?.buildingArea ? `${p.buildingArea} m²` : '-') },
  { label: 'Verifikasi', get: (p) => (p ? VERIFICATION_LABELS[p.verification] || 'Belum terverifikasi' : '-') },
];

export default function CompareScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compareIds = useAppStore((s) => s.compareIds);
  const clearCompare = useAppStore((s) => s.clearCompare);
  const savedIds = useAppStore((s) => s.savedIds);
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });
  const items = compareIds.map((id) => properties.find((p) => p.id === id)).filter(Boolean) as Property[];
  const columnWidth = Math.max(136, (width - 136) / Math.max(items.length, 2));

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={20} color={theme.colors.inkPrimary} />
        </Pressable>
        <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginLeft: 12 }]}>Bandingkan</Text>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => { clearCompare(); router.back(); }} hitSlop={10}>
          <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>Hapus semua</Text>
        </Pressable>
      </View>

      <Text style={[theme.type.caption, styles.intro, { color: theme.colors.inkSecondary }]}>
        {items.length >= 2 ? `${items.length} properti berdampingan. Sentuh foto untuk membuka detailnya.` : 'Pilih setidaknya dua properti untuk melihat perbedaannya.'}
      </Text>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <View style={styles.row}>
            <View style={styles.labelCol} />
            {items.map((p) => (
              <View key={p.id} style={[styles.col, { width: columnWidth }]}>
                <Pressable onPress={() => router.push(`/property/${p.id}`)} accessibilityRole="button" accessibilityLabel={`Buka ${p.title}`}>
                  <Image source={{ uri: p.images[0] }} style={styles.thumb} contentFit="cover" />
                  <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary, marginTop: 8 }]} numberOfLines={2}>
                    {formatPriceLine(p.price, p.priceUnit)}
                  </Text>
                  <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary, marginTop: 6, minHeight: 40 }]} numberOfLines={2}>
                    {p.title}
                  </Text>
                </Pressable>
                <Pressable onPress={() => toggleSaved(p.id)} style={styles.saveButton} accessibilityRole="button" accessibilityLabel={savedIds.has(p.id) ? `Hapus ${p.title} dari tersimpan` : `Simpan ${p.title}`}>
                  <Feather name="heart" size={15} color={savedIds.has(p.id) ? theme.colors.brandInk : theme.colors.inkSecondary} />
                  <Text style={[theme.type.captionStrong, { color: savedIds.has(p.id) ? theme.colors.brandInk : theme.colors.inkSecondary }]}>
                    {savedIds.has(p.id) ? 'Tersimpan' : 'Simpan'}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>

          {ROWS.map((row) => (
            <View key={row.label} style={[styles.row, { borderTopColor: theme.colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
              <View style={styles.labelCol}>
                <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>{row.label}</Text>
              </View>
              {items.map((p) => (
                <View key={p.id} style={[styles.col, { width: columnWidth }]}>
                  <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary }]}>{row.get(p)}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        </ScrollView>

        {items.length < 2 ? (
        <View style={styles.empty}>
          <Pressable onPress={() => router.push('/(tabs)/search')} style={[styles.findBtn, { backgroundColor: theme.colors.inkPrimary }]}>
            <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>Cari properti pembanding</Text>
          </Pressable>
        </View>
        ) : null}
        {items.length >= 2 && items.some((p) => savedIds.has(p.id)) ? (
        <Pressable onPress={() => router.push('/(tabs)/saved')} style={[styles.findBtn, { marginHorizontal: 20, marginTop: 10, backgroundColor: theme.colors.inkPrimary }]}>
          <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>Lanjutkan di Tersimpan</Text>
        </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  intro: { paddingHorizontal: 20, marginTop: 8, marginBottom: 16 },
  row: { flexDirection: 'row', paddingVertical: 12 },
  labelCol: { width: 96, justifyContent: 'center' },
  col: { paddingHorizontal: 8 },
  thumb: { width: '100%', height: 94, borderRadius: 12 },
  empty: { padding: 32, alignItems: 'center' },
  findBtn: { minHeight: 48, borderRadius: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  saveButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 },
});
