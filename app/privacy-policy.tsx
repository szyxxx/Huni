import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../src/theme/ThemeProvider';

const SECTIONS = [
  {
    title: 'Data yang kami kumpulkan',
    body:
      'Data profil yang kamu berikan (nama, kontak jika masuk akun), preferensi pencarian, properti yang disimpan/dilihat, dan interaksi kontak dengan pengiklan. Lokasi hanya diminta saat digunakan dan hanya untuk menampilkan properti terdekat.',
  },
  {
    title: 'Bagaimana kami menggunakannya',
    body:
      'Untuk menampilkan hasil pencarian yang relevan, rekomendasi, notifikasi pencarian tersimpan, dan menghubungkan kamu dengan pengiklan saat kamu memilih untuk menghubungi mereka.',
  },
  {
    title: 'Berbagi data',
    body:
      'Kami tidak menjual data pribadi. Data kontak dibagikan ke pengiklan hanya saat kamu memicu tindakan kontak (WhatsApp, telepon, atau formulir pertanyaan).',
  },
  {
    title: 'Retensi',
    body:
      'Data dihapus saat akun dihapus, kecuali data yang wajib disimpan untuk kepatuhan hukum, pencegahan penipuan, atau keamanan, sesuai jangka waktu yang berlaku.',
  },
  {
    title: 'Hak kamu',
    body: 'Kamu dapat meminta akses, koreksi, atau penghapusan data melalui halaman Hapus Akun di aplikasi atau web.',
  },
];

export default function PrivacyPolicyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={{ fontSize: 20, color: theme.colors.inkPrimary }}>←</Text>
        </Pressable>
        <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginLeft: 12 }]}>
          Kebijakan Privasi
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginBottom: 16 }]}>
          Draf awal untuk pengembangan — perlu ditinjau tim legal sebelum publikasi Play Store.
        </Text>
        {SECTIONS.map((s) => (
          <View key={s.title} style={{ marginBottom: 20 }}>
            <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{s.title}</Text>
            <Text style={[theme.type.body, { color: theme.colors.inkSecondary, marginTop: 6, lineHeight: 21 }]}>
              {s.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
});
