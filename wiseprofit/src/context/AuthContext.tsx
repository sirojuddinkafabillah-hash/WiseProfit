import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, testSupabaseConnection } from '../lib/supabase';

export type TokenServiceStatus = 'active' | 'pending_activation' | 'unknown';
export interface AppUser {
  uid: string;
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  userMetadata: Record<string, unknown>;
}

function mapUser(user: SupabaseUser | null): AppUser | null {
  if (!user) return null;
  const metadata = user.user_metadata || {};
  return {
    uid: user.id,
    id: user.id,
    email: user.email || null,
    displayName: String(metadata.full_name || metadata.name || metadata.display_name || user.email || ''),
    photoURL: typeof metadata.avatar_url === 'string' ? metadata.avatar_url : (typeof metadata.picture === 'string' ? metadata.picture : null),
    userMetadata: metadata,
  };
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isOnline: boolean;
  tokenServiceStatus: TokenServiceStatus;
  checkConnection: () => Promise<boolean>;
  signInWithGoogle: () => Promise<AppUser>;
  signInWithEmail: (email: string, pass: string) => Promise<AppUser>;
  signUpWithEmail: (email: string, pass: string) => Promise<AppUser>;
  resetPassword: (email: string) => Promise<void>;
  sendPhoneMfaCode: (...args: any[]) => Promise<string>;
  resolvePhoneMfa: (...args: any[]) => Promise<AppUser>;
  resolveTotpMfa: (...args: any[]) => Promise<AppUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authMessage(error: AuthError | Error): Error {
  const message = error.message || 'Autentikasi gagal.';
  if (/invalid login credentials/i.test(message)) return new Error('Email atau kata sandi tidak cocok.');
  if (/user already registered/i.test(message)) return new Error('Email ini sudah terdaftar. Silakan masuk.');
  if (/password should be at least/i.test(message)) return new Error('Kata sandi terlalu pendek. Gunakan minimal 6 karakter.');
  if (/email not confirmed/i.test(message)) return new Error('Email belum dikonfirmasi. Periksa kotak masuk email.');
  return new Error(message);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [tokenServiceStatus, setTokenServiceStatus] = useState<TokenServiceStatus>('unknown');

  const checkConnection = async (): Promise<boolean> => {
    const connected = await testSupabaseConnection();
    setIsOnline(connected);
    setTokenServiceStatus(connected ? 'active' : 'unknown');
    return connected;
  };

  useEffect(() => {
    checkConnection();
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.warn('[WiseProfit Auth] Session:', error.message);
      setUser(mapUser(data.session?.user || null));
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user || null));
      setLoading(false);
      setTokenServiceStatus(session ? 'active' : 'unknown');
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<AppUser> => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw authMessage(error);
    // OAuth redirects away; return a lightweight value only for the existing UI contract.
    const current = mapUser((await supabase.auth.getUser()).data.user);
    if (current) return current;
    if (data.url) window.location.assign(data.url);
    throw new Error('Mengarahkan ke halaman login Google…');
  };

  const signInWithEmail = async (email: string, pass: string): Promise<AppUser> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: pass });
    if (error) throw authMessage(error);
    const mapped = mapUser(data.user);
    if (!mapped) throw new Error('Login berhasil tetapi data akun tidak ditemukan.');
    setUser(mapped);
    return mapped;
  };

  const signUpWithEmail = async (email: string, pass: string): Promise<AppUser> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: pass,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw authMessage(error);
    const mapped = mapUser(data.user);
    if (!mapped) throw new Error('Akun dibuat. Silakan cek email untuk konfirmasi, lalu masuk.');
    if (!data.session) throw new Error('Akun berhasil dibuat. Silakan cek email untuk konfirmasi sebelum masuk.');
    setUser(mapped);
    return mapped;
  };

  const resetPassword = async (email: string): Promise<void> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) throw new Error('Masukkan alamat email terlebih dahulu.');
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo: `${window.location.origin}/` });
    if (error) throw authMessage(error);
  };

  const unsupportedMfa = async (): Promise<any> => {
    throw new Error('Verifikasi MFA lama tidak digunakan lagi. Konfigurasikan MFA melalui Supabase Auth sebelum mengaktifkannya.');
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw authMessage(error);
    setUser(null);
    try {
      Object.keys(localStorage).filter((key) => (key.startsWith('niaganova_') && key !== 'niaganova_bg_theme') || (key.startsWith('wiseprofit_') && !key.startsWith('wiseprofit_notes_'))).forEach((key) => localStorage.removeItem(key));
    } catch {}
  };

  return <AuthContext.Provider value={{
    user, loading, isOnline, tokenServiceStatus, checkConnection,
    signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword,
    sendPhoneMfaCode: unsupportedMfa, resolvePhoneMfa: unsupportedMfa, resolveTotpMfa: unsupportedMfa, logout,
  }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
