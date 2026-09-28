import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../theme/ThemeProvider';
import { PropertyCard } from '../../components/PropertyCard';
import { fetchProperties } from '../../data/repository';
import { useAppStore } from '../../store/useAppStore';
import { useAuth } from '../../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import { pullUserData } from '../../data/sync';

export default function ShortlistScreen() {
  const { id, invite } = useLocalSearchParams<{ id: string; invite?: string }>();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const shortlist = useAppStore((s) => s.shortlists.find((sl) => sl.id === id));
  const hydrateFromRemote = useAppStore((s) => s.hydrateFromRemote);
  const removeFromShortlist = useAppStore((s) => s.removeFromShortlist);
  const deleteShortlist = useAppStore((s) => s.deleteShortlist);
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });
  const { user } = useAuth();
  const [joinError, setJoinError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!invite || !user || !supabase || shortlist) return;
    let active = true;
    void (async () => {
      const { data, error } = await supabase.functions.invoke('shortlist-invite', { body: { inviteCode: invite } });
      if (error || data?.shortlistId !== id) throw error ?? new Error('Tautan undangan tidak cocok.');
      const remote = await pullUserData(user.id);
      if (active && useAppStore.getState().syncUserId === user.id && remote) {
        hydrateFromRemote(remote);
        router.replace({ pathname: '/shortlist/[id]', params: { id } });
      }
    })().catch((error) => {
      if (active) setJoinError(error instanceof Error ? error.message : 'Gagal membuka undangan.');
    });
    return () => { active = false; };
  }, [id, invite, user, shortlist, hydrateFromRemote, router, retry]);

  if (!shortlist) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.canvas }]}>
        <Text style={[theme.type.body, { color: theme.colors.inkSecondary }]}>
          {joinError ?? (invite && user ? 'Membuka undangan…' : invite ? 'Masuk untuk membuka undangan shortlist.' : 'Shortlist tidak ditemukan.')}
        </Text>
        {invite && !user ? (
          <Pressable onPress={() => router.push('/sign-in')} style={{ marginTop: 16 }}>
            <Text style={[theme.type.bodyStrong, { color: theme.colors.brandInk }]}>Masuk</Text>
          </Pressable>
        ) : null}
        {joinError ? (
          <Pressable onPress={() => { setJoinError(null); setRetry((value) => value + 1); }} style={{ marginTop: 16 }}>
            <Text style={[theme.type.bodyStrong, { color: theme.colors.brandInk }]}>Coba lagi</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  const items = shortlist.propertyIds.map((pid) => properties.find((p) => p.id === pid)).filter(Boolean) as typeof properties;
  const inviteLink = `huni://shortlist/${shortlist.id}?invite=${shortlist.inviteCode}`;

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
          <Feather name="arrow-left" size={20} color={theme.colors.inkPrimary} />
        </Pressable>
        <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginLeft: 12, flex: 1 }]} numberOfLines={1}>
          {shortlist.name}
        </Text>
        {(!shortlist.ownerId || shortlist.ownerId === user?.id) ? (
          <Pressable onPress={confirmDelete} hitSlop={10}>
            <Text style={[theme.type.captionStrong, { color: theme.colors.danger }]}>Hapus</Text>
          </Pressable>
        ) : null}
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
  inviteBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 16 },
});
