import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Chip } from '../../src/components/Chip';
import { PropertyCard } from '../../src/components/PropertyCard';
import { properties } from '../../src/data/properties';
import { useAppStore } from '../../src/store/useAppStore';

const SORTS = ['Rekomendasi', 'Terbaru', 'Harga terendah', 'Harga tertinggi'];

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const intent = useAppStore((s) => s.intent);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(SORTS[0]);
  const [view, setView] = useState<'list' | 'map'>('list');

  const results = useMemo(() => {
    let list = properties.filter((p) => p.intent === (intent === 'new-projects' ? 'buy' : intent));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)
      );
    }
    if (sort === 'Harga terendah') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'Harga tertinggi') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'Terbaru') list = [...list].sort((a, b) => (a.lastConfirmed < b.lastConfirmed ? 1 : -1));
    return list;
  }, [intent, query, sort]);

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
          onPress={() => setView(view === 'list' ? 'map' : 'list')}
          style={[styles.toggleBtn, { backgroundColor: theme.colors.inkPrimary }]}
        >
          <Text style={{ color: theme.colors.surface, fontSize: 16 }}>{view === 'list' ? '⊞' : '☰'}</Text>
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

      <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, paddingHorizontal: 20, marginTop: 10 }]}>
        {results.length} properti ditemukan
      </Text>

      {view === 'map' ? (
        <View style={[styles.mapPlaceholder, { backgroundColor: theme.colors.surfaceSoft }]}>
          <Text style={[theme.type.body, { color: theme.colors.inkSecondary, textAlign: 'center', paddingHorizontal: 32 }]}>
            Tampilan peta akan menampilkan pin harga yang tersinkron dengan hasil daftar ini.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 14, paddingHorizontal: 20 }}
          contentContainerStyle={{ gap: 14, paddingTop: 14, paddingBottom: 140 }}
          renderItem={({ item }) => (
            <View style={{ width: '48%' }}>
              <PropertyCard property={item} onPress={() => router.push(`/property/${item.id}`)} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  toggleBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  mapPlaceholder: {
    flex: 1,
    marginTop: 14,
    marginHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 140,
  },
});
