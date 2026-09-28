import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { Chip } from '../../components/Chip';
import { PropertyCard } from '../../components/PropertyCard';
import { PropertyMapView } from '../../components/PropertyMapView';
import { properties } from '../../data/properties';
import { useAppStore } from '../../store/useAppStore';
import { parseIntentQuery } from '../../lib/intentParser';

const SORTS = ['Rekomendasi', 'Terbaru', 'Harga terendah', 'Harga tertinggi'];

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string }>();
  const intent = useAppStore((s) => s.intent);
  const setIntent = useAppStore((s) => s.setIntent);
  const filters = useAppStore((s) => s.filters);
  const addSavedSearch = useAppStore((s) => s.addSavedSearch);
  const compareIds = useAppStore((s) => s.compareIds);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const [query, setQuery] = useState(params.q ?? '');
  const [sort, setSort] = useState(SORTS[0]);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [removedChipKeys, setRemovedChipKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (params.q) setQuery(params.q);
  }, [params.q]);

  const parsed = useMemo(() => parseIntentQuery(query), [query]);
  const activeChips = parsed.chips.filter((c) => !removedChipKeys.has(c.key));

  useEffect(() => {
    setRemovedChipKeys(new Set());
  }, [query]);

  useEffect(() => {
    if (!removedChipKeys.has('intent') && parsed.intent) setIntent(parsed.intent);
  }, [parsed.intent, removedChipKeys]);

  const activeFilterCount =
    filters.types.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.bedrooms ? 1 : 0) +
    (filters.bathrooms ? 1 : 0) +
    (filters.maxInstallment ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.furnished ? 1 : 0);

  const results = useMemo(() => {
    let list = properties.filter((p) => p.intent === (intent === 'new-projects' ? 'buy' : intent));

    const hasChip = (key: string) => activeChips.some((c) => c.key === key);

    if (hasChip('type') && parsed.type) list = list.filter((p) => p.type === parsed.type);
    if (hasChip('bedrooms') && parsed.bedrooms) list = list.filter((p) => (p.bedrooms ?? 0) >= parsed.bedrooms!);
    if (hasChip('maxInstallment') && parsed.maxInstallment)
      list = list.filter((p) => !p.estimatedInstallment || p.estimatedInstallment <= parsed.maxInstallment!);
    if (hasChip('maxPrice') && parsed.maxPrice) list = list.filter((p) => p.price <= parsed.maxPrice!);
    if (hasChip('location') && parsed.location) {
      const loc = parsed.location.toLowerCase();
      list = list.filter((p) => p.area.toLowerCase().includes(loc) || p.city.toLowerCase().includes(loc));
    }
    if (!parsed.chips.length && query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)
      );
    }

    if (filters.types.length) list = list.filter((p) => filters.types.includes(p.type));
    if (filters.minPrice) list = list.filter((p) => p.price >= filters.minPrice!);
    if (filters.maxPrice) list = list.filter((p) => p.price <= filters.maxPrice!);
    if (filters.bedrooms) list = list.filter((p) => (p.bedrooms ?? 0) >= filters.bedrooms!);
    if (filters.bathrooms) list = list.filter((p) => (p.bathrooms ?? 0) >= filters.bathrooms!);
    if (filters.maxInstallment)
      list = list.filter((p) => !p.estimatedInstallment || p.estimatedInstallment <= filters.maxInstallment!);
    if (filters.verifiedOnly) list = list.filter((p) => p.verification !== 'unverified');

    if (sort === 'Harga terendah') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'Harga tertinggi') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'Terbaru') list = [...list].sort((a, b) => (a.lastConfirmed < b.lastConfirmed ? 1 : -1));
    return list;
  }, [intent, query, sort, filters, activeChips, parsed]);

  const saveThisSearch = () => {
    addSavedSearch({ label: query.trim() || 'Pencarian tanpa judul', query, intent, filters, notify: true });
    const msg = 'Pencarian disimpan. Kamu akan diberi tahu saat ada properti baru yang cocok.';
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      alert(msg);
    } else {
      Alert.alert('Pencarian tersimpan', msg);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas, paddingTop: insets.top + 8 }}>
      <View style={styles.searchRow}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.inkTertiary, fontSize: 16 }}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder='Coba: "rumah 3 kamar dekat ITB cicilan 8 juta"'
            placeholderTextColor={theme.colors.inkTertiary}
            style={[theme.type.body, { flex: 1, marginLeft: 8, color: theme.colors.inkPrimary }]}
          />
        </View>
        <Pressable
          onPress={() => router.push('/filters')}
          style={[styles.toggleBtn, { backgroundColor: activeFilterCount ? theme.colors.brand : theme.colors.inkPrimary }]}
        >
          <Text style={{ color: activeFilterCount ? theme.colors.onBrand : theme.colors.surface, fontSize: 16 }}>▤</Text>
        </Pressable>
        <Pressable
          onPress={() => setView(view === 'list' ? 'map' : 'list')}
          style={[styles.toggleBtn, { backgroundColor: theme.colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border }]}
        >
          <Text style={{ color: theme.colors.inkPrimary, fontSize: 16 }}>{view === 'list' ? '⊞' : '☰'}</Text>
        </Pressable>
      </View>

      {activeChips.length > 0 ? (
        <View style={styles.parsedChipRow}>
          <Text style={[theme.type.micro, { color: theme.colors.inkTertiary, marginRight: 4 }]}>DIPAHAMI SEBAGAI:</Text>
          {activeChips.map((c) => (
            <Pressable
              key={c.key}
              onPress={() => setRemovedChipKeys((prev) => new Set(prev).add(c.key))}
              style={[styles.parsedChip, { backgroundColor: theme.colors.brandSoft }]}
            >
              <Text style={[theme.type.micro, { color: theme.colors.brandInk }]}>{c.label} ✕</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <FlatList
        data={SORTS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s}
        contentContainerStyle={styles.sortRow}
        renderItem={({ item }) => <Chip label={item} selected={sort === item} onPress={() => setSort(item)} />}
        style={{ flexGrow: 0, marginTop: 12 }}
      />

      <View style={styles.resultRow}>
        <Text style={[theme.type.caption, { color: theme.colors.inkSecondary }]}>
          {results.length} properti ditemukan
        </Text>
        <Pressable onPress={saveThisSearch} hitSlop={8}>
          <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>Simpan pencarian</Text>
        </Pressable>
      </View>

      {view === 'map' ? (
        <View style={styles.mapWrap}>
          <PropertyMapView properties={results} onSelect={(id) => router.push(`/property/${id}`)} />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 14, paddingHorizontal: 20 }}
          contentContainerStyle={{ gap: 14, paddingTop: 14, paddingBottom: compareIds.length ? 210 : 140 }}
          renderItem={({ item }) => (
            <View style={{ width: '48%' }}>
              <PropertyCard property={item} onPress={() => router.push(`/property/${item.id}`)} />
              <Pressable onPress={() => toggleCompare(item.id)} style={styles.compareRow}>
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: compareIds.includes(item.id) ? theme.colors.inkPrimary : 'transparent',
                    },
                  ]}
                />
                <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginLeft: 6 }]}>
                  Bandingkan
                </Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ paddingTop: 60, alignItems: 'center', paddingHorizontal: 32 }}>
              <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, textAlign: 'center' }]}>
                Tidak ada hasil
              </Text>
              <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, textAlign: 'center', marginTop: 6 }]}>
                Coba ubah kata kunci atau perlebar area pencarian.
              </Text>
            </View>
          }
        />
      )}

      {compareIds.length >= 2 ? (
        <Pressable
          onPress={() => router.push('/compare')}
          style={[styles.compareBar, { bottom: insets.bottom + 96, backgroundColor: theme.colors.inkPrimary }]}
        >
          <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>
            Bandingkan {compareIds.length} properti →
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  toggleBtn: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  parsedChipRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, gap: 6 },
  parsedChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  sortRow: { paddingHorizontal: 20, gap: 8 },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  mapWrap: { flex: 1, marginTop: 14, marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', marginBottom: 140 },
  compareRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingLeft: 2 },
  checkbox: { width: 16, height: 16, borderRadius: 4, borderWidth: StyleSheet.hairlineWidth },
  compareBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
});
