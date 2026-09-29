import React from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { formatPriceLine } from '../lib/format';
import { useAppStore } from '../store/useAppStore';
import { getFitReasons } from '../lib/recommendations';
import type { Property } from '../data/properties';

type Props = {
  property: Property;
  onPress: () => void;
  layout?: 'rail' | 'grid' | 'feature';
};

export function PropertyCard({ property, onPress, layout = 'rail' }: Props) {
  const theme = useTheme();
  const isSaved = useAppStore((s) => s.isSaved(property.id));
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const toggleHidden = useAppStore((s) => s.toggleHidden);
  const filters = useAppStore((s) => s.filters);
  const kprScenarios = useAppStore((s) => s.kprScenarios);
  const topReason = getFitReasons(property, { filters, kprScenarios })[0];
  const nearbyText = property.nearby?.[0]
    ? `${property.nearby[0].minutes} menit dari ${property.nearby[0].label.toLowerCase()}`
    : null;

  const hideProperty = () => {
    const msg = `Sembunyikan "${property.title}"? Properti ini tidak akan muncul lagi di hasil pencarian. Kamu bisa menampilkannya lagi dari tab Tersimpan.`;
    if (Platform.OS === 'web') {
      if (confirm(msg)) toggleHidden(property.id);
      return;
    }
    Alert.alert('Sembunyikan properti', msg, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Sembunyikan', style: 'destructive', onPress: () => toggleHidden(property.id) },
    ]);
  };

  const specs = [
    property.bedrooms ? `${property.bedrooms} KT` : null,
    property.bathrooms ? `${property.bathrooms} KM` : null,
    property.buildingArea ? `${property.buildingArea} m²` : null,
  ].filter(Boolean) as string[];

  return (
    <Pressable
      onPress={onPress}
      onLongPress={hideProperty}
      style={({ pressed }) => [
        styles.card,
        layout !== 'rail' && styles.gridCard,
        layout === 'feature' && styles.featureCard,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: pressed ? 0.96 : 1 },
      ]}
    >
      <View style={[styles.mediaWrap, layout === 'grid' && styles.gridMediaWrap, layout === 'feature' && styles.featureMediaWrap]}>
        <Image source={{ uri: property.images[0] }} style={styles.media} contentFit="cover" transition={200} />
        {property.promotion !== 'normal' ? (
          <View style={[styles.promoTag, { backgroundColor: theme.colors.inkPrimary }]}>
            <Text style={[theme.type.micro, { color: theme.colors.surface }]}>
              {property.promotion === 'sponsored' ? 'DISPONSORI' : property.promotion.toUpperCase()}
            </Text>
          </View>
        ) : null}
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggleSaved(property.id);
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Hapus dari tersimpan' : 'Simpan properti'}
          style={[styles.saveBtn, { backgroundColor: 'rgba(21,21,21,0.62)' }]}
        >
          <Feather name="heart" size={15} color={isSaved ? theme.colors.brand : '#fff'} />
        </Pressable>
      </View>
      <View style={[styles.body, layout === 'feature' && styles.featureBody, layout === 'feature' && { backgroundColor: theme.colors.surface, ...theme.shadow.soft }]}>
        <Text style={[layout === 'feature' ? theme.type.title : theme.type.bodyStrong, { color: theme.colors.inkPrimary }]} numberOfLines={1}>
          {formatPriceLine(property.price, property.priceUnit)}
        </Text>
        <Text style={[layout === 'feature' ? theme.type.headline : theme.type.caption, { color: theme.colors.inkPrimary, marginTop: layout === 'feature' ? 8 : 2 }]} numberOfLines={layout === 'feature' ? 2 : 1}>
          {property.title}
        </Text>
        <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginTop: 2 }]} numberOfLines={1}>
          {property.area}, {property.city}
        </Text>
        {specs.length ? (
          <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 6 }]}>
            {specs.join(' · ')}
          </Text>
        ) : null}
        {nearbyText && topReason?.text !== nearbyText ? (
          <Text style={[theme.type.micro, { color: theme.colors.inkTertiary, marginTop: 6 }]} numberOfLines={1}>
            {nearbyText}
          </Text>
        ) : null}
        {topReason ? (
          <View style={[styles.fitPill, { backgroundColor: theme.colors.brandSoft, marginTop: 8 }]}>
            <Text style={[theme.type.micro, { color: theme.colors.brandInk }]} numberOfLines={1}>
              {topReason.text}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const CARD_WIDTH = 240;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  gridCard: { width: '100%' },
  featureCard: { borderWidth: 0, backgroundColor: 'transparent' },
  mediaWrap: {
    width: '100%',
    height: 170,
  },
  gridMediaWrap: { height: 210 },
  featureMediaWrap: { height: 290, borderRadius: 24, overflow: 'hidden' },
  media: {
    width: '100%',
    height: '100%',
  },
  promoTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  saveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 14,
  },
  featureBody: { padding: 20, marginHorizontal: 10, marginTop: -30, marginBottom: 12, borderRadius: 20 },
  fitPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
