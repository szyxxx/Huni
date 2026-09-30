import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, Share, StyleSheet, Text, View, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { GlassSurface } from '../../components/GlassSurface';
import { VerificationBadge } from '../../components/VerificationBadge';
import { PropertyMapView } from '../../components/PropertyMapView';
import { Skeleton } from '../../components/Skeleton';
import { fetchPropertyById, fetchProperties } from '../../data/repository';
import { formatIDR, formatPriceLine } from '../../lib/format';
import { useAppStore } from '../../store/useAppStore';
import { getFitReasons } from '../../lib/recommendations';
import { PropertyCard } from '../../components/PropertyCard';
import { useAuth } from '../../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import { facilityIcon } from '../../lib/facilityIcon';
import { logLead } from '../../lib/leads';

type TourTimeSlot = { label: string; hour: number };

const TOUR_TIME_SLOTS: TourTimeSlot[] = [
  { label: 'Pagi (09.00)', hour: 9 },
  { label: 'Siang (12.00)', hour: 12 },
  { label: 'Sore (15.00)', hour: 15 },
  { label: 'Malam (18.00)', hour: 18 },
];

function tourDayOptions() {
  const labels = ['Hari ini', 'Besok', 'Lusa'];
  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const label = labels[i] ?? date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
    return { offset: i, date, label };
  });
}

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [imageIndex, setImageIndex] = useState(0);
  const { user } = useAuth();
  const isSaved = useAppStore((s) => s.isSaved(id));
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const isWatchingPrice = useAppStore((s) => s.isWatchingPrice(id));
  const togglePriceWatch = useAppStore((s) => s.togglePriceWatch);
  const shortlists = useAppStore((s) => s.shortlists);
  const addToShortlist = useAppStore((s) => s.addToShortlist);
  const [shortlistPickerOpen, setShortlistPickerOpen] = useState(false);
  const [tourPickerOpen, setTourPickerOpen] = useState(false);
  const [tourDay, setTourDay] = useState<number | null>(null);
  const [tourTime, setTourTime] = useState<TourTimeSlot | null>(null);
  const filters = useAppStore((s) => s.filters);
  const kprScenarios = useAppStore((s) => s.kprScenarios);
  const addRecentlyViewed = useAppStore((s) => s.addRecentlyViewed);

  const { data: property, isLoading, error: propertyError, refetch: refetchProperty } = useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchPropertyById(id),
    enabled: Boolean(id),
  });
  const { data: allProperties = [] } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });
  const fitReasons = property ? getFitReasons(property, { filters, kprScenarios }) : [];

  useEffect(() => {
    if (property?.id) addRecentlyViewed(property.id);
  }, [property?.id, addRecentlyViewed]);

  if (!property) {
    if (isLoading) {
      return (
        <View style={{ flex: 1, backgroundColor: theme.colors.canvas, padding: 20, paddingTop: insets.top + 40 }}>
          <Skeleton height={320} radius={0} style={{ marginHorizontal: -20 }} />
          <Skeleton height={28} width="60%" style={{ marginTop: 20 }} />
          <Skeleton height={18} width="40%" style={{ marginTop: 10 }} />
          <Skeleton height={80} style={{ marginTop: 20 }} />
          <Skeleton height={120} style={{ marginTop: 20 }} />
        </View>
      );
    }
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.canvas }]}>
        <Text style={[theme.type.body, { color: theme.colors.inkSecondary }]}>
          {propertyError ? 'Properti belum dapat dimuat.' : 'Properti tidak ditemukan.'}
        </Text>
        {propertyError ? <Pressable onPress={() => { void refetchProperty(); }} style={{ marginTop: 12 }}>
          <Text style={[theme.type.bodyStrong, { color: theme.colors.brandInk }]}>Coba lagi</Text>
        </Pressable> : null}
      </View>
    );
  }

  const similar = allProperties.filter((p) => p.id !== property.id && p.type === property.type).slice(0, 4);
  const contactWhatsApp = () => {
    const phone = property.advertiser.contactPhone;
    if (!phone) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void logLead({ propertyId: property.id, userId: user?.id ?? null, sourceSurface: 'property_detail', channel: 'whatsapp' });
    const text = encodeURIComponent(`Halo, saya tertarik dengan "${property.title}" di Huni.`);
    Linking.openURL(`https://wa.me/${phone}?text=${text}`).catch(() => {});
  };
  const submitTourRequest = () => {
    const phone = property.advertiser.contactPhone;
    const days = tourDayOptions();
    const chosenDay = days.find((d) => d.offset === tourDay);
    if (!chosenDay || !tourTime) return;
    const scheduledFor = new Date(chosenDay.date);
    scheduledFor.setHours(tourTime.hour, 0, 0, 0);
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void logLead({
      propertyId: property.id,
      userId: user?.id ?? null,
      sourceSurface: 'property_detail',
      channel: 'tour_request',
      scheduledFor,
      note: `${chosenDay.label}, ${tourTime.label}`,
    });
    const message = encodeURIComponent(
      `Halo, saya ingin menjadwalkan tur untuk "${property.title}" di Huni pada ${chosenDay.label.toLowerCase()}, ${tourTime.label.toLowerCase()}. Apakah waktu ini tersedia?`
    );
    if (phone) {
      Linking.openURL(`https://wa.me/${phone}?text=${message}`).catch(() => {});
    } else {
      Alert.alert('Permintaan tur terkirim', 'Kami akan meneruskan permintaanmu ke pengiklan.');
    }
    setTourPickerOpen(false);
    setTourDay(null);
    setTourTime(null);
  };
  const shareProperty = () => {
    const link = `huni://property/${property.id}`;
    Share.share({
      message: `Lihat "${property.title}" di Huni: ${formatPriceLine(property.price, property.priceUnit)} — ${link}`,
      url: link,
    }).catch(() => {});
  };
  const watchVideo = () => {
    if (property.videoUrl) Linking.openURL(property.videoUrl).catch(() => {});
  };
  const submitReport = async () => {
    if (!user) {
      router.push('/sign-in');
      return;
    }
    if (!supabase) {
      const message = 'Pelaporan belum tersedia di mode demo.';
      if (Platform.OS === 'web') alert(message);
      else Alert.alert('Belum tersedia', message);
      return;
    }
    const { error } = await supabase.from('listing_reports').insert({ property_id: property.id, reporter_id: user.id });
    const title = error ? 'Gagal mengirim laporan' : 'Laporan diterima';
    const message = error ? error.message : 'Tim kami akan meninjau iklan ini.';
    if (Platform.OS === 'web') alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };
  const reportListing = () => {
    const msg = 'Laporkan iklan ini karena tidak akurat, sudah terjual, atau melanggar aturan?';
    if (Platform.OS === 'web') {
      if (confirm(msg)) void submitReport();
    } else {
      Alert.alert('Laporkan iklan', msg, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Laporkan', style: 'destructive', onPress: () => { void submitReport(); } },
      ]);
    }
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
                <Image source={{ uri }} style={{ width, height: 380 }} contentFit="cover" transition={200} />
              </Pressable>
            ))}
          </ScrollView>

          <View style={[styles.topBar, { top: insets.top + 8 }]}>
            <GlassSurface style={styles.circleBtnWrap}>
              <Pressable onPress={() => router.back()} style={styles.circleBtn}>
                <Feather name="arrow-left" size={18} color={theme.colors.inkPrimary} />
              </Pressable>
            </GlassSurface>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <GlassSurface style={styles.circleBtnWrap}>
                <Pressable onPress={shareProperty} style={styles.circleBtn}>
                  <Feather name="share" size={16} color={theme.colors.inkPrimary} />
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
                  <Feather name="heart" size={16} color={isSaved ? theme.colors.brand : theme.colors.inkPrimary} />
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

        <View style={[styles.content, { backgroundColor: theme.colors.canvas }]}>
          <View style={styles.detailHandle} />
          <VerificationBadge tier={property.verification} />
          <Text style={[theme.type.title, { color: theme.colors.inkPrimary, marginTop: 14 }]}>{property.title}</Text>
          <View style={styles.locationLine}><Feather name="map-pin" size={15} color={theme.colors.inkTertiary} /><Text style={[theme.type.caption, { color: theme.colors.inkSecondary }]}>{property.area}, {property.city}</Text></View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18, gap: 10, flexWrap: 'wrap' }}>
            <Text style={[theme.type.title, { color: theme.colors.inkPrimary }]}>
              {formatPriceLine(property.price, property.priceUnit)}
            </Text>
            {property.previousPrice && property.previousPrice > property.price ? (
              <View style={[styles.dropBadge, { backgroundColor: theme.colors.success }]}>
                <Text style={[theme.type.micro, { color: '#fff' }]}>
                  HARGA TURUN
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                togglePriceWatch(property.id);
              }}
              style={[styles.pillBtn, { borderColor: isWatchingPrice ? theme.colors.brand : theme.colors.border, backgroundColor: isWatchingPrice ? theme.colors.brandSoft : theme.colors.surface }]}
            >
              <Feather name="bell" size={15} color={isWatchingPrice ? theme.colors.brandInk : theme.colors.inkSecondary} />
              <Text style={[theme.type.captionStrong, { color: isWatchingPrice ? theme.colors.brandInk : theme.colors.inkSecondary }]}>
                {isWatchingPrice ? 'Memantau harga' : 'Pantau harga'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShortlistPickerOpen((v) => !v)}
              style={[styles.pillBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
            >
              <Feather name="bookmark" size={15} color={theme.colors.inkSecondary} />
              <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary }]}>Shortlist</Text>
            </Pressable>
            <Pressable
              onPress={() => setTourPickerOpen((v) => !v)}
              style={[styles.pillBtn, { borderColor: tourPickerOpen ? theme.colors.brand : theme.colors.border, backgroundColor: tourPickerOpen ? theme.colors.brandSoft : theme.colors.surface }]}
            >
              <Feather name="calendar" size={15} color={tourPickerOpen ? theme.colors.brandInk : theme.colors.inkSecondary} />
              <Text style={[theme.type.captionStrong, { color: tourPickerOpen ? theme.colors.brandInk : theme.colors.inkSecondary }]}>Jadwalkan tur</Text>
            </Pressable>
            {property.videoUrl ? (
              <Pressable
                onPress={watchVideo}
                style={[styles.pillBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
              >
                <Feather name="play-circle" size={14} color={theme.colors.inkSecondary} />
                <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary }]}>Video</Text>
              </Pressable>
            ) : null}
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

          {tourPickerOpen ? (
            <View style={[styles.shortlistPicker, { borderColor: theme.colors.border, padding: 14 }]}>
              <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary }]}>Pilih hari</Text>
              <View style={styles.tourChipRow}>
                {tourDayOptions().map((d) => (
                  <Pressable
                    key={d.offset}
                    onPress={() => setTourDay(d.offset)}
                    style={[
                      styles.tourChip,
                      { borderColor: theme.colors.border, backgroundColor: tourDay === d.offset ? theme.colors.inkPrimary : theme.colors.surface },
                    ]}
                  >
                    <Text style={[theme.type.caption, { color: tourDay === d.offset ? theme.colors.surface : theme.colors.inkSecondary }]}>{d.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary, marginTop: 12 }]}>Pilih waktu</Text>
              <View style={styles.tourChipRow}>
                {TOUR_TIME_SLOTS.map((slot) => (
                  <Pressable
                    key={slot.hour}
                    onPress={() => setTourTime(slot)}
                    style={[
                      styles.tourChip,
                      { borderColor: theme.colors.border, backgroundColor: tourTime?.hour === slot.hour ? theme.colors.inkPrimary : theme.colors.surface },
                    ]}
                  >
                    <Text style={[theme.type.caption, { color: tourTime?.hour === slot.hour ? theme.colors.surface : theme.colors.inkSecondary }]}>{slot.label}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                onPress={submitTourRequest}
                disabled={tourDay === null || !tourTime}
                style={[
                  styles.tourSubmitBtn,
                  { backgroundColor: tourDay !== null && tourTime ? theme.colors.inkPrimary : theme.colors.surfaceSoft, marginTop: 14 },
                ]}
              >
                <Text style={[theme.type.captionStrong, { color: tourDay !== null && tourTime ? theme.colors.surface : theme.colors.inkTertiary }]}>
                  Kirim permintaan tur
                </Text>
              </Pressable>
            </View>
          ) : null}

          {property.nearby?.length ? (
            <View style={styles.nearbyGroup}>
              {property.nearby.map((n) => (
                <View key={n.label} style={styles.nearbyRow}>
                  <Feather name="navigation" size={14} color={theme.colors.brandInk} />
                  <Text style={[theme.type.caption, { color: theme.colors.inkSecondary }]}>
                    <Text style={{ fontWeight: '600', color: theme.colors.inkPrimary }}>{n.minutes} menit</Text> dari {n.label.toLowerCase()}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {property.estimatedInstallment ? (
            <Pressable onPress={() => router.push(`/kpr?price=${property.price}`)} style={[styles.installmentLink, { backgroundColor: theme.colors.brandSoft }]}>
              <Feather name="pie-chart" size={18} color={theme.colors.brandInk} />
              <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk, flex: 1 }]}>
                Estimasi cicilan {formatIDR(property.estimatedInstallment)}/bulan
              </Text>
              <Feather name="chevron-right" size={18} color={theme.colors.brandInk} />
            </Pressable>
          ) : null}
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

          <View style={[styles.specRow, { backgroundColor: theme.colors.surface }]}>
            {property.bedrooms ? <Spec label="Kamar tidur" value={`${property.bedrooms}`} icon="moon" /> : null}
            {property.bathrooms ? <Spec label="Kamar mandi" value={`${property.bathrooms}`} icon="droplet" /> : null}
            {property.landArea ? <Spec label="Luas tanah" value={`${property.landArea} m²`} icon="maximize" /> : null}
            {property.buildingArea ? <Spec label="Luas bangunan" value={`${property.buildingArea} m²`} icon="layers" /> : null}
          </View>

          {property.images.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRail}>
            {property.images.slice(0, 5).map((uri, index) => <Pressable key={`${uri}-${index}`} accessibilityRole="button" accessibilityLabel={`Lihat foto ${index + 1}`} onPress={() => router.push(`/gallery/${property.id}?index=${index}`)}>
              <Image source={{ uri }} style={styles.galleryThumb} contentFit="cover" />
            </Pressable>)}
          </ScrollView> : null}

          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 30 }]}>Tentang properti</Text>
          <View style={[styles.descriptionPanel, { backgroundColor: theme.colors.surfaceRaised }]}>
            <Text style={[styles.descriptionText, { color: theme.colors.inkPrimary }]}>
              {property.description}
            </Text>
          </View>

          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 30 }]}>Fasilitas</Text>
          <View style={styles.facilityWrap}>
            {property.facilities.map((f) => (
              <View key={f} style={styles.facilityItem}>
                <View style={[styles.facilityIcon, { backgroundColor: theme.colors.surfaceSoft }]}>
                  <Feather name={facilityIcon(f)} size={17} color={theme.colors.inkPrimary} />
                </View>
                <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary, flex: 1 }]}>{f}</Text>
              </View>
            ))}
          </View>

          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 30 }]}>Lokasi</Text>
          {property.verification === 'unverified' ? (
            <View style={[styles.mapPlaceholder, { backgroundColor: theme.colors.surfaceSoft }]}>
              <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>
                Peta lokasi tersembunyi sampai iklan ini diverifikasi
              </Text>
            </View>
          ) : (
            <View style={[styles.mapPlaceholder, { overflow: 'hidden' }]}>
              <PropertyMapView properties={[property]} onSelect={() => {}} />
            </View>
          )}

          <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginTop: 24 }]}>
            Diiklankan oleh
          </Text>
          <Pressable
            onPress={() => router.push(`/agent/${encodeURIComponent(property.advertiser.name)}`)}
            accessibilityRole="button"
            accessibilityLabel={`Lihat profil ${property.advertiser.name}`}
            style={[styles.advertiserRow, { borderColor: theme.colors.border }]}
          >
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
            <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk, marginRight: 6 }]}>Lihat profil</Text>
            <Feather name="chevron-right" size={16} color={theme.colors.inkTertiary} />
          </Pressable>

          <Pressable style={styles.reportRow} onPress={reportListing}>
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

      <GlassSurface style={[styles.contactBar, { bottom: insets.bottom + 8 }]} intensity={60}>
        <View style={{ flex: 1 }}>
          <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>Harga</Text>
          <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>
            {formatPriceLine(property.price, property.priceUnit)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={property.advertiser.contactPhone ? contactWhatsApp : () => {
            if (!isSaved) toggleSaved(property.id);
            router.push('/(tabs)/saved');
          }}
          style={[styles.contactBtn, { backgroundColor: theme.colors.inkPrimary }]}
        >
          <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>
            {property.advertiser.contactPhone ? 'Hubungi via WhatsApp' : isSaved ? 'Lihat tersimpan' : 'Simpan untuk nanti'}
          </Text>
        </Pressable>
      </GlassSurface>
    </View>
  );
}

