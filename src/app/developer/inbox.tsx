import React from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthProvider';
import { fetchProjects } from '../../data/repository';
import { getDeveloperInquiries } from '../../lib/projectInquiries';
import { useTheme } from '../../theme/ThemeProvider';

const KIND_LABEL = { availability: 'Ketersediaan', brochure: 'Brosur & harga', visit: 'Kunjungan' };

export default function DeveloperInboxScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const developerName = decodeURIComponent(name ?? '');
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
  const ownedProjects = projects.filter((project) => project.developer === developerName && project.developerOwnerId === user?.id);
  const projectIds = ownedProjects.map((project) => project.id);
  const { data: inquiries = [], isLoading, error, refetch } = useQuery({
    queryKey: ['developer-inquiries', user?.id, developerName, projectIds.join(',')],
    queryFn: () => getDeveloperInquiries(projectIds),
    enabled: Boolean(user && projectIds.length),
  });

  return <View style={[styles.screen, { backgroundColor: theme.colors.canvas, paddingTop: insets.top + 12 }]}>
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} accessibilityLabel="Kembali" hitSlop={10}>
        <Feather name="arrow-left" size={20} color={theme.colors.inkPrimary} />
      </Pressable>
      <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, flex: 1 }]}>Minat pembeli</Text>
    </View>
    <FlatList
      data={inquiries}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      onRefresh={() => { void refetch(); }}
      refreshing={isLoading}
      ListHeaderComponent={<Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginBottom: 8 }]}>{developerName} · Permintaan dari pembeli yang memilih tipe hunianmu.</Text>}
      renderItem={({ item }) => {
        const project = ownedProjects.find((candidate) => candidate.id === item.projectId);
        const message = encodeURIComponent(`Halo ${item.contactName}, saya dari ${developerName}. Saya menanggapi minat Anda pada ${item.unitName} di ${project?.name ?? 'proyek kami'} melalui Huni.`);
        return <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]}>{item.contactName}</Text>
          <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 5 }]}>{project?.name} · {item.unitName}</Text>
          <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 3 }]}>{KIND_LABEL[item.kind]} · {new Date(item.createdAt).toLocaleDateString('id-ID')}</Text>
          <Pressable onPress={() => { void Linking.openURL(`https://wa.me/${item.contactPhone.replace('+', '')}?text=${message}`); }} accessibilityRole="button" style={[styles.replyButton, { backgroundColor: theme.colors.inkPrimary }]}>
            <Feather name="message-circle" size={16} color={theme.colors.surface} />
            <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>Balas via WhatsApp</Text>
          </Pressable>
        </View>;
      }}
      ListEmptyComponent={<Text style={[theme.type.body, { color: theme.colors.inkSecondary, textAlign: 'center', marginTop: 48 }]}>{error ? 'Minat pembeli belum bisa dimuat. Tarik ke bawah untuk mencoba lagi.' : isLoading ? 'Memuat minat pembeli…' : projectIds.length ? 'Belum ada minat pembeli untuk proyek ini.' : 'Akun ini belum terhubung sebagai pemilik proyek.'}</Text>}
    />
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 24, paddingBottom: 16 },
  list: { paddingHorizontal: 24, paddingBottom: 60, gap: 12 },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 18, padding: 18 },
  replyButton: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 16, minHeight: 42, borderRadius: 12, marginTop: 16 },
});
