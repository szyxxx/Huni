import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { defaultFilters, useAppStore } from '../store/useAppStore';
import { fetchProperties } from '../data/repository';
import { getPopularAreas } from '../data/properties';
import { parseIntentSmart } from '../lib/aiSearch';

const PROMPTS = [
  'Rumah 3 kamar dekat kampus, cicilan di bawah 8 juta',
  'Apartemen sewa 1 kamar di Jakarta Selatan',
  'Villa untuk liburan keluarga di Bali',
];

export default function AiSearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const searchHistory = useAppStore((s) => s.searchHistory);
  const addSearchHistory = useAppStore((s) => s.addSearchHistory);
  const setIntent = useAppStore((s) => s.setIntent);
  const setFilters = useAppStore((s) => s.setFilters);
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });
  const popularAreas = getPopularAreas(properties).slice(0, 6);

  const submit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    try {
      const parsed = await parseIntentSmart(trimmed);
      addSearchHistory(trimmed);
      if (parsed.intent) setIntent(parsed.intent);
      setFilters({
        ...defaultFilters,
        types: parsed.type ? [parsed.type] : [],
        bedrooms: parsed.bedrooms ?? null,
        maxInstallment: parsed.maxInstallment ?? null,
        maxPrice: parsed.maxPrice ?? null,
      });
      router.replace({ pathname: '/(tabs)/search', params: { q: parsed.location ?? trimmed, restore: `ai:${Date.now()}` } });
    } catch {
      if (Platform.OS === 'web') alert('Gagal memproses permintaan. Coba lagi.');
      else Alert.alert('Gagal memproses', 'Coba lagi, atau ketik langsung di kolom pencarian.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="arrow-left" size={20} color={theme.colors.inkPrimary} />
        </Pressable>
        <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginLeft: 12 }]}>Tanya AI</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Text style={[theme.type.body, { color: theme.colors.inkSecondary }]}>
          Ceritakan rumah idamanmu dengan kata-katamu sendiri — AI akan menerjemahkannya jadi filter pencarian.
        </Text>

        <View style={[styles.inputCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder='"Rumah 3 kamar dekat ITB, cicilan 8 juta, ada taman"'
            placeholderTextColor={theme.colors.inkTertiary}
            multiline
            style={[theme.type.body, { color: theme.colors.inkPrimary, minHeight: 80 }]}
          />
          <View style={styles.inputRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Rekam suara (segera hadir)"
              onPress={() => {
                const msg = 'Input suara akan segera hadir. Untuk sekarang, ketik kebutuhanmu di kolom ini.';
                if (Platform.OS === 'web') alert(msg);
                else Alert.alert('Segera hadir', msg);
              }}
              style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceSoft }]}
            >
              <Feather name="mic" size={16} color={theme.colors.inkSecondary} />
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kirim"
              disabled={!query.trim() || loading}
              onPress={() => submit(query)}
              style={[styles.sendBtn, { backgroundColor: query.trim() && !loading ? theme.colors.inkPrimary : theme.colors.surfaceSoft }]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.inkTertiary} />
              ) : (
                <Feather name="arrow-up" size={18} color={query.trim() ? theme.colors.surface : theme.colors.inkTertiary} />
              )}
            </Pressable>
          </View>
        </View>

        <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary, marginTop: 28 }]}>Contoh</Text>
        <View style={{ gap: 8, marginTop: 10 }}>
          {PROMPTS.map((p) => (
            <Pressable key={p} onPress={() => submit(p)} style={[styles.promptRow, { borderColor: theme.colors.border }]}>
              <Feather name="edit-3" size={14} color={theme.colors.inkTertiary} />
              <Text style={[theme.type.body, { color: theme.colors.inkSecondary, marginLeft: 10, flex: 1 }]}>{p}</Text>
            </Pressable>
          ))}
        </View>

        {searchHistory.length > 0 ? (
          <>
            <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary, marginTop: 24 }]}>Pencarian terakhir</Text>
            <View style={styles.chipWrap}>
              {searchHistory.map((h) => (
                <Pressable key={h} onPress={() => submit(h)} style={[styles.chip, { backgroundColor: theme.colors.surfaceSoft }]}>
                  <Text style={[theme.type.caption, { color: theme.colors.inkSecondary }]}>{h}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {popularAreas.length > 0 ? (
          <>
            <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary, marginTop: 24 }]}>Lokasi populer</Text>
            <View style={styles.chipWrap}>
              {popularAreas.map((a) => (
                <Pressable key={a.id} onPress={() => submit(a.name)} style={[styles.chip, { backgroundColor: theme.colors.surfaceSoft }]}>
                  <Feather name="map-pin" size={12} color={theme.colors.inkTertiary} />
                  <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginLeft: 6 }]}>{a.name}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  inputCard: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 16, marginTop: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  promptRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', minHeight: 36, paddingHorizontal: 12, borderRadius: 999 },
});
