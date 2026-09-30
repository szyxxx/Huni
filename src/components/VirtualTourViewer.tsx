import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

export type VirtualTourKind = 'model3d' | 'panorama';

type Props = {
  url: string;
  kind: VirtualTourKind;
};

const MODEL_VIEWER_SCRIPT = 'https://unpkg.com/@google/model-viewer@3/dist/model-viewer.min.js';
const PANNELLUM_CSS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';
const PANNELLUM_JS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';

function buildHtml(url: string, kind: VirtualTourKind): string {
  if (kind === 'model3d') {
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<script type="module" src="${MODEL_VIEWER_SCRIPT}"></script>
<style>html,body{margin:0;height:100%;background:#0e0e0f}model-viewer{width:100%;height:100%}</style></head>
<body><model-viewer src="${url}" camera-controls auto-rotate shadow-intensity="1" exposure="1" ar></model-viewer></body></html>`;
  }
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="${PANNELLUM_CSS}">
<script src="${PANNELLUM_JS}"></script>
<style>html,body{margin:0;height:100%}#panorama{width:100%;height:100%}</style></head>
<body><div id="panorama"></div>
<script>
pannellum.viewer('panorama', { type: 'equirectangular', panorama: '${url}', autoLoad: true, showZoomCtrl: false });
</script></body></html>`;
}

/**
 * Renders a 3D model (.glb/.gltf via <model-viewer>) or 360 panorama
 * (via Pannellum) tour inside a WebView, so nothing native/OpenGL is
 * needed on the RN side — avoids the class of Expo Go native-module
 * crash this session hit twice already. Guarded with a dynamic require
 * + error boundary regardless, with an "open externally" fallback,
 * since react-native-webview still has native code under the hood.
 */
export function VirtualTourViewer({ url, kind }: Props) {
  return (
    <TourErrorBoundary url={url}>
      <TourWebView url={url} kind={kind} />
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
      source={{ html: buildHtml(url, kind) }}
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

function TourFallback({ url }: { url: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.fallback, { backgroundColor: theme.colors.surfaceSoft }]}>
      <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, textAlign: 'center', paddingHorizontal: 20 }]}>
        Tur virtual belum dapat ditampilkan di sini.
      </Text>
      <Pressable
        onPress={() => Linking.openURL(url).catch(() => {})}
        style={[styles.openBtn, { backgroundColor: theme.colors.inkPrimary }]}
      >
        <Feather name="external-link" size={14} color={theme.colors.surface} />
        <Text style={[theme.type.captionStrong, { color: theme.colors.surface, marginLeft: 8 }]}>Buka di browser</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  openBtn: { flexDirection: 'row', alignItems: 'center', minHeight: 44, paddingHorizontal: 16, borderRadius: 14 },
});
