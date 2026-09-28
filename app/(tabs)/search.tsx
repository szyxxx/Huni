import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Chip } from '../../src/components/Chip';
import { PropertyCard } from '../../src/components/PropertyCard';
import { PropertyMapView } from '../../src/components/PropertyMapView';
import { properties } from '../../src/data/properties';
import { useAppStore } from '../../src/store/useAppStore';

const SORTS = ['Rekomendasi', 'Terbaru', 'Harga terendah', 'Harga tertinggi'];

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const intent = useAppStore((s) => s.intent);
  const filters = useAppStore((s) => s.filters);
  const addSavedSearch = useAppStore((s) => s.addSavedSearch);
  const compareIds = useAppStore((s) => s.compareIds);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(SORTS[0]);
  const [view, setView] = useState<'list' | 'map'>('list');

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
    if (query.trim()) {
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
  }, [intent, query, sort, filters]);

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
            placeholder="Cari lokasi, proyek, atau tipe properti"
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
