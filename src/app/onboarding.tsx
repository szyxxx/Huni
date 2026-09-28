import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { markOnboardingSeen } from '../lib/onboarding';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    title: 'Temukan tempat yang pas untuk hidupmu',
    body: 'Bukan sekadar daftar properti — Huni membantumu melihat mana yang benar-benar cocok.',
  },
  {
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    title: 'Cari dari cicilan yang nyaman',
    body: 'Mulai dari angka bulanan yang masuk akal, bukan dari filter yang membingungkan.',
  },
  {
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
    title: 'Putuskan bersama, bukan sendirian',
    body: 'Simpan, bandingkan, dan bagikan shortlist dengan pasangan atau keluarga.',
  },
];

/** Minimal 1–3 screen onboarding, skippable, no mandatory account creation (PRD §8.1). */
export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const finish = async () => {
    await markOnboardingSeen();
    router.replace('/(tabs)');
  };

  const next = () => {
    if (page < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true });
      setPage(page + 1);
    } else {
      finish();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={{ width }}>
            <Image source={{ uri: slide.image }} style={{ width, height: '58%' }} contentFit="cover" />
            <View style={styles.textBlock}>
              <Text style={[theme.type.title, { color: theme.colors.inkPrimary }]}>{slide.title}</Text>
              <Text style={[theme.type.body, { color: theme.colors.inkSecondary, marginTop: 10, lineHeight: 22 }]}>
                {slide.body}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === page ? theme.colors.inkPrimary : theme.colors.border },
              ]}
            />
          ))}
        </View>
        <View style={styles.actionsRow}>
          <Pressable onPress={finish} hitSlop={10}>
            <Text style={[theme.type.captionStrong, { color: theme.colors.inkTertiary }]}>Lewati</Text>
          </Pressable>
          <Pressable onPress={next} style={[styles.nextBtn, { backgroundColor: theme.colors.inkPrimary }]}>
            <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>
              {page === SLIDES.length - 1 ? 'Mulai jelajahi' : 'Lanjut'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textBlock: { paddingHorizontal: 28, paddingTop: 28 },
  footer: { paddingHorizontal: 24, paddingTop: 12 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  dot: { width: 20, height: 4, borderRadius: 2 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextBtn: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 999 },
});
