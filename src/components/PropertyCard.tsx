import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { formatPriceLine } from '../lib/format';
import { useAppStore } from '../store/useAppStore';
import { getFitReasons } from '../lib/recommendations';
import type { Property } from '../data/properties';

type Props = {
  property: Property;
  onPress: () => void;
};

export function PropertyCard({ property, onPress }: Props) {
  const theme = useTheme();
  const isSaved = useAppStore((s) => s.isSaved(property.id));
  const toggleSaved = useAppStore((s) => s.toggleSaved);
  const filters = useAppStore((s) => s.filters);
  const kprScenarios = useAppStore((s) => s.kprScenarios);
  const topReason = getFitReasons(property, { filters, kprScenarios })[0];

  const specs = [
    property.bedrooms ? `${property.bedrooms} KT` : null,
    property.bathrooms ? `${property.bathrooms} KM` : null,
    property.buildingArea ? `${property.buildingArea} m²` : null,
  ].filter(Boolean) as string[];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface, opacity: pressed ? 0.96 : 1 },
      ]}
    >
      <View style={styles.mediaWrap}>
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
          style={[styles.saveBtn, { backgroundColor: 'rgba(21,21,21,0.45)' }]}
        >
          <Text style={{ fontSize: 16, color: isSaved ? theme.colors.brand : '#fff' }}>
            {isSaved ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>
      <View style={styles.body}>
        <Text style={[theme.type.bodyStrong, { color: theme.colors.inkPrimary }]} numberOfLines={1}>
          {formatPriceLine(property.price, property.priceUnit)}
        </Text>
        <Text style={[theme.type.caption, { color: theme.colors.inkSecondary, marginTop: 2 }]} numberOfLines={1}>
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
        {property.nearby?.[0] ? (
          <Text style={[theme.type.micro, { color: theme.colors.inkTertiary, marginTop: 6 }]} numberOfLines={1}>
            {property.nearby[0].minutes} menit dari {property.nearby[0].label.toLowerCase()}
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
  },
  mediaWrap: {
    width: '100%',
    height: 170,
    borderRadius: 20,
  },
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingTop: 10,
  },
  fitPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
