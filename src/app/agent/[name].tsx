import React from 'react';
import { FlatList, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeProvider';
import { PropertyCard } from '../../components/PropertyCard';
import { fetchProperties } from '../../data/repository';
import { VERIFICATION_LABELS } from '../../components/VerificationBadge';

/**
 * Agent/advertiser profile — every active listing by this advertiser,
 * derived from the property catalogue the same way the developer
 * profile screen derives its project list. There's no separate
 * agent/advertiser detail table yet (bio, photo, response rate), so
 * this is contact info + listings only.
 */
export default function AgentProfileScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const agentName = decodeURIComponent(name ?? '');
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: properties = [], isLoading } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });

  const listings = properties.filter((p) => p.advertiser.name === agentName);
  const isAgency = listings.some((p) => p.advertiser.isAgency);
  const hasConnectedListing = listings.some((p) => p.advertiser.connected);
  const contactPhone = listings.find((p) => p.advertiser.contactPhone)?.advertiser.contactPhone;
  const bestVerification = listings.reduce<string | null>((best, p) => {
    const rank = ['unverified', 'verified_owner', 'verified_agent', 'verified_agency', 'official_developer'];
    if (p.advertiser.connected && (!best || rank.indexOf(p.verification) > rank.indexOf(best))) return p.verification;
    return best;
  }, null);

  const contactWhatsApp = () => {
    if (!contactPhone) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const text = encodeURIComponent(`Halo ${agentName}, saya tertarik dengan properti yang kamu iklankan di Huni.`);
    Linking.openURL(`https://wa.me/${contactPhone}?text=${text}`).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={20} color={theme.colors.inkPrimary} />
        </Pressable>
        <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginLeft: 12 }]} numberOfLines={1}>
          {agentName}
        </Text>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 14, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingBottom: 60, gap: 14 }}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.inkPrimary }]}>
              <Text style={{ color: theme.colors.surface, fontSize: 22, fontWeight: '600' }}>{agentName.charAt(0)}</Text>
            </View>
            <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 10 }]}>
              {isAgency ? 'Agensi properti' : 'Pemilik langsung'}
              {bestVerification && bestVerification !== 'unverified' ? ` · ${VERIFICATION_LABELS[bestVerification as keyof typeof VERIFICATION_LABELS]}` : hasConnectedListing ? '' : ' · profil contoh; pengiklan belum terhubung'}
            </Text>
            <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]}>
              {isLoading ? 'Memuat…' : `${listings.length} properti aktif di Huni`}
            </Text>
            {contactPhone ? (
              <Pressable onPress={contactWhatsApp} style={[styles.contactBtn, { backgroundColor: theme.colors.inkPrimary }]}>
                <Feather name="message-circle" size={16} color={theme.colors.surface} />
                <Text style={[theme.type.captionStrong, { color: theme.colors.surface, marginLeft: 8 }]}>Hubungi via WhatsApp</Text>
              </Pressable>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <PropertyCard layout="grid" property={item} onPress={() => router.push(`/property/${item.id}`)} />
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[theme.type.body, { color: theme.colors.inkSecondary, textAlign: 'center', marginTop: 40 }]}>
              Belum ada listing lain dari pengiklan ini di Huni.
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  contactBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 46, borderRadius: 14, marginTop: 14, paddingHorizontal: 16, alignSelf: 'flex-start' },
});
