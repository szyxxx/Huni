import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
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
        await supabase?.auth.signOut();
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
