import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { Chip } from '../../components/Chip';
import { SectionHeader } from '../../components/SectionHeader';
import { PropertyCard } from '../../components/PropertyCard';
import { DataStatus } from '../../components/DataStatus';
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
  const syncError = useAppStore((s) => s.syncError);
  const { user } = useAuth();
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0];

  const { data: properties = [], error: propertiesError, isFetching: loadingProperties, refetch: refetchProperties } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
  });
  const { data: projects = [], error: projectsError, isFetching: loadingProjects, refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });
  const visibleProperties = properties.filter((p) => !hiddenIds.has(p.id));
  const recommended = visibleProperties.filter((p) => p.intent === (intent === 'rent' ? 'rent' : 'buy') && (p.fitReason || p.nearby?.length));
  const featuredProperty = recommended[0] ?? visibleProperties.find((p) => p.intent === (intent === 'rent' ? 'rent' : 'buy'));
  const featuredProject = projects[0];
  const popularAreas = getPopularAreas(visibleProperties.filter((p) => p.intent === (intent === 'rent' ? 'rent' : 'buy')));

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
          <Text style={[theme.type.display, { color: theme.colors.inkPrimary, marginTop: 6 }]}>Temukan tempat yang terasa tepat.</Text>
        </View>
      </View>

      {syncError ? <DataStatus message={`Workspace belum tersinkron: ${syncError}`} /> : null}
      {propertiesError || projectsError ? (
        <DataStatus
          message="Katalog belum dapat dimuat. Periksa koneksi lalu coba lagi."
          onRetry={() => { void refetchProperties(); void refetchProjects(); }}
        />
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Buka pencarian properti"
        onPress={() => router.push({ pathname: '/(tabs)/search', params: { compose: String(Date.now()) } })}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      >
        <Feather name="search" size={18} color={theme.colors.inkTertiary} />
        <Text style={[theme.type.body, { flex: 1, marginLeft: 10, color: theme.colors.inkSecondary }]} numberOfLines={1}>
          Area, tipe, atau ceritakan kebutuhanmu
        </Text>
        <Feather name="arrow-up-right" size={17} color={theme.colors.inkPrimary} />
      </Pressable>
      <Pressable onPress={() => router.push({ pathname: '/(tabs)/search', params: { q: 'rumah 3 kamar dekat ITB cicilan 8 juta' } })} style={styles.exampleRow}>
        <Text style={[theme.type.caption, { color: theme.colors.inkSecondary }]}>Coba “rumah 3 kamar dekat ITB cicilan 8 juta”</Text>
        <Feather name="arrow-right" size={14} color={theme.colors.brandInk} />
      </Pressable>

      <View style={styles.intentRow}>
        {INTENTS.map((item) => (
          <Chip key={item.key} label={item.label} selected={intent === item.key} onPress={() => setIntent(item.key)} />
        ))}
      </View>

      {(intent === 'new-projects' ? featuredProject : featuredProperty) ? (
        <View style={styles.featureSection}>
          <SectionHeader title={intent === 'new-projects' ? 'Proyek untuk dijelajahi' : 'Pilihan untukmu'} actionLabel="Lihat semua" onAction={() => router.push('/(tabs)/search')} />
          {intent === 'new-projects' && featuredProject ? (
            <Pressable onPress={() => router.push(`/project/${featuredProject.id}`)} style={[styles.featureProject, { backgroundColor: theme.colors.surface }]}>
              <Image source={{ uri: featuredProject.images[0] }} style={styles.featureProjectImage} contentFit="cover" />
              <View style={styles.featureProjectBody}>
                <Text style={[theme.type.micro, { color: theme.colors.brandInk }]}>PROYEK BARU · {featuredProject.progressPercent}% SELESAI</Text>
                <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 6 }]}>{featuredProject.name}</Text>
                <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 3 }]}>{featuredProject.area}, {featuredProject.city} · {featuredProject.developer}</Text>
              </View>
            </Pressable>
          ) : featuredProperty ? (
            <View style={styles.featureProperty}>
              <PropertyCard layout="feature" property={featuredProperty} onPress={() => router.push(`/property/${featuredProperty.id}`)} />
            </View>
          ) : null}
        </View>
      ) : null}

      {intent !== 'new-projects' ? <Pressable
        onPress={() => router.push(intent === 'rent' ? '/(tabs)/search' : '/kpr')}
        style={[styles.kprBanner, { backgroundColor: theme.colors.inkPrimary }]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[theme.type.bodyStrong, { color: theme.colors.surface }]}>{intent === 'rent' ? 'Cari sewa sesuai anggaran' : 'Cek keterjangkauan KPR'}</Text>
          <Text style={[theme.type.caption, { color: 'rgba(255,255,255,0.7)', marginTop: 4 }]}>
            {intent === 'rent' ? 'Bandingkan biaya bulanan dan tempat yang pas' : 'Cari berdasarkan cicilan bulanan yang nyaman untukmu'}
          </Text>
        </View>
        <Feather name="arrow-right" size={20} color={theme.colors.brand} />
      </Pressable> : null}

      {intent !== 'new-projects' && recommended.length > 1 ? <View style={{ marginTop: 30 }}>
        <SectionHeader title="Lanjut jelajahi" subtitle="Pilihan lain untuk dibandingkan" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railPad}>
          {recommended.slice(1, 4).map((p) => (
            <PropertyCard key={p.id} property={p} onPress={() => router.push(`/property/${p.id}`)} />
          ))}
        </ScrollView>
      </View> : null}

      {intent !== 'new-projects' && popularAreas.length > 0 ? <View style={{ marginTop: 28 }}>
        <SectionHeader title="Jelajahi area" subtitle="Area dengan properti yang tersedia" />
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
      </View> : null}

      {intent === 'buy' ? <View style={{ marginTop: 28 }}>
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
                  {proj.units.length ? `mulai ${formatIDR(Math.min(...proj.units.map((u) => u.priceFrom)))}` : 'Harga unit belum tersedia'}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View> : null}
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
    minHeight: 60,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  exampleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 24, paddingTop: 10 },
  featureSection: { marginTop: 30 },
  featureProperty: { marginHorizontal: 20 },
  featureProject: { marginHorizontal: 20, borderRadius: 20, overflow: 'hidden' },
  featureProjectImage: { width: '100%', height: 250 },
  featureProjectBody: { padding: 20 },
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
