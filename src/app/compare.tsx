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
import { formatIDR, formatPriceLine } from '../lib/format';
import { VERIFICATION_LABELS } from '../components/VerificationBadge';

type Row = {
  label: string;
  format: (p: Property) => string;
  /** Numeric value for best-value highlighting; omit for non-comparable rows. */
  value?: (p: Property) => number | null;
  better?: 'max' | 'min';
};

const ROWS: Row[] = [
  { label: 'Harga', format: (p) => formatPriceLine(p.price, p.priceUnit), value: (p) => p.price, better: 'min' },
  {
    label: 'Estimasi cicilan',
    format: (p) => (p.estimatedInstallment ? `${formatIDR(p.estimatedInstallment)}/bln` : '-'),
    value: (p) => p.estimatedInstallment ?? null,
    better: 'min',
  },
  { label: 'Lokasi', format: (p) => `${p.area}, ${p.city}` },
  { label: 'Kamar tidur', format: (p) => (p.bedrooms ? `${p.bedrooms}` : '-'), value: (p) => p.bedrooms ?? null, better: 'max' },
  { label: 'Kamar mandi', format: (p) => (p.bathrooms ? `${p.bathrooms}` : '-'), value: (p) => p.bathrooms ?? null, better: 'max' },
  { label: 'Luas tanah', format: (p) => (p.landArea ? `${p.landArea} m²` : '-'), value: (p) => p.landArea ?? null, better: 'max' },
  { label: 'Luas bangunan', format: (p) => (p.buildingArea ? `${p.buildingArea} m²` : '-'), value: (p) => p.buildingArea ?? null, better: 'max' },
  { label: 'Verifikasi', format: (p) => VERIFICATION_LABELS[p.verification] || 'Belum terverifikasi' },
];

export default function CompareScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compareIds = useAppStore((s) => s.compareIds);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const clearCompare = useAppStore((s) => s.clearCompare);
  const savedIds = useAppStore((s) => s.savedIds);
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });
  const items = compareIds.map((id) => properties.find((p) => p.id === id)).filter(Boolean) as Property[];
  const columnWidth = Math.max(148, (width - 116) / Math.max(items.length, 2));

  const bestIdFor = (row: Row): string | null => {
    if (!row.value || items.length < 2) return null;
    const values = items.map((p) => ({ id: p.id, v: row.value!(p) })).filter((x) => x.v !== null) as { id: string; v: number }[];
    if (values.length < 2) return null;
    const best = row.better === 'min' ? Math.min(...values.map((x) => x.v)) : Math.max(...values.map((x) => x.v));
    const winners = values.filter((x) => x.v === best);
    if (winners.length !== 1) return null; // tie — no single winner to highlight
    return winners[0].id;
  };

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
        {items.length >= 2
          ? `${items.length} properti berdampingan. Nilai terbaik pada tiap baris ditandai warna.`
          : 'Pilih setidaknya dua properti untuk melihat perbedaannya.'}
      </Text>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          <View style={styles.row}>
            <View style={styles.labelCol} />
            {items.map((p) => (
              <View key={p.id} style={[styles.col, { width: columnWidth }]}>
                <View style={styles.colHeader}>
                  <Pressable
                    onPress={() => toggleCompare(p.id)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Keluarkan ${p.title} dari perbandingan`}
                    style={[styles.removeBtn, { backgroundColor: theme.colors.surfaceSoft }]}
                  >
                    <Feather name="x" size={12} color={theme.colors.inkSecondary} />
                  </Pressable>
                </View>
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

          {ROWS.map((row) => {
            const bestId = bestIdFor(row);
            return (
              <View key={row.label} style={[styles.row, { borderTopColor: theme.colors.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <View style={styles.labelCol}>
                  <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>{row.label}</Text>
                </View>
                {items.map((p) => {
                  const isBest = bestId === p.id;
                  return (
                    <View
                      key={p.id}
                      style={[
                        styles.col,
                        { width: columnWidth },
                        isBest && { backgroundColor: theme.colors.brandSoft, borderRadius: 10 },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        {isBest ? <Feather name="check-circle" size={12} color={theme.colors.brandInk} /> : null}
                        <Text
                          style={[
                            theme.type.captionStrong,
                            { color: isBest ? theme.colors.brandInk : theme.colors.inkPrimary },
                          ]}
                        >
                          {row.format(p)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
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
  colHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 },
  removeBtn: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: '100%', height: 94, borderRadius: 12 },
  empty: { padding: 32, alignItems: 'center' },
  findBtn: { minHeight: 48, borderRadius: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  saveButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 },
});
