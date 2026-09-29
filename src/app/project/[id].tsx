import React from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { GlassSurface } from '../../components/GlassSurface';
import { Skeleton } from '../../components/Skeleton';
import { fetchProjectById } from '../../data/repository';
import { formatIDR } from '../../lib/format';
import { facilityIcon } from '../../lib/facilityIcon';
import { useAppStore } from '../../store/useAppStore';
import type { UnitType } from '../../data/projects';

const NO_CLUSTER = '__none__';

function groupByCluster(units: UnitType[]): [string, UnitType[]][] {
  const groups = new Map<string, UnitType[]>();
  for (const u of units) {
    const key = u.cluster ?? NO_CLUSTER;
    groups.set(key, [...(groups.get(key) ?? []), u]);
  }
  return Array.from(groups.entries());
}

/** Developer/project detail (PRD §7.5, §8.1): cluster/unit types, progress, promo, POI. */
export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setIntent = useAppStore((s) => s.setIntent);
  const { width } = useWindowDimensions();
  const { data: project, isLoading, error: projectError, refetch: refetchProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProjectById(id),
    enabled: Boolean(id),
  });

  if (!project) {
    if (isLoading) {
      return (
        <View style={{ flex: 1, backgroundColor: theme.colors.canvas, padding: 20, paddingTop: insets.top + 40 }}>
          <Skeleton height={260} radius={0} style={{ marginHorizontal: -20 }} />
          <Skeleton height={26} width="70%" style={{ marginTop: 20 }} />
          <Skeleton height={18} width="45%" style={{ marginTop: 10 }} />
          <Skeleton height={100} style={{ marginTop: 20 }} />
        </View>
      );
    }
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.canvas, paddingHorizontal: 28 }]}>
        <Feather name="home" size={26} color={theme.colors.inkSecondary} />
        <Text style={[theme.type.body, { color: theme.colors.inkSecondary, textAlign: 'center', marginTop: 16 }]}>
          {projectError ? 'Proyek belum dapat dimuat.' : 'Proyek tidak ditemukan.'}
        </Text>
        {projectError ? <Pressable onPress={() => { void refetchProject(); }} style={{ marginTop: 12 }}>
          <Text style={[theme.type.bodyStrong, { color: theme.colors.brandInk }]}>Coba lagi</Text>
        </Pressable> : null}
        <Pressable onPress={() => { setIntent('new-projects'); router.replace('/(tabs)/search'); }} style={{ marginTop: 18, minHeight: 44, justifyContent: 'center' }}>
          <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>Jelajahi proyek lain</Text>
        </Pressable>
      </View>
    );
  }

  const unitClusters = project ? groupByCluster(project.units) : [];
  const lowestPrice = project.units.length ? Math.min(...project.units.map((u) => u.priceFrom)) : null;

  const requestBrochure = () => {
    if (!project.contactPhone) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const text = encodeURIComponent(`Halo, saya minta brosur dan info unit untuk proyek "${project.name}" di Huni.`);
    Linking.openURL(`https://wa.me/${project.contactPhone}?text=${text}`).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <View>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {project.images.map((uri, i) => (
              <Image key={i} source={{ uri }} style={{ width, height: 260 }} contentFit="cover" />
            ))}
          </ScrollView>
          <View style={[styles.topBar, { top: insets.top + 8 }]}>
            <GlassSurface style={styles.circleBtnWrap}>
              <Pressable onPress={() => router.back()} style={styles.circleBtn}>
                <Feather name="arrow-left" size={18} color={theme.colors.inkPrimary} />
              </Pressable>
            </GlassSurface>
          </View>
        </View>

        <View style={styles.content}>
          {project.developerVerified ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.brandSoft }]}>
              <Text style={[theme.type.micro, { color: theme.colors.brandInk }]}>DEVELOPER RESMI</Text>
            </View>
          ) : null}
          <Text style={[theme.type.title, { color: theme.colors.inkPrimary, marginTop: 10 }]}>{project.name}</Text>
          <Text style={[theme.type.body, { color: theme.colors.inkSecondary, marginTop: 4 }]}>
            <Text
              style={{ textDecorationLine: 'underline', color: theme.colors.brandInk }}
              onPress={() => router.push({ pathname: '/developer/[name]', params: { name: project.developer } })}
            >
              {project.developer}
            </Text>
            {' · '}
            {project.area}, {project.city}
          </Text>

          {project.promo ? (
            <View style={[styles.promoBanner, { backgroundColor: theme.colors.inkPrimary }]}>
              <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>{project.promo}</Text>
            </View>
          ) : null}

          <View style={[styles.progressPanel, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.progressHeading}>
              <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>Progres pembangunan</Text>
              <Text style={[theme.type.title, { color: theme.colors.inkPrimary }]}>{project.progressPercent}%</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceSoft }]}>
              <View style={[styles.progressFill, { width: `${Math.max(0, Math.min(100, project.progressPercent))}%`, backgroundColor: theme.colors.brand }]} />
            </View>
            <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 10 }]}>{project.progressLabel}</Text>
          </View>

          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 24 }]}>Tipe unit</Text>
          {!unitClusters.length ? <Text style={[theme.type.body, { color: theme.colors.inkSecondary, marginTop: 10 }]}>Tipe unit belum tersedia untuk proyek ini.</Text> : null}
          {unitClusters.map(([cluster, units]) => (
            <View key={cluster} style={{ marginTop: 10 }}>
              {cluster !== NO_CLUSTER ? (
                <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary, marginBottom: 8 }]}>
                  {cluster}
                </Text>
              ) : null}
              <View style={{ gap: 10 }}>
                {units.map((u) => (
                  <View key={u.id} style={[styles.unitRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                    <View style={styles.unitHeading}>
                      <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary, flex: 1 }]}>{u.name}</Text>
                      <Text style={[theme.type.micro, { color: theme.colors.brandInk }]}>{u.available} TERSEDIA</Text>
                    </View>
                    <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 8 }]}>{u.bedrooms} kamar · {u.bathrooms} mandi · {u.buildingArea} m²</Text>
                    <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 12 }]}>Mulai {formatIDR(u.priceFrom)}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {project.facilities.length ? <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 28 }]}>Fasilitas</Text> : null}
          <View style={styles.facilityWrap}>
            {project.facilities.map((f) => (
              <View key={f} style={styles.facilityItem}>
                <View style={[styles.facilityIcon, { backgroundColor: theme.colors.surfaceSoft }]}>
                  <Feather name={facilityIcon(f)} size={17} color={theme.colors.inkPrimary} />
                </View>
                <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary, flex: 1 }]}>{f}</Text>
              </View>
            ))}
          </View>

          {project.nearby.length ? <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 28 }]}>Lokasi & sekitar</Text> : null}
          {project.nearby.map((n) => (
            <View key={n.label} style={styles.nearbyRow}>
              <Feather name="navigation" size={14} color={theme.colors.brandInk} />
              <Text style={[theme.type.caption, { color: theme.colors.inkSecondary }]}>{n.minutes} menit dari {n.label.toLowerCase()}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <GlassSurface style={[styles.contactBar, { paddingBottom: insets.bottom + 12 }]} intensity={60}>
        <View style={{ flex: 1 }}>
          <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>Mulai dari</Text>
          <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>
            {lowestPrice === null ? 'Harga belum tersedia' : formatIDR(lowestPrice)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={project.contactPhone ? requestBrochure : () => router.push({ pathname: '/developer/[name]', params: { name: project.developer } })}
          style={[styles.contactBtn, { backgroundColor: theme.colors.inkPrimary }]}
        >
          <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>
            {project.contactPhone ? 'Minta brosur' : 'Lihat developer'}
          </Text>
        </Pressable>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: { position: 'absolute', left: 16 },
  circleBtnWrap: { width: 48, height: 48, borderRadius: 24 },
  circleBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 24, paddingTop: 20 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  promoBanner: { marginTop: 14, padding: 14, borderRadius: 12 },
  progressPanel: { marginTop: 24, borderRadius: 20, padding: 20 },
  progressHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressTrack: { height: 8, borderRadius: 4, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  unitRow: { padding: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  unitHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  facilityWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  facilityItem: { width: '47%', minWidth: 138, flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 44 },
  facilityIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  nearbyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  contactBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  contactBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
});
