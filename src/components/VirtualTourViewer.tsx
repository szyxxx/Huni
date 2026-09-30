import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { buildTourHtml, safeTourUrl, type VirtualTourKind } from '../lib/virtualTourHtml';

type Props = {
  url: string;
  kind: VirtualTourKind;
};

/**
 * Renders a 3D model (.glb/.gltf via <model-viewer>) or 360 panorama
 * (via Pannellum) tour inside a WebView, so nothing native/OpenGL is
 * needed on the RN side — avoids the class of Expo Go native-module
 * crash this session hit twice already. Guarded with a dynamic require
 * + error boundary regardless, with an "open externally" fallback,
 * since react-native-webview still has native code under the hood.
 */
export function VirtualTourViewer({ url, kind }: Props) {
  const safeUrl = safeTourUrl(url);
  if (!safeUrl) return <TourFallback />;
  return (
    <TourErrorBoundary url={safeUrl}>
      <TourWebView url={safeUrl} kind={kind} />
    </TourErrorBoundary>
  );
}

function TourWebView({ url, kind }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { WebView } = require('react-native-webview');
  return (
    <WebView
      style={StyleSheet.absoluteFill}
      originWhitelist={['*']}
      source={{ html: buildTourHtml(url, kind) }}
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
    />
  );
}

class TourErrorBoundary extends React.Component<{ children: React.ReactNode; url: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // WebView native module unavailable — fallback below covers it
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return <TourFallback url={this.props.url} />;
  }
}

function TourFallback({ url }: { url?: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.fallback, { backgroundColor: theme.colors.surfaceSoft }]}>
      <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, textAlign: 'center', paddingHorizontal: 20 }]}>
        Tur virtual belum dapat ditampilkan di sini.
      </Text>
      {url ? <Pressable
        onPress={() => Linking.openURL(url).catch(() => {})}
        style={[styles.openBtn, { backgroundColor: theme.colors.inkPrimary }]}
      >
        <Feather name="external-link" size={14} color={theme.colors.surface} />
        <Text style={[theme.type.captionStrong, { color: theme.colors.surface, marginLeft: 8 }]}>Buka di browser</Text>
      </Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  openBtn: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: 16, borderRadius: 14 },
});
