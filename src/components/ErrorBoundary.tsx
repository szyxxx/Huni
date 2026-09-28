import React from 'react';
import { Appearance, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

// Light/dark tokens duplicated from theme/tokens.ts (canvas/inkPrimary/inkSecondary),
// not imported from ThemeProvider so this still renders if theming itself threw.
const PALETTES = {
  light: { canvas: '#F5F3F0', ink: '#1A1A1A', inkSecondary: '#6B6B6B', button: '#1A1A1A', buttonText: '#FFFFFF' },
  dark: { canvas: '#17140F', ink: '#F5F3F0', inkSecondary: '#A8A29A', button: '#F5F3F0', buttonText: '#17140F' },
};

/**
 * Last-resort crash screen so a render error shows "coba lagi" instead of a
 * blank/white screen or the RN redbox in production. Deliberately styled
 * without ThemeProvider (which sits inside this boundary) so it still
 * renders if theming itself is what threw — reads the system scheme
 * directly instead, so it doesn't go illegible in dark mode.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Unhandled render error', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      const palette = PALETTES[Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'];
      return (
        <View style={[styles.container, { backgroundColor: palette.canvas }]}>
          <Text style={[styles.title, { color: palette.ink }]}>Ada yang tidak beres</Text>
          <Text style={[styles.body, { color: palette.inkSecondary }]}>
            Terjadi kesalahan tak terduga. Coba lagi — jika masih terjadi, tutup dan buka ulang aplikasi.
          </Text>
          <Pressable onPress={this.reset} style={[styles.button, { backgroundColor: palette.button }]}>
            <Text style={[styles.buttonText, { color: palette.buttonText }]}>Coba lagi</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  body: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  button: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  buttonText: { fontWeight: '600' },
});
