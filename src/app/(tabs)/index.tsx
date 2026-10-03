import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { SectionHeader } from '../../components/SectionHeader';
import { PropertyCard } from '../../components/PropertyCard';
import { DataStatus } from '../../components/DataStatus';
import { getPopularAreas } from '../../data/properties';
import { fetchProperties, fetchProjects } from '../../data/repository';
import { formatIDR } from '../../lib/format';
import { useAppStore, SearchIntent } from '../../store/useAppStore';
import { useAuth } from '../../auth/AuthProvider';
import { useTranslate, type StringKey } from '../../lib/i18n';

function timeGreetingKey(): StringKey {
  const hour = new Date().getHours();
  if (hour < 11) return 'greetingMorning';
  if (hour < 15) return 'greetingAfternoon';
  if (hour < 19) return 'greetingEvening';
  return 'greetingNight';
}

const INTENTS: { key: SearchIntent; labelKey: StringKey }[] = [
  { key: 'buy', labelKey: 'intentBuy' },
  { key: 'rent', labelKey: 'intentRent' },
  { key: 'new-projects', labelKey: 'intentNewProjects' },
];

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useTranslate();
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
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
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
        <View style={{ flex: 1 }}>
          <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>{t(timeGreetingKey())},</Text>
          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary }]}>{firstName || t('welcomeGuest')}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Buka profil" onPress={() => router.push('/(tabs)/profile')} style={[styles.avatar, { backgroundColor: theme.colors.inkPrimary }]}>
          <Text style={[theme.type.bodyStrong, { color: theme.colors.surface }]}>{firstName?.charAt(0).toUpperCase() || 'H'}</Text>
        </Pressable>
      </View>
      <View style={styles.intro}>
        <Text style={[theme.type.title, { color: theme.colors.inkPrimary }]}>{t('homeIntroTitle')}</Text>
        <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 4 }]}>{t('homeIntroSubtitle')}</Text>
      </View>

      {syncError ? <DataStatus message={`${t('workspaceNotSynced')}: ${syncError}`} /> : null}
      {propertiesError || projectsError ? (
        <DataStatus
          message={t('catalogLoadError')}
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
          {t('homeSearchPlaceholder')}
        </Text>
        <View style={[styles.searchAction, { backgroundColor: theme.colors.inkPrimary }]}><Feather name="arrow-up-right" size={18} color={theme.colors.surface} /></View>
      </Pressable>

      <View style={[styles.intentRow, { backgroundColor: theme.colors.surfaceSoft }]}>
        {INTENTS.map((item) => (
          <Pressable key={item.key} onPress={() => setIntent(item.key)} accessibilityRole="tab" accessibilityState={{ selected: intent === item.key }} style={[styles.intentTab, intent === item.key && { backgroundColor: theme.colors.inkPrimary }]}>
            <Text style={[theme.type.captionStrong, { color: intent === item.key ? theme.colors.surface : theme.colors.inkSecondary }]}>{t(item.labelKey)}</Text>
          </Pressable>
        ))}
      </View>

      {intent !== 'new-projects' && popularAreas.length > 0 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.areaChips}>
        <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/search')} style={[styles.areaChip, { backgroundColor: theme.colors.inkPrimary }]}><Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>{t('allAreas')}</Text></Pressable>
        {popularAreas.slice(0, 5).map((area) => <Pressable key={area.id} accessibilityRole="button" onPress={() => router.push(`/(tabs)/search?q=${encodeURIComponent(area.name)}`)} style={[styles.areaChip, { backgroundColor: theme.colors.surface }]}>
          <Feather name="map-pin" size={13} color={theme.colors.inkTertiary} /><Text style={[theme.type.caption, { color: theme.colors.inkSecondary }]}>{area.name}</Text>
        </Pressable>)}
      </ScrollView> : null}

      {(intent === 'new-projects' ? featuredProject : featuredProperty) ? (
        <View style={styles.featureSection}>
          <SectionHeader title={intent === 'new-projects' ? t('projectsToExplore') : t('recommendedForYou')} actionLabel={t('seeAll')} onAction={() => router.push('/(tabs)/search')} />
          {intent === 'new-projects' && featuredProject ? (
            <Pressable onPress={() => router.push(`/project/${featuredProject.id}`)} style={[styles.featureProject, { backgroundColor: theme.colors.surface }]}>
              <Image source={{ uri: featuredProject.images[0] }} style={styles.featureProjectImage} contentFit="cover" />
              <View style={styles.featureProjectBody}>
                <Text style={[theme.type.micro, { color: theme.colors.brandInk }]}>{featuredProject.developerConnected ? t(featuredProject.progressPercent >= 100 ? 'projectReadyBadge' : 'projectBuildingBadge') : `DATA CONTOH · ${t(featuredProject.progressPercent >= 100 ? 'projectReadyBadge' : 'projectBuildingBadge')}`}</Text>
                <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 6 }]}>{featuredProject.name}</Text>
                <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 3 }]}>{featuredProject.area}, {featuredProject.city} · {featuredProject.developer}</Text>
                <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary, marginTop: 7 }]}>{featuredProject.units.reduce((sum, unit) => sum + unit.available, 0)} {t('unitsAvailable')} · {featuredProject.units.length} {t('unitTypeCount')}</Text>
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
          <Text style={[theme.type.bodyStrong, { color: theme.colors.surface }]}>{intent === 'rent' ? t('kprBannerRentTitle') : t('kprBannerBuyTitle')}</Text>
          <Text style={[theme.type.caption, { color: 'rgba(255,255,255,0.7)', marginTop: 4 }]}>
            {intent === 'rent' ? t('kprBannerRentSubtitle') : t('kprBannerBuySubtitle')}
          </Text>
        </View>
        <Feather name="arrow-right" size={20} color={theme.colors.brand} />
      </Pressable> : null}

      {intent !== 'new-projects' && recommended.length > 1 ? <View style={{ marginTop: 30 }}>
        <SectionHeader title={t('continueExploring')} subtitle={t('otherOptionsToCompare')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railPad}>
          {recommended.slice(1, 4).map((p) => (
            <PropertyCard key={p.id} property={p} onPress={() => router.push(`/property/${p.id}`)} />
          ))}
        </ScrollView>
      </View> : null}

      {intent !== 'new-projects' && popularAreas.length > 0 ? <View style={{ marginTop: 28 }}>
        <SectionHeader title={t('exploreAreas')} subtitle={t('areasWithAvailableProperties')} />
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
        <SectionHeader title={t('newProjects')} subtitle={t('fromVerifiedDevelopers')} />
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
                  {proj.units.length ? `${t('startingFrom')} ${formatIDR(Math.min(...proj.units.map((u) => u.priceFrom)))}` : t('unitPriceUnavailable')}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View> : null}
    </ScrollView>
    <View pointerEvents="none" style={[styles.statusBarSurface, { height: insets.top, backgroundColor: theme.colors.canvas }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  statusBarSurface: { position: 'absolute', top: 0, left: 0, right: 0 },
  header: { paddingHorizontal: 24, marginBottom: 14, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  intro: { paddingHorizontal: 24, marginBottom: 16 },
  intentRow: {
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: 24,
    padding: 4,
    borderRadius: 18,
    marginTop: 16,
    marginBottom: 14,
  },
  intentTab: { flex: 1, minHeight: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  areaChips: { paddingHorizontal: 24, gap: 8, paddingBottom: 4 },
  areaChip: { minHeight: 36, paddingHorizontal: 14, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 6 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    paddingLeft: 16,
    paddingRight: 8,
    minHeight: 60,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchAction: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  featureSection: { marginTop: 24 },
  featureProperty: { marginHorizontal: 24 },
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
