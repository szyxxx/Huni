import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabase';

export default function AccountDeletionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, configured, signOut } = useAuth();

  const submitRequest = async () => {
    if (!configured || !user || !supabase) {
      Alert.alert('Masuk diperlukan', 'Masuk ke akunmu sebelum mengajukan penghapusan.');
      return;
    }
    const { error } = await supabase
      .from('account_deletion_requests')
      .insert({ user_id: user.id, status: 'pending' });
    if (error && error.code !== '23505') {
      Alert.alert('Gagal mengirim permintaan', error.message);
      return;
    }
    try {
      await signOut();
    } catch {
      const message = 'Permintaan tercatat, tetapi keluar dari server gagal. Periksa sesi akunmu lagi.';
      if (Platform.OS === 'web') alert(message);
      else Alert.alert('Perlu perhatian', message);
      return;
    }
    const done = 'Permintaan penghapusan akun tercatat. Proses penghapusan akan dijalankan oleh pengelola layanan.';
    if (Platform.OS === 'web') {
      alert(done);
    } else {
      Alert.alert('Permintaan diterima', done);
    }
    router.back();
  };

  const requestDeletion = () => {
    if (!configured || !user) {
      router.push('/sign-in');
      return;
    }
    const confirmMsg = 'Kamu akan langsung keluar setelah permintaan penghapusan akun tercatat. Lanjutkan?';
    if (Platform.OS === 'web') {
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
          <Feather name="arrow-left" size={20} color={theme.colors.inkPrimary} />
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

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  dangerBtn: { marginTop: 24, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
});
