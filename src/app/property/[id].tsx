import React, { useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, View, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeProvider';
import { GlassSurface } from '../../components/GlassSurface';
import { VerificationBadge } from '../../components/VerificationBadge';
import { fetchPropertyById, fetchProperties } from '../../data/repository';
import { formatIDR, formatPriceLine } from '../../lib/format';
import { useAppStore } from '../../store/useAppStore';
import { getFitReasons } from '../../lib/recommendations';
import { PropertyCard } from '../../components/PropertyCard';

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [imageIndex, setImageIndex] = useState(0);
  const isSaved = useAppStore((s) => s.isSaved(id));
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const isWatchingPrice = useAppStore((s) => s.isWatchingPrice(id));
  const togglePriceWatch = useAppStore((s) => s.togglePriceWatch);
  const shortlists = useAppStore((s) => s.shortlists);
  const addToShortlist = useAppStore((s) => s.addToShortlist);
  const [shortlistPickerOpen, setShortlistPickerOpen] = useState(false);
  const filters = useAppStore((s) => s.filters);
  const kprScenarios = useAppStore((s) => s.kprScenarios);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchPropertyById(id),
    enabled: Boolean(id),
  });
  const { data: allProperties = [] } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });
  const fitReasons = property ? getFitReasons(property, { filters, kprScenarios }) : [];
  if (!property) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.canvas }]}>
        <Text style={[theme.type.body, { color: theme.colors.inkSecondary }]}>
          {isLoading ? 'Memuat…' : 'Properti tidak ditemukan.'}
        </Text>
      </View>
    );
  }

  const similar = allProperties.filter((p) => p.id !== property.id && p.type === property.type).slice(0, 4);
  const contactWhatsApp = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const text = encodeURIComponent(`Halo, saya tertarik dengan "${property.title}" di Huni.`);
    Linking.openURL(`https://wa.me/6281200000000?text=${text}`).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {property.images.map((uri, i) => (
              <Pressable key={i} onPress={() => router.push(`/gallery/${property.id}?index=${i}`)}>
                <Image source={{ uri }} style={{ width, height: 320 }} contentFit="cover" transition={200} />
              </Pressable>
            ))}
          </ScrollView>

          <View style={[styles.topBar, { top: insets.top + 8 }]}>
            <GlassSurface style={styles.circleBtnWrap}>
              <Pressable onPress={() => router.back()} style={styles.circleBtn}>
                <Text style={{ fontSize: 18, color: theme.colors.inkPrimary }}>←</Text>
              </Pressable>
            </GlassSurface>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <GlassSurface style={styles.circleBtnWrap}>
                <Pressable style={styles.circleBtn}>
                  <Text style={{ fontSize: 16, color: theme.colors.inkPrimary }}>⇧</Text>
                </Pressable>
              </GlassSurface>
              <GlassSurface style={styles.circleBtnWrap}>
                <Pressable
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleSaved(property.id);
                  }}
                  style={styles.circleBtn}
                >
                  <Text style={{ fontSize: 16, color: isSaved ? theme.colors.brand : theme.colors.inkPrimary }}>
                    {isSaved ? '♥' : '♡'}
                  </Text>
                </Pressable>
              </GlassSurface>
            </View>
          </View>

          {property.images.length > 1 ? (
            <View style={styles.dots}>
              {property.images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i === imageIndex ? '#fff' : 'rgba(255,255,255,0.45)' },
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <VerificationBadge tier={property.verification} />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 }}>
            <Text style={[theme.type.title, { color: theme.colors.inkPrimary }]}>
              {formatPriceLine(property.price, property.priceUnit)}
            </Text>
            {property.previousPrice && property.previousPrice > property.price ? (
              <View style={[styles.dropBadge, { backgroundColor: theme.colors.success }]}>
                <Text style={[theme.type.micro, { color: '#fff' }]}>
                  TURUN DARI {formatIDR(property.previousPrice)}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                togglePriceWatch(property.id);
              }}
              style={[styles.pillBtn, { borderColor: isWatchingPrice ? theme.colors.brand : theme.colors.border, backgroundColor: isWatchingPrice ? theme.colors.brandSoft : theme.colors.surface }]}
            >
              <Text style={[theme.type.captionStrong, { color: isWatchingPrice ? theme.colors.brandInk : theme.colors.inkSecondary }]}>
                {isWatchingPrice ? '● Memantau harga' : 'Pantau perubahan harga'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShortlistPickerOpen((v) => !v)}
              style={[styles.pillBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
            >
              <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary }]}>+ Shortlist</Text>
            </Pressable>
          </View>

          {shortlistPickerOpen ? (
            <View style={[styles.shortlistPicker, { borderColor: theme.colors.border }]}>
              {shortlists.length === 0 ? (
                <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>
                  Belum ada shortlist. Buat dari tab Tersimpan.
                </Text>
              ) : (
                shortlists.map((sl) => (
                  <Pressable
                    key={sl.id}
                    onPress={() => {
                      addToShortlist(sl.id, property.id);
                      setShortlistPickerOpen(false);
                    }}
                    style={styles.shortlistRow}
                  >
                    <Text style={[theme.type.body, { color: theme.colors.inkPrimary }]}>{sl.name}</Text>
                    <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>
                      {sl.propertyIds.includes(property.id) ? 'Ditambahkan ✓' : `${sl.propertyIds.length} properti`}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          ) : null}

          {property.nearby?.length ? (
            <View style={{ marginTop: 12, gap: 4 }}>
              {property.nearby.map((n) => (
                <Text key={n.label} style={[theme.type.caption, { color: theme.colors.inkSecondary }]}>
                  🚗 {n.minutes} menit dari {n.label.toLowerCase()}
                </Text>
              ))}
            </View>
          ) : null}

          {property.estimatedInstallment ? (
            <Pressable onPress={() => router.push(`/kpr?propertyId=${property.id}`)}>
              <Text style={[theme.type.caption, { color: theme.colors.brandInk, marginTop: 2, textDecorationLine: 'underline' }]}>
                Estimasi cicilan {formatIDR(property.estimatedInstallment)}/bulan · simulasikan
              </Text>
            </Pressable>
          ) : null}
          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 10 }]}>
            {property.title}
          </Text>
          <Text style={[theme.type.body, { color: theme.colors.inkSecondary, marginTop: 4 }]}>
            {property.area}, {property.city}
          </Text>

          {fitReasons.length > 0 ? (
            <View style={[styles.fitBanner, { backgroundColor: theme.colors.brandSoft }]}>
              <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk }]}>
                Mengapa ini mungkin cocok untukmu
              </Text>
              {fitReasons.map((r) => (
                <Text key={r.text} style={[theme.type.caption, { color: theme.colors.brandInk, marginTop: 4 }]}>
                  · {r.text}
                </Text>
              ))}
            </View>
          ) : null}

          <View style={[styles.specRow, { borderColor: theme.colors.border }]}>
            {property.bedrooms ? <Spec label="Kamar tidur" value={`${property.bedrooms}`} /> : null}
            {property.bathrooms ? <Spec label="Kamar mandi" value={`${property.bathrooms}`} /> : null}
            {property.landArea ? <Spec label="Luas tanah" value={`${property.landArea} m²`} /> : null}
            {property.buildingArea ? <Spec label="Luas bangunan" value={`${property.buildingArea} m²`} /> : null}
          </View>

          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 24 }]}>Deskripsi</Text>
          <Text style={[theme.type.body, { color: theme.colors.inkSecondary, marginTop: 8, lineHeight: 22 }]}>
            {property.description}
          </Text>

          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 24 }]}>Fasilitas</Text>
          <View style={styles.facilityWrap}>
            {property.facilities.map((f) => (
              <View key={f} style={[styles.facilityChip, { backgroundColor: theme.colors.surfaceSoft }]}>
                <Text style={[theme.type.caption, { color: theme.colors.inkSecondary }]}>{f}</Text>
              </View>
            ))}
          </View>

          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 24 }]}>Lokasi</Text>
          <View style={[styles.mapPlaceholder, { backgroundColor: theme.colors.surfaceSoft }]}>
            <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>
              Peta lokasi {property.verification === 'unverified' ? 'tersembunyi' : 'perkiraan'}
            </Text>
          </View>

          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 24 }]}>
            Diiklankan oleh
          </Text>
          <View style={[styles.advertiserRow, { borderColor: theme.colors.border }]}>
            <View style={[styles.advertiserAvatar, { backgroundColor: theme.colors.inkPrimary }]}>
              <Text style={{ color: theme.colors.surface, fontWeight: '600' }}>
                {property.advertiser.name.charAt(0)}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>
                {property.advertiser.name}
              </Text>
              <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>
                {property.advertiser.isAgency ? 'Agensi properti' : 'Pemilik langsung'} · Terakhir dikonfirmasi{' '}
                {property.lastConfirmed}
              </Text>
            </View>
          </View>

          <Pressable style={styles.reportRow}>
            <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, textDecorationLine: 'underline' }]}>
              Laporkan iklan ini
            </Text>
          </Pressable>

          {similar.length ? (
            <View style={{ marginTop: 20 }}>
              <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginBottom: 12 }]}>
                Properti serupa
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
                {similar.map((p) => (
                  <PropertyCard key={p.id} property={p} onPress={() => router.push(`/property/${p.id}`)} />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <GlassSurface style={[styles.contactBar, { paddingBottom: insets.bottom + 12 }]} intensity={60}>
        <View style={{ flex: 1 }}>
          <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>Harga</Text>
          <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>
            {formatPriceLine(property.price, property.priceUnit)}
          </Text>
        </View>
        <Pressable onPress={contactWhatsApp} style={[styles.contactBtn, { backgroundColor: theme.colors.inkPrimary }]}>
          <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>Hubungi via WhatsApp</Text>
        </Pressable>
      </GlassSurface>
    </View>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'flex-start' }}>
      <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{value}</Text>
      <Text style={[theme.type.micro, { color: theme.colors.inkTertiary, marginTop: 2 }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dropBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  pillBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  shortlistPicker: { marginTop: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 4 },
  shortlistRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleBtnWrap: { width: 40, height: 40, borderRadius: 20 },
  circleBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dots: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  content: { paddingHorizontal: 20, paddingTop: 18 },
  fitBanner: { borderRadius: 16, padding: 14, marginTop: 16 },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  facilityWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  facilityChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  mapPlaceholder: { height: 150, borderRadius: 18, marginTop: 10, alignItems: 'center', justifyContent: 'center' },
  advertiserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  advertiserAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  reportRow: { marginTop: 14 },
  contactBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  contactBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14 },
});
