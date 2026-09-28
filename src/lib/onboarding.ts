import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEY = 'huni_onboarding_seen';

/** expo-secure-store has no web backend, so web falls back to localStorage. */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' && localStorage.getItem(KEY) === '1';
    }
    return (await SecureStore.getItemAsync(KEY)) === '1';
  } catch {
    return true; // fail open — never trap the user on a broken onboarding check
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, '1');
      return;
    }
    await SecureStore.setItemAsync(KEY, '1');
  } catch {
    // best-effort; worst case onboarding shows again next launch
  }
}