function Spec({ label, value, icon }: { label: string; value: string; icon: React.ComponentProps<typeof Feather>['name'] }) {
  const theme = useTheme();
  return (
    <View style={styles.specItem}>
      <View style={[styles.specIcon, { backgroundColor: theme.colors.surfaceSoft }]}>
        <Feather name={icon} size={19} color={theme.colors.inkPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{value}</Text>
        <Text style={[theme.type.micro, { color: theme.colors.inkTertiary, marginTop: 2 }]}>{label.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dropBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  pillBtn: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  shortlistPicker: { marginTop: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 4 },
  shortlistRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  tourChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tourChip: { minHeight: 36, paddingHorizontal: 12, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  tourSubmitBtn: { minHeight: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
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
  content: { paddingHorizontal: 24, paddingTop: 18, marginTop: -32, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  detailHandle: { width: 34, height: 4, borderRadius: 3, backgroundColor: '#B9B5B0', alignSelf: 'center', marginBottom: 18 },
  locationLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7 },
  galleryRail: { gap: 8, paddingTop: 18 },
  galleryThumb: { width: 78, height: 78, borderRadius: 14 },
  fitBanner: { borderRadius: 16, padding: 14, marginTop: 16 },
  nearbyGroup: { marginTop: 14, gap: 6 },
  nearbyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  installmentLink: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginTop: 16 },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 20,
  },
  specItem: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 138 },
  specIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  descriptionPanel: { borderRadius: 20, paddingHorizontal: 20, paddingVertical: 20, marginTop: 12 },
  descriptionText: { fontSize: 17, lineHeight: 26, fontWeight: '400' },
  facilityWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  facilityItem: { width: '47%', minWidth: 138, flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 44 },
  facilityIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  mapPlaceholder: { height: 150, borderRadius: 16, marginTop: 10, alignItems: 'center', justifyContent: 'center' },
  advertiserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  advertiserAvatar: { width: 44, height: 44, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  reportRow: { marginTop: 14 },
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
    paddingBottom: 12,
  },
  contactBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
});
