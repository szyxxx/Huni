import React from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';

const ACCOUNT_DELETION_WEB_URL = 'https://huni.id/hapus-akun';

/**
 * Satisfies Play's in-app account-deletion requirement (PRD §17, §18.7): the same
 * request must also be reachable from a public web resource registered in Play
 * Console, linked below. The actual account/data purge needs an admin process
 * with the service_role key (never run from the client) — this records a durable
 * request row in `account_deletion_requests` for that process to pick up within
 * the stated 30-day window, rather than only showing a confirmation dialog.
 */
export default function AccountDeletionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, configured, signOut } = useAuth();

  const submitRequest = async () => {
    if (configured && user && supabase) {
      const { error } = await supabase
        .from('account_deletion_requests')
        .upsert({ user_id: user.id, status: 'pending' }, { onConflict: 'user_id,status' });
      if (error) {
        Alert.alert('Gagal mengirim permintaan', error.message);
        return;
      }
      await signOut();
    }
    const done = 'Permintaan diterima. Akan diproses dalam 30 hari sesuai kebijakan privasi kami.';
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      alert(done);
    } else {
      Alert.alert('Permintaan diterima', done);
    }
    router.back();
  };

  const requestDeletion = () => {
    const confirmMsg = configured && user
      ? 'Permintaan penghapusan akun akan diproses dalam 30 hari sesuai kebijakan privasi kami. Kamu akan langsung keluar dari akun ini.'
      : 'Kamu belum masuk akun, jadi belum ada data akun untuk dihapus di server — ini hanya mencatat niatmu secara lokal.';
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (confirm(`${confirmMsg}\n\nLanjutkan?`)) submitRequest();
    } else {
      Alert.alert('Hapus akun', confirmMsg, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ajukan penghapusan', style: 'destructive', onPress: submitRequest },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={{ fontSize: 20, color: theme.colors.inkPrimary }}>←</Text>
        </Pressable>
        <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginLeft: 12 }]}>Hapus akun</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Text style={[theme.type.body, { color: theme.colors.inkSecondary, lineHeight: 22 }]}>
          Menghapus akun akan menghapus profil, preferensi, properti tersimpan, pencarian tersimpan, dan simulasi
          KPR kamu. Data yang wajib kami simpan untuk kepatuhan hukum, pencegahan penipuan, atau keamanan akan
          disimpan sesuai jangka waktu retensi pada kebijakan privasi.
        </Text>

        <Pressable onPress={requestDeletion} style={[styles.dangerBtn, { backgroundColor: theme.colors.danger }]}>
          <Text style={[theme.type.captionStrong, { color: '#fff' }]}>Ajukan penghapusan akun</Text>
        </Pressable>

        <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 20 }]}>
          Kamu juga bisa mengajukan penghapusan tanpa membuka aplikasi melalui halaman web berikut, sesuai
          persyaratan Google Play:
        </Text>
        <Pressable onPress={() => Linking.openURL(ACCOUNT_DELETION_WEB_URL).catch(() => {})}>
          <Text style={[theme.type.captionStrong, { color: theme.colors.brandInk, marginTop: 6 }]}>
            {ACCOUNT_DELETION_WEB_URL}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  dangerBtn: { marginTop: 24, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
});
