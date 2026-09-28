import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useAppStore, NotificationPrefs } from '../store/useAppStore';
import { isExpoGo } from '../lib/isExpoGo';
import { registerPushToken } from '../lib/pushNotifications';
import { useAuth } from '../auth/AuthProvider';

const ITEMS: { key: keyof NotificationPrefs; label: string; hint: string }[] = [
  { key: 'savedSearchMatch', label: 'Properti baru cocok', hint: 'Saat properti baru sesuai pencarian tersimpanmu' },
  { key: 'priceDrops', label: 'Penurunan harga', hint: 'Saat properti yang kamu simpan turun harga' },
  { key: 'listingUpdates', label: 'Pembaruan status', hint: 'Perubahan ketersediaan pada properti tersimpan' },
  { key: 'projectPromotions', label: 'Promosi proyek', hint: 'Penawaran dari proyek/developer yang kamu ikuti' },
  { key: 'shortlistActivity', label: 'Aktivitas shortlist', hint: 'Saat anggota shortlist menambah/menghapus properti' },
  { key: 'leadFollowUp', label: 'Tindak lanjut pengiklan', hint: 'Hanya jika kamu telah menghubungi pengiklan' },
];

export default function NotificationsSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const prefs = useAppStore((s) => s.notificationPrefs);
  const setPref = useAppStore((s) => s.setNotificationPref);
  const [systemGranted, setSystemGranted] = useState<boolean | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (Platform.OS === 'web' || isExpoGo) return;
    (async () => {
      try {
        const Notifications = await import('expo-notifications');
        const res = await Notifications.getPermissionsAsync();
        setSystemGranted(res.granted);
      } catch {
        setSystemGranted(null);
      }
    })();
  }, []);

  const anyEnabled = Object.values(prefs).some(Boolean);

  const handleToggle = async (key: keyof NotificationPrefs, value: boolean) => {
    setPref(key, value);
    if (!value || Platform.OS === 'web' || isExpoGo) return;
    try {
      const Notifications = await import('expo-notifications');
      const current = await Notifications.getPermissionsAsync();
      if (!current.granted) {
        const req = await Notifications.requestPermissionsAsync();
        setSystemGranted(req.granted);
      }
      await registerPushToken(user?.id);
    } catch {
      // permission API unavailable (e.g. simulator, or removed from Expo Go on SDK 53+)
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={{ fontSize: 20, color: theme.colors.inkPrimary }}>←</Text>
        </Pressable>
        <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginLeft: 12 }]}>Notifikasi</Text>
      </View>

      {anyEnabled && systemGranted === false ? (
        <View style={[styles.warning, { backgroundColor: theme.colors.brandSoft, marginHorizontal: 20 }]}>
          <Text style={[theme.type.caption, { color: theme.colors.brandInk }]}>
            Izin notifikasi sistem belum aktif. Aktifkan salah satu kategori di bawah untuk memintanya, atau
            aktifkan lewat pengaturan perangkat.
          </Text>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {ITEMS.map((item) => (
          <View key={item.key} style={[styles.row, { borderColor: theme.colors.border }]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{item.label}</Text>
              <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]}>{item.hint}</Text>
            </View>
            <Switch
              value={prefs[item.key]}
              onValueChange={(v) => handleToggle(item.key, v)}
              trackColor={{ false: theme.colors.border, true: theme.colors.brand }}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  warning: { borderRadius: 14, padding: 14, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
});
