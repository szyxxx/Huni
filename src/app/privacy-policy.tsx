import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

const SECTIONS = [
  {
    title: 'Data yang kami kumpulkan',
    body:
      'Data profil yang kamu berikan (nama, kontak jika masuk akun), preferensi pencarian, properti yang disimpan/dilihat, dan interaksi kontak dengan pengiklan. Lokasi hanya diminta saat digunakan dan hanya untuk menampilkan properti terdekat.',
  },
  {
    title: 'Bagaimana kami menggunakannya',
    body:
      'Untuk menampilkan hasil pencarian yang relevan, rekomendasi, dan fitur notifikasi yang tersedia. Saat kamu memilih untuk menghubungi pengiklan, aplikasi menampilkan jalur kontak yang tersedia untuk listing tersebut.',
  },
  {
    title: 'Berbagi data',
    body:
      'Kami tidak menjual data pribadi. Formulir minat simulasi untuk pengiklan atau developer yang belum terhubung disimpan di perangkatmu dan belum dikirim kepada mereka. Pada proyek yang sudah terhubung, layar formulir menjelaskan bahwa data yang kamu kirim dapat dilihat developer. Tautan WhatsApp membuka layanan di luar Huni.',
  },
  {
    title: 'Retensi',
    body:
      'Simulasi minat di perangkat dapat dihapus dari halaman detail. Penghapusan akun tersedia melalui alur Hapus Akun. Catatan audit penghapusan dapat dipertahankan untuk keamanan dan kepatuhan sesuai ketentuan yang berlaku.',
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
          <Feather name="arrow-left" size={20} color={theme.colors.inkPrimary} />
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
