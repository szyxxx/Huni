import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../auth/AuthProvider';

type Step = 'start' | 'otp';

export default function SignInScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { configured, signInWithGoogle, signInWithPhone, verifyPhoneOtp } = useAuth();
  const [step, setStep] = useState<Step>('start');
  const [phone, setPhone] = useState('+62');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);

  const notify = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    const { error } = await signInWithGoogle();
    setBusy(false);
    if (error) return notify('Gagal masuk', error);
    router.back();
  };

  const requestOtp = async () => {
    setBusy(true);
    const { error } = await signInWithPhone(phone);
    setBusy(false);
    if (error) return notify('Gagal mengirim kode', error);
    setStep('otp');
  };

  const confirmOtp = async () => {
    setBusy(true);
    const { error } = await verifyPhoneOtp(phone, otp);
    setBusy(false);
    if (error) return notify('Kode salah', error);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.canvas }}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Feather name="x" size={20} color={theme.colors.inkPrimary} />
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
        <Text style={[theme.type.title, { color: theme.colors.inkPrimary }]}>Masuk ke Huni</Text>
        <Text style={[theme.type.body, { color: theme.colors.inkSecondary, marginTop: 8, lineHeight: 21 }]}>
          Simpan preferensi, shortlist, dan simulasi KPR-mu di semua perangkat. Kamu tetap bisa menjelajah tanpa
          masuk.
        </Text>

        {!configured ? (
          <View style={[styles.notice, { backgroundColor: theme.colors.surfaceSoft }]}>
            <Text style={[theme.type.caption, { color: theme.colors.inkTertiary }]}>
              Backend belum terhubung, jadi sign-in belum aktif di build ini. Data tetap tersimpan secara lokal di
              perangkatmu.
            </Text>
          </View>
        ) : step === 'start' ? (
          <View style={{ marginTop: 28, gap: 12 }}>
            <Pressable
              onPress={handleGoogle}
              disabled={busy}
              style={[styles.button, { backgroundColor: theme.colors.inkPrimary }]}
            >
              {busy ? <ActivityIndicator color={theme.colors.surface} /> : (
                <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>Lanjutkan dengan Google</Text>
              )}
            </Pressable>

            <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, textAlign: 'center' }]}>atau</Text>

            <View style={[styles.phoneInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+62812xxxxxxx"
                placeholderTextColor={theme.colors.inkTertiary}
                style={[theme.type.body, { flex: 1, color: theme.colors.inkPrimary }]}
              />
            </View>
            <Pressable
              onPress={requestOtp}
              disabled={busy}
              style={[styles.button, { backgroundColor: theme.colors.brand }]}
            >
              {busy ? <ActivityIndicator color={theme.colors.onBrand} /> : (
                <Text style={[theme.type.captionStrong, { color: theme.colors.onBrand }]}>Kirim kode OTP</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <View style={{ marginTop: 28, gap: 12 }}>
            <Text style={[theme.type.caption, { color: theme.colors.inkSecondary }]}>
              Masukkan kode yang dikirim ke {phone}
            </Text>
            <View style={[styles.phoneInput, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <TextInput
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                placeholder="123456"
                placeholderTextColor={theme.colors.inkTertiary}
                style={[theme.type.body, { flex: 1, color: theme.colors.inkPrimary }]}
              />
            </View>
            <Pressable
              onPress={confirmOtp}
              disabled={busy}
              style={[styles.button, { backgroundColor: theme.colors.inkPrimary }]}
            >
              {busy ? <ActivityIndicator color={theme.colors.surface} /> : (
                <Text style={[theme.type.captionStrong, { color: theme.colors.surface }]}>Konfirmasi</Text>
              )}
            </Pressable>
            <Pressable onPress={() => setStep('start')} hitSlop={8}>
              <Text style={[theme.type.caption, { color: theme.colors.inkTertiary, textAlign: 'center' }]}>
                Ubah nomor
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  notice: { marginTop: 20, borderRadius: 12, padding: 14 },
  button: { paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  phoneInput: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 52, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
});
