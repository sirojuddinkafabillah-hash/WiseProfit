import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, ShieldCheck, CheckCircle2, AlertCircle, Loader2,
  ArrowRight, UserPlus, LogIn, Eye, EyeOff, KeyRound
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
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

  const switchMode = (register: boolean) => {
    setIsRegisterMode(register);
    setIsResetMode(false);
    setPassword('');
    clearMessages();
  };

  return (
    <div className="wp-auth-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="wp-auth-card relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in zoom-in-95 duration-150">
        <section className="wp-auth-header relative">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg shadow-blue-950/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-white">WiseProfit</p>
              <p className="text-xs font-medium text-blue-100/80">Kelola usaha dengan lebih mudah</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-300 shadow-[0_0_10px_rgba(147,197,253,0.9)]" />
            {isResetMode ? 'Pemulihan akun' : isRegisterMode ? 'Mulai langkah baru' : 'Selamat datang'}
          </span>
          <h2 className="mt-5 max-w-sm text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            {isResetMode ? 'Akses akun Anda kembali.' : isRegisterMode ? 'Mulai kelola usaha lebih rapi.' : 'Usaha maju, catatan pun rapi.'}
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-6 text-blue-50/80">
            Catat stok, pantau penjualan, dan kendalikan arus kas dalam satu ruang kerja yang praktis.
          </p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-3.5 backdrop-blur-sm">
              <CheckCircle2 className="mb-2 h-4 w-4 text-blue-200" />
              <p className="text-xs font-semibold text-white">Stok & penjualan</p>
              <p className="mt-1 text-[11px] leading-4 text-blue-100/65">Lebih terorganisir</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-3.5 backdrop-blur-sm">
              <ShieldCheck className="mb-2 h-4 w-4 text-blue-200" />
              <p className="text-xs font-semibold text-white">Kas & keuntungan</p>
              <p className="mt-1 text-[11px] leading-4 text-blue-100/65">Mudah dipantau</p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-medium text-white/65">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-300" />
            Satu tempat untuk mengelola usaha Anda
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
