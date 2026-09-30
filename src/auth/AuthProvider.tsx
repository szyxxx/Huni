import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import type { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { registerPushToken } from '../lib/pushNotifications';
import { pullUserData } from '../data/sync';
import { useAppStore } from '../store/useAppStore';
import { createWorkspaceSessionController } from './workspaceSession';
import { captureGuestWorkspace, GuestWorkspaceStorage } from '../store/guestWorkspace';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithPhone: (phone: string) => Promise<{ error?: string }>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth is real once EXPO_PUBLIC_SUPABASE_URL/ANON_KEY are set (see .env.example);
 * until then `configured` is false and every screen should treat the user as
 * a guest, per PRD §8.1 "guest browsing" — never block on sign-in.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let eventVersion = 0;
    let persistGuest = false;
    let lastGuestSnapshot = '';
    const guestStorage = new GuestWorkspaceStorage(AsyncStorage);
    const controller = createWorkspaceSessionController({
      getState: useAppStore.getState,
      setSyncUserId: (userId) => useAppStore.getState().setSyncUserId(userId),
      hydrateFromRemote: (data) => useAppStore.getState().hydrateFromRemote(data),
      setSyncError: (message) => useAppStore.getState().setSyncError(message),
    }, pullUserData);

    const unsubscribeStore = useAppStore.subscribe((state) => {
      if (persistGuest && !state.syncUserId) {
        const snapshot = captureGuestWorkspace(state);
        const serialized = JSON.stringify(snapshot);
        if (serialized === lastGuestSnapshot) return;
        lastGuestSnapshot = serialized;
        void guestStorage.save(snapshot).catch(() => {
          useAppStore.getState().setSyncError('Data tamu gagal disimpan di perangkat.');
        });
      }
    });

    const boot = guestStorage.load().then((guest) => {
      if (!mounted) return;
      if (guest) {
        useAppStore.getState().hydrateGuest(guest);
        lastGuestSnapshot = JSON.stringify(guest);
      }
      if (!supabase) {
        persistGuest = true;
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) {
        useAppStore.getState().setSyncError('Data tamu gagal dibuka dari perangkat.');
        if (!supabase) setLoading(false);
      }
    });

    const subscription = supabase?.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      const userId = newSession?.user.id ?? null;
      const version = ++eventVersion;
      if (userId !== useAppStore.getState().syncUserId) setLoading(true);
      // Supabase API calls from inside an auth callback can deadlock.
      setTimeout(async () => {
        await boot;
        if (!mounted || version !== eventVersion) return;
        persistGuest = false;
        await controller.setUser(userId);
        if (!mounted || version !== eventVersion) return;
        if (!userId) {
          try {
            const guest = await guestStorage.load();
            if (guest) {
              useAppStore.getState().hydrateGuest(guest);
              lastGuestSnapshot = JSON.stringify(guest);
            }
          } catch {
            useAppStore.getState().setSyncError('Data tamu gagal dibuka dari perangkat.');
          }
          if (!mounted || version !== eventVersion) return;
          persistGuest = true;
        }
        setLoading(false);
        if (userId) void registerPushToken(userId);
      }, 0);
    });
    return () => {
      mounted = false;
      controller.cancel();
      persistGuest = false;
      unsubscribeStore();
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      configured: isSupabaseConfigured,
      signInWithGoogle: async () => {
        if (!supabase) return { error: 'Supabase belum dikonfigurasi.' };
        const redirectTo = Linking.createURL('auth-callback');
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo, skipBrowserRedirect: true },
        });
        if (error || !data?.url) return { error: error?.message ?? 'Gagal memulai sign-in.' };
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type !== 'success' || !result.url) return { error: 'Sign-in dibatalkan.' };
        const url = new URL(result.url.replace('#', '?'));
        const access_token = url.searchParams.get('access_token');
        const refresh_token = url.searchParams.get('refresh_token');
        if (!access_token || !refresh_token) return { error: 'Token tidak ditemukan pada callback.' };
        const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
        return sessionError ? { error: sessionError.message } : {};
      },
      signInWithPhone: async (phone: string) => {
        if (!supabase) return { error: 'Supabase belum dikonfigurasi.' };
        const { error } = await supabase.auth.signInWithOtp({ phone });
        return error ? { error: error.message } : {};
      },
      verifyPhoneOtp: async (phone: string, token: string) => {
        if (!supabase) return { error: 'Supabase belum dikonfigurasi.' };
        const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
        return error ? { error: error.message } : {};
      },
      signOut: async () => {
        const { error } = await supabase?.auth.signOut() ?? { error: null };
        if (error) throw error;
        useAppStore.getState().setSyncUserId(null);
        setSession(null);
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{loading ? null : children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
