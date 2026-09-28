import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeProvider';
import { PropertyCard } from '../../src/components/PropertyCard';
import { SectionHeader } from '../../src/components/SectionHeader';
import { properties } from '../../src/data/properties';
import { useAppStore } from '../../src/store/useAppStore';
import { formatIDR } from '../../src/lib/format';

export default function SavedScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const savedIds = useAppStore((s) => s.savedIds);
  const savedSearches = useAppStore((s) => s.savedSearches);
  const removeSavedSearch = useAppStore((s) => s.removeSavedSearch);
  const kprScenarios = useAppStore((s) => s.kprScenarios);
  const removeKprScenario = useAppStore((s) => s.removeKprScenario);
  const saved = properties.filter((p) => savedIds.has(p.id));

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
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
