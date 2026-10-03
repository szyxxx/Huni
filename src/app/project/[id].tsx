import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { GlassSurface } from '../../components/GlassSurface';
import { Skeleton } from '../../components/Skeleton';
import { fetchProjectById } from '../../data/repository';
import { formatIDR } from '../../lib/format';
import { facilityIcon } from '../../lib/facilityIcon';
import { useAppStore } from '../../store/useAppStore';
import { useAuth } from '../../auth/AuthProvider';
import { clearDemoProjectInquiry, createProjectInquiry, getDemoProjectInquiry, getMyProjectInquiry, saveDemoProjectInquiry, type InquiryKind } from '../../lib/projectInquiries';
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryEditing, setInquiryEditing] = useState(false);
  const [inquiryKind, setInquiryKind] = useState<InquiryKind>('availability');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [inquiryBusy, setInquiryBusy] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);
  const { data: project, isLoading, error: projectError, refetch: refetchProject } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProjectById(id),
    enabled: Boolean(id),
  });
  const { data: myInquiry } = useQuery({
    queryKey: ['project-inquiry', id, user?.id, project?.developerConnected],
    queryFn: () => project?.developerConnected ? getMyProjectInquiry(id, user!.id) : getDemoProjectInquiry(id),
    enabled: Boolean(id && project && (!project.developerConnected || user)),
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
  const availableUnits = project.units.reduce((sum, unit) => sum + unit.available, 0);
  const selectedUnit = project.units.find((unit) => unit.id === selectedUnitId) ?? project.units.find((unit) => unit.available > 0) ?? project.units[0];

  const requestBrochure = () => {
    if (!project.contactPhone) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const unitDetail = selectedUnit ? `, khususnya ${selectedUnit.name} (mulai ${formatIDR(selectedUnit.priceFrom)})` : '';
    const text = encodeURIComponent(`Halo, saya minta brosur dan info unit untuk hunian "${project.name}"${unitDetail} di Huni. Apakah masih tersedia?`);
    Linking.openURL(`https://wa.me/${project.contactPhone}?text=${text}`).catch(() => {});
  };

  const openInquiry = () => {
    if (project.developerConnected && !user) {
      router.push('/sign-in');
      return;
    }
    if (myInquiry) {
      setContactName(myInquiry.contactName);
      setContactPhone(myInquiry.contactPhone);
      setInquiryKind(myInquiry.kind);
    }
    setInquiryError(null);
    setInquiryEditing(false);
    setInquiryOpen(true);
  };

  const submitInquiry = async () => {
    if (!selectedUnit || inquiryBusy) return;
    if (project.developerConnected && !user) {
      setInquiryError('Masuk ke akunmu sebelum mengirim minat.');
      return;
    }
    setInquiryBusy(true);
    setInquiryError(null);
    try {
      const details = {
        projectId: project.id,
        unitName: selectedUnit.name,
        kind: inquiryKind,
        contactName,
        contactPhone,
      };
      const saved = project.developerConnected
        ? await createProjectInquiry(details, user!.id)
        : await saveDemoProjectInquiry(details);
      queryClient.setQueryData(['project-inquiry', id, user?.id, project.developerConnected], saved);
      setInquiryOpen(false);
      if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setInquiryError(error instanceof Error ? error.message : 'Permintaan belum tersimpan.');
    } finally {
      setInquiryBusy(false);
    }
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
          {project.developerVerified && project.developerConnected ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.brandSoft }]}>
              <Text style={[theme.type.micro, { color: theme.colors.brandInk }]}>DEVELOPER RESMI</Text>
            </View>
          ) : !project.developerConnected ? (
            <View style={[styles.badge, { backgroundColor: theme.colors.brandSoft }]}>
              <Text style={[theme.type.micro, { color: theme.colors.brandInk }]}>DATA CONTOH · DEVELOPER BELUM TERHUBUNG</Text>
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
              <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>{project.developerConnected ? project.promo : `Contoh promo · ${project.promo}`}</Text>
            </View>
          ) : null}

          <View style={[styles.inventoryPanel, { borderColor: theme.colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[theme.type.headline, { color: theme.colors.inkPrimary }]}>{project.units.length}</Text>
              <Text style={[theme.type.caption, { color: theme.colors.inkSecondary }]}>tipe hunian</Text>
            </View>
            <View style={[styles.inventoryDivider, { backgroundColor: theme.colors.border }]} />
            <View style={{ flex: 1, paddingLeft: 18 }}>
              <Text style={[theme.type.headline, { color: theme.colors.inkPrimary }]}>{availableUnits}</Text>
              <Text style={[theme.type.caption, { color: theme.colors.inkSecondary }]}>unit tersedia</Text>
            </View>
          </View>

          {myInquiry ? <View style={[styles.inquiryStatus, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Feather name="check-circle" size={20} color={theme.colors.brandInk} />
            <View style={{ flex: 1 }}>
              <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>Minatmu sudah tercatat</Text>
              <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 3 }]}>
                {myInquiry.unitName} · {project.developerConnected ? 'Dapat dilihat developer di Huni' : 'Simulasi tersimpan di perangkat ini; belum terkirim'}
              </Text>
              {!project.developerConnected ? <Pressable onPress={() => { void clearDemoProjectInquiry(project.id).then(() => queryClient.setQueryData(['project-inquiry', id, user?.id, project.developerConnected], null)); }} style={{ marginTop: 10 }}>
                <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>Hapus simulasi</Text>
              </Pressable> : null}
            </View>
          </View> : null}

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

          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 24 }]}>Pilih tipe hunian</Text>
          {unitClusters.length ? <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 4 }]}>Pilih tipe untuk melihat harga dan menanyakan ketersediaannya.</Text> : null}
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
                  <Pressable key={u.id} accessibilityRole="button" accessibilityState={{ selected: selectedUnit?.id === u.id, disabled: u.available <= 0 }} accessibilityLabel={`${u.name}, mulai ${formatIDR(u.priceFrom)}, ${u.available} unit tersedia`} disabled={u.available <= 0} onPress={() => setSelectedUnitId(u.id)} style={[styles.unitRow, { borderColor: selectedUnit?.id === u.id ? theme.colors.inkPrimary : theme.colors.border, backgroundColor: theme.colors.surface, opacity: u.available > 0 ? 1 : 0.55 }]}>
                    <View style={styles.unitHeading}>
                      <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary, flex: 1 }]}>{u.name}</Text>
                      {selectedUnit?.id === u.id ? <Feather name="check-circle" size={17} color={theme.colors.brandInk} /> : null}
                    </View>
                    <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 8 }]}>{u.bedrooms} kamar · {u.bathrooms} mandi · {u.buildingArea} m²</Text>
                    <View style={styles.unitFooter}>
                      <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, flex: 1 }]}>Mulai {formatIDR(u.priceFrom)}</Text>
                      <Text style={[theme.type.micro, { color: theme.colors.brandInk }]}>{u.available > 0 ? `${u.available} TERSEDIA` : 'HABIS'}</Text>
                    </View>
                  </Pressable>
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
          <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]} numberOfLines={1}>{selectedUnit?.name ?? 'Mulai dari'}</Text>
          <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>
            {selectedUnit ? formatIDR(selectedUnit.priceFrom) : lowestPrice === null ? 'Harga belum tersedia' : formatIDR(lowestPrice)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={openInquiry}
          style={[styles.contactBtn, { backgroundColor: theme.colors.inkPrimary }]}
        >
          <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>
            {myInquiry ? 'Tanya lagi' : 'Saya tertarik'}
          </Text>
        </Pressable>
      </GlassSurface>

      <Modal visible={inquiryOpen} transparent animationType="slide" onRequestClose={() => setInquiryOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.modalBackdrop, Platform.OS === 'android' && inquiryEditing && { justifyContent: 'flex-start', paddingTop: insets.top + 8 }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setInquiryOpen(false)} accessibilityLabel="Tutup formulir minat" />
          <ScrollView style={[styles.inquirySheet, { backgroundColor: theme.colors.surface, maxHeight: Platform.OS === 'android' && inquiryEditing ? '55%' : '85%' }]} contentContainerStyle={{ paddingBottom: insets.bottom + 28 }} keyboardShouldPersistTaps="handled">
            <View style={styles.sheetHeading}>
              <View style={{ flex: 1 }}>
                <Text style={[theme.type.headline, { color: theme.colors.inkPrimary }]}>Tanyakan hunian ini</Text>
                <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 4 }]}>{project.name} · {selectedUnit?.name ?? 'Tipe unit'}</Text>
              </View>
              <Pressable onPress={() => setInquiryOpen(false)} accessibilityRole="button" accessibilityLabel="Tutup" hitSlop={10}>
                <Feather name="x" size={22} color={theme.colors.inkPrimary} />
              </Pressable>
            </View>
            <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary, marginTop: 20 }]}>Apa yang ingin kamu ketahui?</Text>
            <View style={styles.inquiryOptions}>
              {([['availability', 'Ketersediaan'], ['brochure', 'Brosur & harga'], ['visit', 'Kunjungan']] as const).map(([kind, label]) => (
                <Pressable key={kind} onPress={() => setInquiryKind(kind)} accessibilityRole="radio" accessibilityState={{ selected: inquiryKind === kind }} style={[styles.inquiryOption, { backgroundColor: inquiryKind === kind ? theme.colors.inkPrimary : theme.colors.surfaceSoft }]}>
                  <Text style={[theme.type.micro, { color: inquiryKind === kind ? theme.colors.surface : theme.colors.inkPrimary }]}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary, marginTop: 18 }]}>Nama</Text>
            <TextInput value={contactName} onChangeText={setContactName} onFocus={() => setInquiryEditing(true)} autoComplete="name" placeholder="Nama lengkap" placeholderTextColor={theme.colors.inkTertiary} style={[styles.inquiryInput, theme.type.body, { color: theme.colors.inkPrimary, borderColor: theme.colors.border }]} />
            <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary, marginTop: 14 }]}>Nomor WhatsApp</Text>
            <TextInput value={contactPhone} onChangeText={setContactPhone} onFocus={() => setInquiryEditing(true)} keyboardType="phone-pad" autoComplete="tel" placeholder="08… atau +62…" placeholderTextColor={theme.colors.inkTertiary} style={[styles.inquiryInput, theme.type.body, { color: theme.colors.inkPrimary, borderColor: theme.colors.border }]} />
            <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 12 }]}>
              {project.developerConnected ? 'Dengan mengirim, nama dan nomor ini dapat dilihat developer proyek di Huni.' : 'Ini simulasi. Nama dan nomor disimpan hanya di perangkat ini; developer belum menerima permintaan.'}
            </Text>
            {inquiryError ? <Text style={[theme.type.caption, { color: theme.colors.brandInk, marginTop: 10 }]}>{inquiryError}</Text> : null}
            <Pressable onPress={() => { void submitInquiry(); }} disabled={inquiryBusy || !selectedUnit} accessibilityRole="button" style={[styles.inquirySubmit, { backgroundColor: theme.colors.inkPrimary, opacity: inquiryBusy ? 0.65 : 1 }]}>
              {inquiryBusy ? <ActivityIndicator color={theme.colors.surface} /> : <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>{project.developerConnected ? 'Kirim minat saya' : 'Simpan simulasi minat'}</Text>}
            </Pressable>
            {project.contactPhone ? <Pressable onPress={requestBrochure} style={styles.whatsappLink}>
              <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>Atau hubungi developer lewat WhatsApp</Text>
            </Pressable> : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
  inventoryPanel: { marginTop: 22, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', paddingVertical: 16 },
  inventoryDivider: { width: StyleSheet.hairlineWidth },
  progressPanel: { marginTop: 24, borderRadius: 20, padding: 20 },
  progressHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressTrack: { height: 8, borderRadius: 4, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  unitRow: { padding: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  unitHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  unitFooter: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  facilityWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  facilityItem: { width: '47%', minWidth: 138, flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 44 },
  facilityIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  nearbyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  inquiryStatus: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, marginTop: 18 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  inquirySheet: { flexGrow: 0, maxHeight: '85%', borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 24, paddingTop: 24 },
  sheetHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  inquiryOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  inquiryOption: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, minHeight: 40, justifyContent: 'center' },
  inquiryInput: { height: 52, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, marginTop: 8 },
  inquirySubmit: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  whatsappLink: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
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
