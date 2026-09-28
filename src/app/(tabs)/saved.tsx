import React, { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../theme/ThemeProvider';
import { PropertyCard } from '../../components/PropertyCard';
import { SectionHeader } from '../../components/SectionHeader';
import { fetchProperties } from '../../data/repository';
import { useAppStore } from '../../store/useAppStore';
import { formatIDR } from '../../lib/format';

export default function SavedScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const savedIds = useAppStore((s) => s.savedIds);
  const savedSearches = useAppStore((s) => s.savedSearches);
  const removeSavedSearch = useAppStore((s) => s.removeSavedSearch);
  const kprScenarios = useAppStore((s) => s.kprScenarios);
  const removeKprScenario = useAppStore((s) => s.removeKprScenario);
  const shortlists = useAppStore((s) => s.shortlists);
  const createShortlist = useAppStore((s) => s.createShortlist);
  const watchedPriceIds = useAppStore((s) => s.watchedPriceIds);
  const priceAlerts = useAppStore((s) => s.priceAlerts);
  const recentlyViewed = useAppStore((s) => s.recentlyViewed);
  const hiddenIds = useAppStore((s) => s.hiddenIds);
  const toggleHidden = useAppStore((s) => s.toggleHidden);
  const { data: properties = [], isFetching, refetch } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });
  const saved = properties.filter((p) => savedIds.has(p.id));
  const hidden = properties.filter((p) => hiddenIds.has(p.id));
  const getPropertyById = (id: string) => properties.find((p) => p.id === id);
  const recent = recentlyViewed.map(getPropertyById).filter(Boolean) as typeof properties;
  const [newShortlistName, setNewShortlistName] = useState('');

  const watchedAlerts = priceAlerts.filter((a) => watchedPriceIds.has(a.propertyId));

  const addShortlist = () => {
    const name = newShortlistName.trim();
    if (!name) return;
    const sl = createShortlist(name);
    setNewShortlistName('');
    if (Platform.OS !== 'web') {
      Alert.alert('Shortlist dibuat', `"${sl.name}" siap ditambahi properti dan dibagikan.`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas, paddingTop: insets.top + 12 }}>
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <Text style={[theme.type.title, { color: theme.colors.inkPrimary }]}>Workspace kamu</Text>
        <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 4 }]}>
          Properti tersimpan, pencarian, dan simulasi KPR
        </Text>
      </View>

      <FlatList
        data={saved}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 14, paddingHorizontal: 20 }}
        contentContainerStyle={{ gap: 14, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={theme.colors.inkTertiary} />}
        ListHeaderComponent={<SectionHeader title="Properti tersimpan" subtitle={`${saved.length} properti`} />}
        renderItem={({ item }) => (
          <View style={{ width: '48%' }}>
            <PropertyCard property={item} onPress={() => router.push(`/property/${item.id}`)} />
          </View>
        )}
        ListEmptyComponent={
          <View style={[styles.empty, { backgroundColor: theme.colors.surfaceSoft, marginHorizontal: 20 }]}>
            <Text style={[theme.type.body, { color: theme.colors.inkSecondary, textAlign: 'center' }]}>
              Ketuk ikon hati pada properti untuk menyimpannya di sini.
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={{ marginTop: 12 }}>
            {recent.length > 0 ? (
              <View style={{ marginBottom: 20 }}>
                <SectionHeader title="Baru dilihat" subtitle={`${recent.length} properti`} />
                <FlatList
                  data={recent}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(p) => p.id}
                  contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                  renderItem={({ item }) => (
                    <View style={{ width: 160 }}>
                      <PropertyCard property={item} onPress={() => router.push(`/property/${item.id}`)} />
                    </View>
                  )}
                />
              </View>
            ) : null}

            {watchedAlerts.length > 0 ? (
              <View style={{ marginBottom: 20 }}>
                <SectionHeader title="Harga turun" subtitle={`${watchedAlerts.length} properti yang kamu pantau`} />
                <View style={{ paddingHorizontal: 20, gap: 10 }}>
                  {watchedAlerts.map((a) => {
                    const p = getPropertyById(a.propertyId);
                    if (!p) return null;
                    return (
                      <Pressable
                        key={a.propertyId}
                        onPress={() => router.push(`/property/${p.id}`)}
                        style={[styles.row, { backgroundColor: theme.colors.brandSoft, borderColor: theme.colors.brand }]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[theme.type.bodyStrong, { color: theme.colors.brandInk }]} numberOfLines={1}>
                            {p.title}
                          </Text>
                          <Text style={[theme.type.caption, { color: theme.colors.brandInk, marginTop: 2 }]}>
                            {formatIDR(a.fromPrice)} → {formatIDR(a.toPrice)}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <SectionHeader title="Shortlist bersama" subtitle={`${shortlists.length} koleksi`} />
            <View style={{ paddingHorizontal: 20, gap: 10 }}>
              <View style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <TextInput
                  value={newShortlistName}
                  onChangeText={setNewShortlistName}
                  placeholder="Nama shortlist baru, mis. Rumah impian kami"
                  placeholderTextColor={theme.colors.inkTertiary}
                  style={[theme.type.body, { flex: 1, color: theme.colors.inkPrimary }]}
                  onSubmitEditing={addShortlist}
                />
                <Pressable onPress={addShortlist} hitSlop={8}>
                  <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>Buat</Text>
                </Pressable>
              </View>
              {shortlists.map((sl) => (
                <Pressable
                  key={sl.id}
                  onPress={() => router.push(`/shortlist/${sl.id}`)}
                  style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{sl.name}</Text>
                    <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]}>
                      {sl.propertyIds.length} properti · bisa dibagikan
                    </Text>
                  </View>
                  <Text style={{ color: theme.colors.inkTertiary, fontSize: 16 }}>›</Text>
                </Pressable>
              ))}
            </View>

            <View style={{ marginTop: 20 }}>
              <SectionHeader title="Pencarian tersimpan" subtitle={`${savedSearches.length} pencarian`} />
            {savedSearches.length === 0 ? (
              <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, paddingHorizontal: 20 }]}>
                Simpan pencarian dari layar Cari untuk mendapat notifikasi saat ada yang cocok.
              </Text>
            ) : (
              <View style={{ paddingHorizontal: 20, gap: 10 }}>
                {savedSearches.map((s) => (
                  <View key={s.id} style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{s.label}</Text>
                      <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]}>
                        {s.notify ? 'Notifikasi aktif' : 'Notifikasi nonaktif'}
                      </Text>
                    </View>
                    <Pressable onPress={() => removeSavedSearch(s.id)} hitSlop={8}>
                      <Text style={{ color: theme.colors.inkTertiary, fontSize: 16 }}>✕</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            </View>

            {hidden.length > 0 ? (
              <View style={{ marginTop: 20 }}>
                <SectionHeader title="Disembunyikan" subtitle={`${hidden.length} properti`} />
                <View style={{ paddingHorizontal: 20, gap: 10 }}>
                  {hidden.map((p) => (
                    <View key={p.id} style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]} numberOfLines={1}>
                          {p.title}
                        </Text>
                        <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]}>
                          {p.area}, {p.city}
                        </Text>
                      </View>
                      <Pressable onPress={() => toggleHidden(p.id)} hitSlop={8}>
                        <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>Tampilkan</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={{ marginTop: 20 }}>
              <SectionHeader title="Simulasi KPR" subtitle={`${kprScenarios.length} skenario tersimpan`} />
              {kprScenarios.length === 0 ? (
                <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, paddingHorizontal: 20 }]}>
                  Simpan hasil simulasi KPR untuk membandingkannya nanti.
                </Text>
              ) : (
                <View style={{ paddingHorizontal: 20, gap: 10 }}>
                  {kprScenarios.map((s) => (
                    <View key={s.id} style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{s.label}</Text>
                        <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]}>
                          {formatIDR(s.monthlyInstallment)}/bulan · DP {s.downPaymentPercent}% · {s.tenorYears} thn
                        </Text>
                      </View>
                      <Pressable onPress={() => removeKprScenario(s.id)} hitSlop={8}>
                        <Text style={{ color: theme.colors.inkTertiary, fontSize: 16 }}>✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { borderRadius: 20, padding: 28, alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
