import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../../theme/ThemeProvider';
import { fetchProjects } from '../../data/repository';
import { formatIDR } from '../../lib/format';
import { useAuth } from '../../auth/AuthProvider';

/**
 * Developer profile (PRD §8.1, listed separately from "Project detail"):
 * every project by this developer, derived from the project catalogue
 * itself — there's no separate developer table/screen backing this yet.
 */
export default function DeveloperProfileScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const developerName = decodeURIComponent(name ?? '');
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: projects = [], isLoading } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });

  const developerProjects = projects.filter((p) => p.developer === developerName);
  const verified = developerProjects.some((p) => p.developerVerified && p.developerConnected);
  const hasDemoProjects = developerProjects.some((p) => !p.developerConnected);
  const isOwner = Boolean(user && developerProjects.some((p) => p.developerOwnerId === user.id));

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={20} color={theme.colors.inkPrimary} />
        </Pressable>
        <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginLeft: 12 }]} numberOfLines={1}>
          {developerName}
        </Text>
      </View>

      <FlatList
        data={developerProjects}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 14 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            {verified ? (
              <View style={[styles.badge, { backgroundColor: theme.colors.brandSoft }]}>
                <Text style={[theme.type.micro, { color: theme.colors.brandInk }]}>DEVELOPER RESMI</Text>
              </View>
            ) : hasDemoProjects ? (
              <View style={[styles.badge, { backgroundColor: theme.colors.brandSoft }]}>
                <Text style={[theme.type.micro, { color: theme.colors.brandInk }]}>PROFIL CONTOH · BELUM TERHUBUNG</Text>
              </View>
            ) : null}
            <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 8 }]}>
              {isLoading ? 'Memuat…' : `${developerProjects.length} proyek terdaftar di Huni`}
            </Text>
            {isOwner ? <Pressable onPress={() => router.push({ pathname: '/developer/inbox', params: { name: developerName } })} style={[styles.inboxButton, { backgroundColor: theme.colors.inkPrimary }]}>
              <Feather name="inbox" size={17} color={theme.colors.surface} />
              <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>Lihat minat pembeli</Text>
            </Pressable> : null}
          </View>
        }
        renderItem={({ item: proj }) => (
          <Pressable
            onPress={() => router.push(`/project/${proj.id}`)}
            style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <Image source={{ uri: proj.images[0] }} style={styles.image} contentFit="cover" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]} numberOfLines={1}>
                {proj.name}
              </Text>
              <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]} numberOfLines={1}>
                {proj.area}, {proj.city}
              </Text>
              <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 4 }]}>
                {proj.units.length ? `mulai ${formatIDR(Math.min(...proj.units.map((u) => u.priceFrom)))}` : 'Harga unit belum tersedia'}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[theme.type.body, { color: theme.colors.inkSecondary, textAlign: 'center', marginTop: 40 }]}>
              Belum ada proyek lain dari developer ini di Huni.
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth },
  image: { width: 64, height: 64, borderRadius: 12 },
  inboxButton: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start', paddingHorizontal: 16, minHeight: 44, borderRadius: 12, marginTop: 16 },
});
