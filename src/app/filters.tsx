import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Chip } from '../components/Chip';
import { Stepper } from '../components/Stepper';
import { useAppStore, defaultFilters, FilterState } from '../store/useAppStore';
import { PROPERTY_TYPE_LABELS, type PropertyType } from '../data/properties';
import { formatIDR } from '../lib/format';

const TYPE_OPTIONS = (Object.entries(PROPERTY_TYPE_LABELS) as [PropertyType, string][]).map(
  ([key, label]) => ({ key, label })
);

export default function FiltersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const storedFilters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);
  const [draft, setDraft] = useState<FilterState>(storedFilters);

  const toggleType = (type: PropertyType) => {
    setDraft((d) => ({
      ...d,
      types: d.types.includes(type) ? d.types.filter((t) => t !== type) : [...d.types, type],
    }));
  };

  const apply = () => {
    setFilters(draft);
    router.back();
  };

  const reset = () => setDraft(defaultFilters);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="x" size={20} color={theme.colors.inkPrimary} />
        </Pressable>
        <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginLeft: 12 }]}>Filter</Text>
        <View style={{ flex: 1 }} />
        <Pressable onPress={reset} hitSlop={10}>
          <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>Atur ulang</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary }]}>Tipe properti</Text>
        <View style={styles.chipWrap}>
          {TYPE_OPTIONS.map((t) => (
            <Chip key={t.key} label={t.label} selected={draft.types.includes(t.key)} onPress={() => toggleType(t.key)} />
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Stepper
            label="Harga minimum"
            value={draft.minPrice ? formatIDR(draft.minPrice) : 'Tidak ditentukan'}
            onDecrease={() => setDraft((d) => ({ ...d, minPrice: Math.max(0, (d.minPrice ?? 0) - 100_000_000) }))}
            onIncrease={() => setDraft((d) => ({ ...d, minPrice: (d.minPrice ?? 0) + 100_000_000 }))}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <Stepper
            label="Harga maksimum"
            value={draft.maxPrice ? formatIDR(draft.maxPrice) : 'Tidak ditentukan'}
            onDecrease={() => setDraft((d) => ({ ...d, maxPrice: Math.max(0, (d.maxPrice ?? 500_000_000) - 100_000_000) }))}
            onIncrease={() => setDraft((d) => ({ ...d, maxPrice: (d.maxPrice ?? 400_000_000) + 100_000_000 }))}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <Stepper
            label="Cicilan bulanan maksimum"
            value={draft.maxInstallment ? formatIDR(draft.maxInstallment) : 'Tidak ditentukan'}
            onDecrease={() => setDraft((d) => ({ ...d, maxInstallment: Math.max(0, (d.maxInstallment ?? 0) - 1_000_000) }))}
            onIncrease={() => setDraft((d) => ({ ...d, maxInstallment: (d.maxInstallment ?? 0) + 1_000_000 }))}
          />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Stepper
            label="Kamar tidur minimum"
            value={draft.bedrooms ? `${draft.bedrooms}+` : 'Semua'}
            onDecrease={() => setDraft((d) => ({ ...d, bedrooms: d.bedrooms ? Math.max(0, d.bedrooms - 1) || null : null }))}
            onIncrease={() => setDraft((d) => ({ ...d, bedrooms: (d.bedrooms ?? 0) + 1 }))}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <Stepper
            label="Kamar mandi minimum"
            value={draft.bathrooms ? `${draft.bathrooms}+` : 'Semua'}
            onDecrease={() => setDraft((d) => ({ ...d, bathrooms: d.bathrooms ? Math.max(0, d.bathrooms - 1) || null : null }))}
            onIncrease={() => setDraft((d) => ({ ...d, bathrooms: (d.bathrooms ?? 0) + 1 }))}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <Stepper
            label="Luas tanah/bangunan minimum"
            value={draft.minArea ? `${draft.minArea} m²` : 'Semua'}
            onDecrease={() => setDraft((d) => ({ ...d, minArea: d.minArea ? Math.max(0, d.minArea - 10) || null : null }))}
            onIncrease={() => setDraft((d) => ({ ...d, minArea: (d.minArea ?? 0) + 10 }))}
          />
        </View>

        <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary, marginTop: 20 }]}>Lainnya</Text>
        <View style={styles.chipWrap}>
          <Chip
            label="Terverifikasi saja"
            selected={draft.verifiedOnly}
            onPress={() => setDraft((d) => ({ ...d, verifiedOnly: !d.verifiedOnly }))}
          />
          <Chip
            label="Fully furnished"
            selected={draft.furnished === true}
            onPress={() => setDraft((d) => ({ ...d, furnished: d.furnished === true ? null : true }))}
          />
          <Chip
            label="Ada penawaran khusus"
            selected={draft.specialOfferOnly}
            onPress={() => setDraft((d) => ({ ...d, specialOfferOnly: !d.specialOfferOnly }))}
          />
          <Chip
            label="Ada video"
            selected={draft.videoOnly}
            onPress={() => setDraft((d) => ({ ...d, videoOnly: !d.videoOnly }))}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, borderColor: theme.colors.border, backgroundColor: theme.colors.canvas }]}>
        <Pressable onPress={apply} style={[styles.applyBtn, { backgroundColor: theme.colors.inkPrimary }]}>
          <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>Terapkan filter</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  card: { marginTop: 20, paddingHorizontal: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  divider: { height: StyleSheet.hairlineWidth },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
  applyBtn: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
});
