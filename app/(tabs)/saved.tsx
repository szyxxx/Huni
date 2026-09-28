import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeProvider';
import { PropertyCard } from '../../src/components/PropertyCard';
import { SectionHeader } from '../../src/components/SectionHeader';
import { properties } from '../../src/data/properties';
import { useAppStore } from '../../src/store/useAppStore';

export default function SavedScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const savedIds = useAppStore((s) => s.savedIds);
  const saved = properties.filter((p) => savedIds.has(p.id));

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas, paddingTop: insets.top + 12 }}>
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <Text style={[theme.type.title, { color: theme.colors.inkPrimary }]}>Workspace kamu</Text>
        <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 4 }]}>
          Properti tersimpan, pencarian, dan simulasi KPR
        </Text>
      </View>
      <SectionHeader title="Properti tersimpan" subtitle={`${saved.length} properti`} />
      <FlatList
        data={saved}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 14, paddingHorizontal: 20 }}
        contentContainerStyle={{ gap: 14, paddingBottom: 140 }}
        renderItem={({ item }) => (
          <View style={{ width: '48%' }}>
            <PropertyCard property={item} onPress={() => router.push(`/property/${item.id}`)} />
          </View>
        )}
        ListEmptyComponent={
          <View style={[styles.empty, { backgroundColor: theme.colors.surfaceSoft }]}>
            <Text style={[theme.type.body, { color: theme.colors.inkSecondary, textAlign: 'center' }]}>
              Ketuk ikon hati pada properti untuk menyimpannya di sini.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
});
