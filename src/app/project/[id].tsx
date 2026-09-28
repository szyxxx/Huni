import React from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeProvider';
import { GlassSurface } from '../../components/GlassSurface';
import { fetchProjectById } from '../../data/repository';
import { formatIDR } from '../../lib/format';

/** Developer/project detail (PRD §7.5, §8.1): cluster/unit types, progress, promo, POI. */
export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProjectById(id),
    enabled: Boolean(id),
  });

  if (!project) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.canvas }]}>
        <Text style={[theme.type.body, { color: theme.colors.inkSecondary }]}>
          {isLoading ? 'Memuat…' : 'Proyek tidak ditemukan.'}
        </Text>
      </View>
    );
  }

  const requestBrochure = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const text = encodeURIComponent(`Halo, saya minta brosur dan info unit untuk proyek "${project.name}" di Huni.`);
    Linking.openURL(`https://wa.me/6281200000000?text=${text}`).catch(() => {});
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
                <Text style={{ fontSize: 18, color: theme.colors.inkPrimary }}>←</Text>
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
            {project.developer} · {project.area}, {project.city}
          </Text>

          {project.promo ? (
            <View style={[styles.promoBanner, { backgroundColor: theme.colors.inkPrimary }]}>
              <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>{project.promo}</Text>
            </View>
          ) : null}

          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 24 }]}>
            Progres pembangunan
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceSoft }]}>
            <View style={[styles.progressFill, { width: `${project.progressPercent}%`, backgroundColor: theme.colors.brand }]} />
          </View>
          <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 6 }]}>
            {project.progressLabel} · {project.progressPercent}%
          </Text>

          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 24 }]}>Tipe unit</Text>
          <View style={{ marginTop: 10, gap: 10 }}>
            {project.units.map((u) => (
              <View key={u.id} style={[styles.unitRow, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{u.name}</Text>
                  <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]}>
                    {u.bedrooms} KT · {u.bathrooms} KM · {u.buildingArea} m² · {u.available} unit tersedia
                  </Text>
                </View>
                <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>
                  mulai {formatIDR(u.priceFrom)}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 24 }]}>Fasilitas</Text>
          <View style={styles.facilityWrap}>
            {project.facilities.map((f) => (
              <View key={f} style={[styles.facilityChip, { backgroundColor: theme.colors.surfaceSoft }]}>
                <Text style={[theme.type.caption, { color: theme.colors.inkSecondary }]}>{f}</Text>
              </View>
            ))}
          </View>

          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 24 }]}>Lokasi & sekitar</Text>
          {project.nearby.map((n) => (
            <Text key={n.label} style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 4 }]}>
              🚗 {n.minutes} menit dari {n.label.toLowerCase()}
            </Text>
          ))}
        </View>
      </ScrollView>

      <GlassSurface style={[styles.contactBar, { paddingBottom: insets.bottom + 12 }]} intensity={60}>
        <View style={{ flex: 1 }}>
          <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>Mulai dari</Text>
          <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>
            {formatIDR(Math.min(...project.units.map((u) => u.priceFrom)))}
          </Text>
        </View>
        <Pressable onPress={requestBrochure} style={[styles.contactBtn, { backgroundColor: theme.colors.inkPrimary }]}>
          <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>Minta brosur</Text>
        </Pressable>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: { position: 'absolute', left: 16 },
  circleBtnWrap: { width: 40, height: 40, borderRadius: 20 },
  circleBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20, paddingTop: 18 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  promoBanner: { marginTop: 14, padding: 14, borderRadius: 12 },
  progressTrack: { height: 8, borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  unitRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  facilityWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  facilityChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
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
