import { Platform } from 'react-native';
import Constants, { AppOwnership } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

const isExpoGo = Constants.appOwnership === AppOwnership.Expo;

/**
 * Gets an Expo push token (which delivers over FCM on Android, per Axel's
 * "Supabase + FCM" decision) and upserts it into `push_tokens` so the
 * price-drop-alerts edge function can reach this device. No-ops on web,
 * in Expo Go (remote push was removed from Expo Go for Android in SDK 53 —
 * this needs a dev/production build), when not signed in, or when Supabase
 * isn't configured — call it after requesting notification permission.
 */
export async function registerPushToken(userId: string | undefined): Promise<void> {
  if (Platform.OS === 'web' || isExpoGo || !userId || !supabase) return;
  try {
    const permissions = await Notifications.getPermissionsAsync();
    if (!permissions.granted) return;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    if (!token?.data) return;
    await supabase.from('push_tokens').upsert({ user_id: userId, expo_push_token: token.data });
  } catch {
    // best-effort — a missing token just means this device won't receive pushes yet
  }
}
