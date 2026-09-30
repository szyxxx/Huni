import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { fetchPropertyById } from '../../data/repository';
import { VirtualTourViewer } from '../../components/VirtualTourViewer';

/**
 * Full-screen virtual tour (beta): a 3D model (LiDAR/GLB scan) or 360
 * panorama, when the advertiser has supplied one. See
 * VirtualTourViewer for the WebView-based renderer and its fallback.
 */
export default function VirtualTourScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: property } = useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchPropertyById(id),
    enabled: Boolean(id),
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {property?.virtualTourUrl ? (
        <VirtualTourViewer url={property.virtualTourUrl} kind={property.virtualTourKind ?? 'model3d'} />
      ) : (
        <View style={styles.center}>
          <Text style={[theme.type.body, { color: '#fff' }]}>Tur virtual tidak tersedia untuk properti ini.</Text>
        </View>
      )}

      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Tutup">
          <Feather name="x" size={18} color="#fff" />
        </Pressable>
        <View style={styles.badge}>
          <Text style={[theme.type.micro, { color: '#fff' }]}>TUR VIRTUAL · BETA</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)' },
});
