import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuth } from '../../auth/AuthProvider';

const MENU: { title: string; items: { label: string; hint: string; route: string; icon: React.ComponentProps<typeof Feather>['name'] }[] }[] = [
  { title: 'Aktivitas', items: [
    { label: 'Tersimpan', hint: 'Properti, pencarian, dan shortlist', route: '/(tabs)/saved', icon: 'heart' },
    { label: 'Simulasi KPR', hint: 'Rencanakan cicilan yang nyaman', route: '/kpr', icon: 'pie-chart' },
  ] },
  { title: 'Akun & privasi', items: [
    { label: 'Notifikasi', hint: 'Pilih kabar yang ingin diterima', route: '/notifications-settings', icon: 'bell' },
    { label: 'Kebijakan privasi', hint: 'Cara data kamu digunakan', route: '/privacy-policy', icon: 'shield' },
    { label: 'Hapus akun', hint: 'Ajukan penghapusan data akun', route: '/account-deletion', icon: 'trash-2' },
  ] },
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
      <Text style={[theme.type.title, styles.pageTitle, { color: theme.colors.inkPrimary }]}>Profil</Text>
      <View style={[styles.accountCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.accountIdentity}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.inkPrimary }]}>
            <Text style={{ color: theme.colors.surface, fontSize: 20, fontWeight: '600' }}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[theme.type.headline, { color: theme.colors.inkPrimary }]}>{displayName}</Text>
            <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 3 }]}>
              {user
                ? 'Preferensi tersimpan di semua perangkat'
                : configured
                  ? 'Masuk untuk menyinkronkan pilihanmu'
                  : 'Pilihan tersimpan di perangkat ini'}
            </Text>
          </View>
        </View>
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
            <Feather name="arrow-right" size={16} color={theme.colors.surface} />
          </Pressable>
        )}
      </View>

      {MENU.map((group) => (
        <View key={group.title} style={styles.menuGroup}>
          <Text style={[theme.type.captionStrong, styles.groupTitle, { color: theme.colors.inkSecondary }]}>{group.title}</Text>
          <View style={[styles.groupSurface, { backgroundColor: theme.colors.surface }]}>
            {group.items.map((item, index) => (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                onPress={() => router.push(item.route as any)}
                style={[styles.menuItem, index < group.items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
              >
                <View style={[styles.menuIcon, { backgroundColor: theme.colors.surfaceSoft }]}>
                  <Feather name={item.icon} size={17} color={theme.colors.inkPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{item.label}</Text>
                  <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 2 }]}>{item.hint}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={theme.colors.inkTertiary} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { marginHorizontal: 20, marginBottom: 20 },
  accountCard: { marginHorizontal: 20, borderRadius: 22, padding: 20 },
  accountIdentity: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  menuGroup: { marginTop: 30, marginHorizontal: 20 },
  groupTitle: { marginBottom: 10, marginLeft: 4 },
  groupSurface: { borderRadius: 20, paddingHorizontal: 16, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 68,
    paddingVertical: 12,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
