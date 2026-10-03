import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function readDemoInterest(key: string, legacyKey?: string): Promise<string | null> {
  const current = Platform.OS === 'web' ? await AsyncStorage.getItem(key) : await SecureStore.getItemAsync(key);
  if (current || !legacyKey) return current;
  const legacy = await AsyncStorage.getItem(legacyKey);
  if (!legacy) return null;
  await writeDemoInterest(key, legacy);
  await AsyncStorage.removeItem(legacyKey);
  return legacy;
}

export async function writeDemoInterest(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') return AsyncStorage.setItem(key, value);
  await SecureStore.setItemAsync(key, value);
}

export async function deleteDemoInterest(key: string, legacyKey?: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
  if (legacyKey) await AsyncStorage.removeItem(legacyKey);
}
