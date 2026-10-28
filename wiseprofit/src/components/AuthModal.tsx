import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, CheckCircle2, AlertCircle, Loader2,
  ArrowRight, UserPlus, LogIn, Eye, EyeOff, KeyRound, Package, ShoppingCart, WalletCards
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, resetPassword, signInWithGoogle } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMsg('Masukkan alamat email Anda.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Format email belum benar. Periksa kembali alamat email Anda.');
      return;
    }
    if (isResetMode) {
      setIsLoading(true);
      try {
        await resetPassword(cleanEmail);
        setSuccessMsg('Jika email tersebut terdaftar, tautan pengaturan ulang kata sandi akan dikirim. Periksa kotak masuk dan folder spam.');
      } catch (error: any) {
        setErrorMsg(error?.message || 'Belum berhasil mengirim tautan reset. Coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
      return;
    }
    if (!password) {
      setErrorMsg('Masukkan kata sandi Anda.');
      return;
    }
    if (isRegisterMode && password.length < 8) {
      setErrorMsg('Gunakan kata sandi minimal 8 karakter untuk membuat akun.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegisterMode) {
        await signUpWithEmail(cleanEmail, password);
        onSuccess?.();
        onClose();
      } else {
        await signInWithEmail(cleanEmail, password);
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      const message = String(error?.message || '');
      if (isRegisterMode && /akun berhasil dibuat|cek email|konfirmasi/i.test(message)) {
        setSuccessMsg(message);
        setIsRegisterMode(false);
        setPassword('');
      } else if (/invalid login credentials|email atau kata sandi/i.test(message)) {
        setErrorMsg('Email atau kata sandi tidak cocok. Periksa kembali atau buat akun jika belum terdaftar.');
      } else if (/user already registered|sudah terdaftar/i.test(message)) {
        setErrorMsg('Email ini sudah terdaftar. Pilih Masuk ke akun.');
      } else if (/email not confirmed|belum dikonfirmasi/i.test(message)) {
        setErrorMsg('Email belum dikonfirmasi. Periksa kotak masuk email Anda terlebih dahulu.');
      } else if (/failed to fetch|network/i.test(message)) {
        setErrorMsg('Tidak dapat terhubung ke layanan login. Periksa internet dan coba lagi.');
      } else {
        setErrorMsg(message || 'Autentikasi belum berhasil. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      const message = String(error?.message || '');
      if (/mengarahkan ke halaman login google/i.test(message)) return;
      if (/provider.*not enabled|unsupported provider/i.test(message)) {
        setErrorMsg('Login Google belum diaktifkan di pengaturan autentikasi Supabase.');
      } else if (/redirect_uri|redirect url|callback/i.test(message)) {
        setErrorMsg('Alamat pengalihan Google belum sesuai. Periksa konfigurasi URL di Supabase dan Google Cloud.');
      } else {
        setErrorMsg(message || 'Login dengan Google belum berhasil. Silakan coba lagi.');
      }
      setIsLoading(false);
    }
  };

  const switchMode = (register: boolean) => {
    setIsRegisterMode(register);
    setIsResetMode(false);
    setPassword('');
    clearMessages();
  };

  return (
    <div className="wp-auth-overlay fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="wp-auth-card relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in zoom-in-95 duration-150">
        <section className="wp-auth-header relative">
          <div className="wp-auth-brand flex items-center gap-3">
            <div className="wp-auth-brand-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" aria-label="Logo WiseProfit">
              <svg viewBox="0 0 48 48" className="h-10 w-10" role="img" aria-hidden="true">
                <defs>
                  <linearGradient id="wp-logo-blue" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3978ff" />
                    <stop offset="100%" stopColor="#1745bd" />
                  </linearGradient>
                  <linearGradient id="wp-logo-light" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#dce8ff" />
                  </linearGradient>
                </defs>
                <path d="M24 3.5 42 13.2v21.6L24 45 6 34.8V13.2Z" fill="url(#wp-logo-blue)" />
                <path d="M12 18.2 24 11.4l7.2 4.1-12.1 7Z" fill="#a9c7ff" />
                <path d="M12 21.3 18.5 25v10.2L12 31.5Z" fill="url(#wp-logo-light)" />
                <path d="M21.2 25.4 27.7 21.6v14.2l-6.5 3.8Z" fill="url(#wp-logo-light)" />
                <path d="M30.4 16.8 36.5 13.3v18.1l-6.1 3.5Z" fill="#ffffff" />
                <path d="M18.5 25 24 28.2l12.5-7.3v6.5L24 34.7l-5.5-3.2Z" fill="#8db4ff" />
              </svg>
            </div>
            <div>
              <p className="wp-auth-brand-name text-lg font-bold tracking-tight"><span className="wp-brand-wise">Wise</span><span className="wp-brand-profit">Profit</span></p>
              <p className="wp-auth-brand-subtitle text-xs">Business Management</p>
            </div>
          </div>

          <div className="wp-auth-intro">
            <p className="wp-auth-eyebrow mb-3 text-xs font-semibold tracking-wide">
              {isResetMode ? 'PEMULIHAN AKUN' : isRegisterMode ? 'MANAJEMEN USAHA' : 'MANAJEMEN USAHA'}
            </p>
            <h2 className="wp-auth-title max-w-sm text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {isResetMode ? 'Akses akun Anda kembali.' : isRegisterMode ? 'Mulai kelola usaha lebih rapi.' : 'Semua catatan usaha, dalam satu tempat.'}
            </h2>
            <p className="wp-auth-description mt-4 max-w-sm text-sm leading-6">
              Kelola stok, catat penjualan, dan pantau keuntungan usaha dalam satu tempat.
            </p>
          </div>

          <div className="wp-auth-features">
            <div className="wp-auth-feature">
              <span className="wp-auth-feature-icon"><Package className="h-5 w-5" /></span>
              <div><p className="wp-auth-feature-title">Stok lebih teratur</p><p className="wp-auth-feature-copy">Pantau barang dan persediaan usaha.</p></div>
            </div>
            <div className="wp-auth-feature">
              <span className="wp-auth-feature-icon"><ShoppingCart className="h-5 w-5" /></span>
              <div><p className="wp-auth-feature-title">Penjualan terpantau</p><p className="wp-auth-feature-copy">Lihat catatan transaksi dengan lebih mudah.</p></div>
            </div>
            <div className="wp-auth-feature">
              <span className="wp-auth-feature-icon"><WalletCards className="h-5 w-5" /></span>
              <div><p className="wp-auth-feature-title">Keuangan lebih jelas</p><p className="wp-auth-feature-copy">Pantau keuntungan dan arus kas usaha.</p></div>
            </div>
          </div>
        </section>

        <section className="wp-auth-body p-7 sm:p-9">
          <div className="mb-6">
            <p className="text-sm font-semibold text-blue-700">AKUN WISEPROFIT</p>
            <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {isResetMode ? 'Atur ulang kata sandi' : isRegisterMode ? 'Buat akun baru' : 'Masuk ke akun'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {isResetMode
                ? 'Masukkan email akun untuk menerima tautan pemulihan.'
                : isRegisterMode
                  ? 'Gunakan email aktif dan kata sandi yang kuat.'
                  : 'Gunakan email dan kata sandi yang terdaftar.'}
            </p>
          </div>

          {errorMsg && (
            <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div role="status" className="mb-4 flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isResetMode && (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-500" /> : (
                <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 3.06 13.22l7.98 6.19C12.72 13.72 17.91 9.5 24 9.5z" transform="translate(0 4)"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.98 46.98 31.95 46.98 24.55z"/>
                  <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19z" transform="translate(0 0)"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.89 2.3-8.18 2.3-6.09 0-11.28-4.22-13.15-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" transform="translate(0 -4)"/>
                </svg>
              )}
              <span>Lanjutkan dengan Google</span>
            </button>
          )}
          {!isResetMode && (
            <div className="mb-5 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>atau masuk dengan email</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="wp-login-email" className="mb-1.5 block text-sm font-semibold text-slate-700">Alamat email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="wp-login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); clearMessages(); }}
                  placeholder="nama@email.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {!isResetMode && (
              <div>
                <label htmlFor="wp-login-password" className="mb-1.5 block text-sm font-semibold text-slate-700">Kata sandi</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="wp-login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(event) => { setPassword(event.target.value); clearMessages(); }}
                    placeholder={isRegisterMode ? 'Minimal 8 karakter' : 'Masukkan kata sandi'}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                  <button type="button" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {!isRegisterMode && !isResetMode && (
              <div className="flex justify-end">
                <button type="button" onClick={() => { setIsResetMode(true); clearMessages(); }} className="text-sm font-semibold text-blue-700 hover:text-blue-900">
                  Lupa kata sandi?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : isResetMode ? <KeyRound className="h-5 w-5" /> : isRegisterMode ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
              <span>{isLoading ? 'Memproses…' : isResetMode ? 'Kirim tautan pemulihan' : isRegisterMode ? 'Buat akun WiseProfit' : 'Masuk'}</span>
              {!isLoading && !isResetMode && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
            {isResetMode ? (
              <button type="button" onClick={() => { setIsResetMode(false); clearMessages(); }} className="font-semibold text-blue-700 hover:text-blue-900">Kembali ke halaman masuk</button>
            ) : (
              <>
                <span>{isRegisterMode ? 'Sudah punya akun?' : 'Belum punya akun?'}</span>{' '}
                <button type="button" onClick={() => switchMode(!isRegisterMode)} className="font-semibold text-blue-700 hover:text-blue-900">
                  {isRegisterMode ? 'Masuk di sini' : 'Buat akun'}
                </button>
              </>
            )}
          </div>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5" />
            Masuk dengan akun WiseProfit Anda
          </p>
        </section>
      </div>
    </div>
  );
}
