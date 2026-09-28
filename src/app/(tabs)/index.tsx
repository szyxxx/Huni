import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { Chip } from '../../components/Chip';
import { SectionHeader } from '../../components/SectionHeader';
import { PropertyCard } from '../../components/PropertyCard';
import { properties, popularAreas } from '../../data/properties';
import { useAppStore, SearchIntent } from '../../store/useAppStore';

const INTENTS: { key: SearchIntent; label: string }[] = [
  { key: 'buy', label: 'Beli' },
  { key: 'rent', label: 'Sewa' },
  { key: 'new-projects', label: 'Proyek Baru' },
];

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const intent = useAppStore((s) => s.intent);
  const setIntent = useAppStore((s) => s.setIntent);

  const recommended = properties.filter((p) => p.fitReason);
  const newProjects = properties.filter((p) => p.verification === 'official_developer');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>Selamat datang,</Text>
          <Text style={[theme.type.title, { color: theme.colors.inkPrimary }]}>Cari rumah yang pas untukmu</Text>
        </View>
      </View>

      <View style={styles.intentRow}>
        {INTENTS.map((item) => (
          <Chip key={item.key} label={item.label} selected={intent === item.key} onPress={() => setIntent(item.key)} />
        ))}
      </View>

      <Pressable
        onPress={() => router.push('/(tabs)/search')}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      >
        <Text style={{ fontSize: 16, color: theme.colors.inkTertiary }}>⌕</Text>
        <Text style={[theme.type.body, { color: theme.colors.inkTertiary, marginLeft: 8 }]}>
          "rumah 3 kamar dekat ITB cicilan 8 juta"
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/kpr')}
        style={[styles.kprBanner, { backgroundColor: theme.colors.inkPrimary }]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[theme.type.bodyStrong, { color: theme.colors.surface }]}>Cek keterjangkauan KPR</Text>
          <Text style={[theme.type.caption, { color: 'rgba(255,255,255,0.7)', marginTop: 4 }]}>
            Cari berdasarkan cicilan bulanan yang nyaman untukmu
          </Text>
        </View>
        <Text style={{ color: theme.colors.brand, fontSize: 22 }}>→</Text>
      </Pressable>

      <View style={{ marginTop: 28 }}>
        <SectionHeader title="Rekomendasi untukmu" subtitle="Berdasarkan preferensi dan riwayat pencarian" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railPad}>
          {recommended.map((p) => (
            <PropertyCard key={p.id} property={p} onPress={() => router.push(`/property/${p.id}`)} />
          ))}
        </ScrollView>
      </View>

      <View style={{ marginTop: 28 }}>
        <SectionHeader title="Area populer" subtitle="Yang paling banyak dicari minggu ini" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railPad}>
          {popularAreas.map((a) => (
            <Pressable key={a.id} style={styles.areaCard} onPress={() => router.push('/(tabs)/search')}>
              <Image source={{ uri: a.image }} style={styles.areaImage} contentFit="cover" />
              <View style={styles.areaOverlay}>
                <Text style={[theme.type.bodyStrong, { color: '#fff' }]}>{a.name}</Text>
                <Text style={[theme.type.caption, { color: 'rgba(255,255,255,0.85)' }]}>
                  {a.count} properti · {a.vibe}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={{ marginTop: 28 }}>
        <SectionHeader title="Proyek baru" subtitle="Dari developer resmi terverifikasi" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railPad}>
          {newProjects.map((p) => (
            <PropertyCard key={p.id} property={p} onPress={() => router.push(`/property/${p.id}`)} />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  intentRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  kprBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 18,
    borderRadius: 20,
  },
  railPad: {
    paddingHorizontal: 20,
    gap: 14,
  },
  areaCard: {
    width: 160,
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
  },
  areaImage: {
    width: '100%',
    height: '100%',
  },
  areaOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
});
