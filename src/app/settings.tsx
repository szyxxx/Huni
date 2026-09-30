import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAppStore, type GlassIntensity, type Language } from '../store/useAppStore';
import { useTranslate } from '../lib/i18n';

const GLASS_OPTIONS: { key: GlassIntensity; label: 'glassLow' | 'glassMedium' | 'glassHigh' }[] = [
  { key: 'low', label: 'glassLow' },
  { key: 'medium', label: 'glassMedium' },
  { key: 'high', label: 'glassHigh' },
];

const LANGUAGE_OPTIONS: { key: Language; label: 'languageSystem' | 'languageId' | 'languageEn' }[] = [
  { key: 'system', label: 'languageSystem' },
  { key: 'id', label: 'languageId' },
  { key: 'en', label: 'languageEn' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = useTranslate();
  const glassIntensity = useAppStore((s) => s.glassIntensity);
  const setGlassIntensity = useAppStore((s) => s.setGlassIntensity);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('back')}>
          <Feather name="arrow-left" size={20} color={theme.colors.inkPrimary} />
        </Pressable>
        <Text style={[theme.type.headline, { color: theme.colors.inkPrimary, marginLeft: 12 }]}>
          {t('settingsTitle')}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary }]}>
          {t('glassSectionTitle')}
        </Text>
        <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 4 }]}>
          {t('glassSectionHint')}
        </Text>
        <View style={[styles.segment, { backgroundColor: theme.colors.surfaceSoft }]}>
          {GLASS_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => setGlassIntensity(opt.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: glassIntensity === opt.key }}
              style={[styles.segmentItem, glassIntensity === opt.key && { backgroundColor: theme.colors.inkPrimary }]}
            >
              <Text
                style={[
                  theme.type.captionStrong,
                  { color: glassIntensity === opt.key ? theme.colors.surface : theme.colors.inkSecondary },
                ]}
              >
                {t(opt.label)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[theme.type.captionStrong, { color: theme.colors.inkSecondary, marginTop: 32 }]}>
          {t('languageSectionTitle')}
        </Text>
        <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 4 }]}>
          {t('languageSectionHint')}
        </Text>
        <View style={{ marginTop: 12, gap: 8 }}>
          {LANGUAGE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => setLanguage(opt.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: language === opt.key }}
              style={[
                styles.languageRow,
                {
                  borderColor: language === opt.key ? theme.colors.brand : theme.colors.border,
                  backgroundColor: language === opt.key ? theme.colors.brandSoft : theme.colors.surface,
                },
              ]}
            >
              <Text
                style={[
                  theme.type.body,
                  { color: language === opt.key ? theme.colors.brandInk : theme.colors.inkPrimary },
                ]}
              >
                {t(opt.label)}
              </Text>
              {language === opt.key ? <Feather name="check" size={18} color={theme.colors.brandInk} /> : null}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  segment: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 16, marginTop: 12 },
  segmentItem: { flex: 1, minHeight: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
