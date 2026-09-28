import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeProvider';

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
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.canvas }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 140 }}
    >
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.inkPrimary }]}>
          <Text style={{ color: theme.colors.surface, fontSize: 20, fontWeight: '600' }}>T</Text>
        </View>
        <Text style={[theme.type.title, { color: theme.colors.inkPrimary, marginTop: 12 }]}>Tamu</Text>
        <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 2 }]}>
          Masuk untuk menyimpan preferensi di semua perangkat
        </Text>
        <Pressable style={[styles.loginBtn, { backgroundColor: theme.colors.inkPrimary }]}>
          <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>Masuk / Daftar</Text>
        </Pressable>
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
            <Text style={{ color: theme.colors.inkTertiary, fontSize: 16 }}>›</Text>
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
