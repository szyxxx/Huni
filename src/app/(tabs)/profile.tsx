import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../auth/AuthProvider';

const MENU: { label: string; hint: string; route: string }[] = [
  { label: 'Pencarian & properti tersimpan', hint: 'Kelola preferensi dan notifikasi pencarian', route: '/(tabs)/saved' },
  { label: 'Simulasi KPR', hint: 'Hitung dan bandingkan skenario cicilan', route: '/kpr' },
  { label: 'Pengaturan notifikasi', hint: 'Atur kategori pemberitahuan', route: '/notifications-settings' },
  { label: 'Kebijakan privasi', hint: 'Bagaimana kami mengelola data kamu', route: '/privacy-policy' },
  { label: 'Hapus akun', hint: 'Ajukan penghapusan akun dan data', route: '/account-deletion' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, configured, signOut } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.phone || user?.email || 'Tamu';
  const initial = (displayName || 'T').charAt(0).toUpperCase();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 140 }}
    >
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.inkPrimary }]}>
          <Text style={{ color: theme.colors.surface, fontSize: 20, fontWeight: '600' }}>{initial}</Text>
        </View>
        <Text style={[theme.type.title, { color: theme.colors.inkPrimary, marginTop: 12 }]}>{displayName}</Text>
        <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 2 }]}>
          {user
            ? 'Preferensimu tersimpan di semua perangkat'
            : configured
              ? 'Masuk untuk menyimpan preferensi di semua perangkat'
              : 'Menjelajah sebagai tamu — data tersimpan di perangkat ini'}
        </Text>
        {user ? (
          <Pressable onPress={() => { void signOut().catch(() => {
            const message = 'Sesi lokal sudah dibersihkan, tetapi keluar dari server gagal. Coba lagi saat terhubung.';
            if (Platform.OS === 'web') alert(message);
            else Alert.alert('Keluar belum selesai', message);
          }); }} style={[styles.loginBtn, { backgroundColor: theme.colors.surfaceSoft }]}>
            <Text style={[theme.type.captionStrong, { color: theme.colors.inkPrimary }]}>Keluar</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push('/sign-in')} style={[styles.loginBtn, { backgroundColor: theme.colors.inkPrimary }]}>
            <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>Masuk / Daftar</Text>
          </Pressable>
        )}
      </View>

      <View style={{ paddingHorizontal: 20, gap: 2 }}>
        {MENU.map((item) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.route as any)}
            style={[styles.menuItem, { borderBottomColor: theme.colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{item.label}</Text>
              <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]}>
                {item.hint}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={theme.colors.inkTertiary} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtn: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
