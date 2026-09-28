import React from 'react';
import { Alert, FlatList, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../theme/ThemeProvider';
import { PropertyCard } from '../../components/PropertyCard';
import { fetchProperties } from '../../data/repository';
import { useAppStore } from '../../store/useAppStore';

/**
 * Collaborative shortlist (PRD §7.4): a private invite link a partner/family
 * can open to see and co-decide on the same saved set. Deep link resolution
 * (huni://shortlist/<id>?invite=<code>) needs the auth/backend decision before
 * a recipient can actually join from a fresh install — the link is real, the
 * join flow is stubbed until then.
 */
export default function ShortlistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const shortlist = useAppStore((s) => s.shortlists.find((sl) => sl.id === id));
  const removeFromShortlist = useAppStore((s) => s.removeFromShortlist);
  const deleteShortlist = useAppStore((s) => s.deleteShortlist);
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });

  if (!shortlist) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.canvas }]}>
        <Text style={[theme.type.body, { color: theme.colors.inkSecondary }]}>Shortlist tidak ditemukan.</Text>
      </View>
    );
  }

  const items = shortlist.propertyIds.map((pid) => properties.find((p) => p.id === pid)).filter(Boolean) as typeof properties;
  const inviteLink = `https://huni.id/shortlist/${shortlist.id}?invite=${shortlist.inviteCode}`;

  const share = async () => {
    try {
      await Share.share({
        message: `Yuk lihat shortlist rumah "${shortlist.name}" bareng aku di Huni: ${inviteLink}`,
        url: inviteLink,
      });
    } catch {
      // user cancelled or sharing unavailable — no-op
    }
  };

  const confirmDelete = () => {
    const msg = 'Hapus shortlist ini? Properti di dalamnya tidak akan terhapus dari daftar tersimpan.';
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (confirm(msg)) {
        deleteShortlist(shortlist.id);
        router.back();
      }
    } else {
      Alert.alert('Hapus shortlist', msg, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => { deleteShortlist(shortlist.id); router.back(); } },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={{ fontSize: 20, color: theme.colors.inkPrimary }}>←</Text>
        </Pressable>
        <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginLeft: 12, flex: 1 }]} numberOfLines={1}>
          {shortlist.name}
        </Text>
        <Pressable onPress={confirmDelete} hitSlop={10}>
          <Text style={[theme.type.captionStrong, { color: theme.colors.danger }]}>Hapus</Text>
        </Pressable>
      </View>

      <Pressable onPress={share} style={[styles.inviteBanner, { backgroundColor: theme.colors.inkPrimary, marginHorizontal: 20 }]}>
        <View style={{ flex: 1 }}>
          <Text style={[theme.type.bodyStrong, { color: theme.colors.surface }]}>Undang pasangan / keluarga</Text>
          <Text style={[theme.type.caption, { color: 'rgba(255,255,255,0.7)', marginTop: 2 }]}>
            Bagikan tautan privat agar mereka bisa ikut memutuskan
          </Text>
        </View>
        <Text style={{ color: theme.colors.brand, fontSize: 20 }}>⇧</Text>
      </Pressable>

      <FlatList
        data={items}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 14, paddingHorizontal: 20 }}
        contentContainerStyle={{ gap: 14, paddingTop: 16, paddingBottom: 60 }}
        renderItem={({ item }) => (
          <View style={{ width: '48%' }}>
            <PropertyCard property={item} onPress={() => router.push(`/property/${item.id}`)} />
            <Pressable onPress={() => removeFromShortlist(shortlist.id, item.id)} style={{ marginTop: 6 }}>
              <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, textDecorationLine: 'underline' }]}>
                Keluarkan
              </Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>
              Belum ada properti. Tambahkan dari halaman detail properti.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  inviteBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 16, marginBottom: 16 },
});
