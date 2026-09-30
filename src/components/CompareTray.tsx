import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useAppStore } from '../store/useAppStore';
import { fetchProperties } from '../data/repository';
import { GlassSurface } from './GlassSurface';

/**
 * Persistent "pick 2-3, then compare" tray — the same store-backed
 * compareIds shows up here regardless of whether it was picked from
 * Explore or Saved, so the picks survive switching between them instead
 * of only living inside whichever screen showed the old inline bar.
 */
export function CompareTray({ bottom }: { bottom: number }) {
  const theme = useTheme();
  const router = useRouter();
  const compareIds = useAppStore((s) => s.compareIds);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const clearCompare = useAppStore((s) => s.clearCompare);
  const { data: properties = [] } = useQuery({ queryKey: ['properties'], queryFn: fetchProperties });

  if (compareIds.length === 0) return null;
  const items = compareIds.map((id) => properties.find((p) => p.id === id)).filter(Boolean) as typeof properties;

  return (
    <View pointerEvents="box-none" style={[styles.position, { bottom }]}>
      <GlassSurface intensity={65} style={[styles.tray, { borderColor: theme.colors.borderStrong, ...theme.shadow.soft }]}>
        <View style={styles.thumbs}>
          {items.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => toggleCompare(p.id)}
              accessibilityRole="button"
              accessibilityLabel={`Hapus ${p.title} dari perbandingan`}
              style={styles.thumbWrap}
            >
              <Image source={{ uri: p.images[0] }} style={styles.thumb} contentFit="cover" />
              <View style={[styles.thumbRemove, { backgroundColor: theme.colors.inkPrimary }]}>
                <Feather name="x" size={10} color={theme.colors.surface} />
              </View>
            </Pressable>
          ))}
          {compareIds.length < 3 ? (
            <View style={[styles.thumbPlaceholder, { borderColor: theme.colors.border }]}>
              <Text style={[theme.type.micro, { color: theme.colors.inkTertiary }]}>+{3 - compareIds.length}</Text>
            </View>
          ) : null}
        </View>
        <View style={{ flex: 1 }} />
        {compareIds.length >= 2 ? (
          <Pressable
            onPress={() => router.push('/compare')}
            accessibilityRole="button"
            style={[styles.compareBtn, { backgroundColor: theme.colors.inkPrimary }]}
          >
            <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>Bandingkan</Text>
          </Pressable>
        ) : (
          <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, marginRight: 8 }]}>Pilih 1 lagi</Text>
        )}
        <Pressable onPress={clearCompare} hitSlop={8} accessibilityRole="button" accessibilityLabel="Hapus semua pembanding" style={{ marginLeft: 8 }}>
          <Feather name="trash-2" size={16} color={theme.colors.inkTertiary} />
        </Pressable>
      </GlassSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  position: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  tray: {
    width: '100%',
    minHeight: 64,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  thumbs: { flexDirection: 'row', gap: 6 },
  thumbWrap: { width: 44, height: 44 },
  thumb: { width: 44, height: 44, borderRadius: 12 },
  thumbRemove: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBtn: { minHeight: 40, paddingHorizontal: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
