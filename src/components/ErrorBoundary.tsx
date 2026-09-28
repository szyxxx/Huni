import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/**
 * Last-resort crash screen so a render error shows "coba lagi" instead of a
 * blank/white screen or the RN redbox in production. Deliberately styled
 * without ThemeProvider (which sits inside this boundary) so it still
 * renders if theming itself is what threw.
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
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Ada yang tidak beres</Text>
          <Text style={styles.body}>
            Terjadi kesalahan tak terduga. Coba lagi — jika masih terjadi, tutup dan buka ulang aplikasi.
          </Text>
          <Pressable onPress={this.reset} style={styles.button}>
            <Text style={styles.buttonText}>Coba lagi</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#F5F3F0' },
  title: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
  body: { fontSize: 14, color: '#6B6B6B', textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#1A1A1A', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: '#FFFFFF', fontWeight: '600' },
});
