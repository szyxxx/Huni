import React, { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Pressable, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { Chip } from '../../components/Chip';
import { SectionHeader } from '../../components/SectionHeader';
import { PropertyCard } from '../../components/PropertyCard';
import { getPopularAreas } from '../../data/properties';
import { fetchProperties, fetchProjects } from '../../data/repository';
import { formatIDR } from '../../lib/format';
import { useAppStore, SearchIntent } from '../../store/useAppStore';
import { useAuth } from '../../auth/AuthProvider';

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

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
  const hiddenIds = useAppStore((s) => s.hiddenIds);
  const { user } = useAuth();
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0];

  const { data: properties = [], isFetching: loadingProperties, refetch: refetchProperties } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
  });
  const { data: projects = [], isFetching: loadingProjects, refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });
  const visibleProperties = properties.filter((p) => !hiddenIds.has(p.id));
  const recommended = visibleProperties.filter((p) => p.fitReason || p.nearby?.length);
  const popularAreas = useMemo(() => getPopularAreas(visibleProperties), [visibleProperties]);
  const [homeQuery, setHomeQuery] = useState('');

  const submitHomeQuery = () => {
    router.push({ pathname: '/(tabs)/search', params: homeQuery.trim() ? { q: homeQuery } : {} });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loadingProperties || loadingProjects}
          onRefresh={() => {
            refetchProperties();
            refetchProjects();
          }}
          tintColor={theme.colors.inkTertiary}
        />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>
            {timeGreeting()}{firstName ? `, ${firstName}` : ''}
          </Text>
          <Text style={[theme.type.title, { color: theme.colors.inkPrimary }]}>Cari rumah yang pas untukmu</Text>
        </View>
      </View>

      <View style={styles.intentRow}>
        {INTENTS.map((item) => (
          <Chip key={item.key} label={item.label} selected={intent === item.key} onPress={() => setIntent(item.key)} />
        ))}
      </View>

      <View style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Feather name="search" size={18} color={theme.colors.inkTertiary} />
        <TextInput
          value={homeQuery}
          onChangeText={setHomeQuery}
          onSubmitEditing={submitHomeQuery}
          onFocus={() => { if (!homeQuery) router.push('/(tabs)/search'); }}
          placeholder='"rumah 3 kamar dekat ITB cicilan 8 juta"'
          placeholderTextColor={theme.colors.inkTertiary}
          returnKeyType="search"
          style={[theme.type.body, { flex: 1, marginLeft: 8, color: theme.colors.inkPrimary }]}
        />
      </View>

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
        <Feather name="arrow-right" size={20} color={theme.colors.brand} />
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
            <Pressable
              key={a.id}
              style={styles.areaCard}
              onPress={() => router.push(`/(tabs)/search?q=${encodeURIComponent(a.name)}`)}
            >
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
          {projects.map((proj) => (
            <Pressable key={proj.id} style={styles.projectCard} onPress={() => router.push(`/project/${proj.id}`)}>
              <Image source={{ uri: proj.images[0] }} style={styles.projectImage} contentFit="cover" />
              <View style={{ paddingTop: 10 }}>
                <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]} numberOfLines={1}>
                  {proj.name}
                </Text>
                <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]} numberOfLines={1}>
                  {proj.developer} · {proj.area}
                </Text>
                <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 4 }]}>
                  mulai {formatIDR(Math.min(...proj.units.map((u) => u.priceFrom)))}
                </Text>
              </View>
            </Pressable>
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
  projectCard: { width: 220 },
  projectImage: { width: '100%', height: 150, borderRadius: 16 },
});
