import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  auth, 
  getMultiFactorResolver, 
  RecaptchaVerifier, 
  MultiFactorResolver,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator
} from '../lib/authCompat';
import { 
  X, 
  Mail, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  UserPlus,
  LogIn,
  KeyRound,
  Smartphone,
  RotateCcw
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    resetPassword,
    sendPhoneMfaCode, 
    resolvePhoneMfa, 
    resolveTotpMfa 
  } = useAuth();

  const [authMode, setAuthMode] = useState<'google' | 'email'>('google');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Multi-Factor Authentication (MFA / 2FA) State
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Clean up reCAPTCHA verifier on unmount or reset
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const resetMfaState = () => {
    setMfaResolver(null);
    setVerificationId(null);
    setMfaCode('');
    setIsCodeSent(false);
    setErrorMsg(null);
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch {}
      recaptchaVerifierRef.current = null;
    }
  };

  if (!isOpen) return null;

  // Real Google Sign-In with automatic MFA interception
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      if (err?.code === 'auth/multi-factor-auth-required') {
        try {
          const resolver = getMultiFactorResolver(auth, err);
          setMfaResolver(resolver);
          setErrorMsg(null);
        } catch (resolverErr) {
          setErrorMsg('Akun memerlukan verifikasi 2 langkah (MFA), namun gagal memuat resolver.');
        }
      } else if (err?.code === 'auth/unauthorized-domain') {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        setErrorMsg(`Domain belum diizinkan di Supabase Auth (${hostname}). Silakan pastikan domain ini terdaftar di Supabase Dashboard > Authentication > URL Configuration.`);
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Jendela login ditutup sebelum selesai.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        setErrorMsg('Permintaan login dibatalkan.');
      } else if (err?.code === 'auth/network-request-failed') {
        setErrorMsg('Koneksi internet bermasalah. Periksa jaringan Anda.');
      } else {
        setErrorMsg(err?.message || 'Gagal login dengan akun Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Real Email & Password Auth
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg('Mohon isi alamat email dan kata sandi');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isRegisterMode) {
        await signUpWithEmail(cleanEmail, password);
      } else {
        await signInWithEmail(cleanEmail, password);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/multi-factor-auth-required') {
        try {
          const resolver = getMultiFactorResolver(auth, err);
          setMfaResolver(resolver);
          setErrorMsg(null);
        } catch {
          setErrorMsg('Akun memerlukan verifikasi 2 langkah (MFA).');
        }
      } else if (code === 'auth/unauthorized-domain') {
        const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
        setErrorMsg(`Domain belum diizinkan di Supabase Auth (${hostname}). Silakan pastikan domain ini terdaftar di Supabase Dashboard > Authentication > URL Configuration.`);
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('Email atau kata sandi tidak cocok. Silakan periksa kembali atau buat akun baru.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('Email ini sudah terdaftar. Silakan pilih "Masuk".');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('Format alamat email tidak valid.');
      } else if (code === 'auth/weak-password') {
        setErrorMsg('Kata sandi terlalu lemah (minimal 6 karakter).');
      } else {
        setErrorMsg(err?.message || 'Terjadi kesalahan saat memproses otentikasi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Send a password reset link to the email entered in the form.
  const handlePasswordReset = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Masukkan alamat email terlebih dahulu untuk menerima tautan reset sandi.');
      setSuccessMsg(null);
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await resetPassword(cleanEmail);
      setSuccessMsg('Jika email tersebut terdaftar, tautan untuk mengatur ulang kata sandi akan dikirim. Periksa kotak masuk dan folder spam.');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/invalid-email') {
        setErrorMsg('Format alamat email tidak valid.');
      } else if (code === 'auth/too-many-requests') {
        setErrorMsg('Terlalu banyak permintaan. Tunggu beberapa saat lalu coba lagi.');
      } else if (code === 'auth/network-request-failed') {
        setErrorMsg('Koneksi internet bermasalah. Periksa jaringan lalu coba lagi.');
      } else {
        setErrorMsg('Gagal mengirim tautan reset sandi. Periksa konfigurasi Supabase Auth lalu coba lagi.');
        console.error('[Supabase Auth] Password reset error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Send SMS verification code for Phone MFA
  const handleSendPhoneCode = async () => {
    if (!mfaResolver || mfaResolver.hints.length === 0) return;
    const phoneHint = mfaResolver.hints.find(
      (h) => String(h.factorId) === 'phone'
    ) || mfaResolver.hints[0];

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }

      const vId = await sendPhoneMfaCode(mfaResolver, phoneHint, recaptchaVerifierRef.current);
      setVerificationId(vId);
      setIsCodeSent(true);
    } catch (err: any) {
      console.error('Failed to send MFA code:', err);
      setErrorMsg(err?.message || 'Gagal mengirim kode SMS verifikasi. Silakan coba lagi.');
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {}
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Submit MFA Code (Phone SMS or Authenticator TOTP)
  const handleSubmitMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaResolver) return;
    if (!mfaCode.trim()) {
      setErrorMsg('Mohon masukkan kode verifikasi 6 digit');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const hint = mfaResolver.hints[0];
      const isTotp = hint && String(hint.factorId) === 'totp';

      if (isTotp) {
        await resolveTotpMfa(mfaResolver, hint.uid, mfaCode.trim());
      } else {
        if (!verificationId) {
          setErrorMsg('Harap klik "Kirim Kode SMS" terlebih dahulu.');
          setIsLoading(false);
          return;
        }
        await resolvePhoneMfa(mfaResolver, verificationId, mfaCode.trim());
      }

      resetMfaState();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to verify MFA code:', err);
      if (err?.code === 'auth/invalid-verification-code') {
        setErrorMsg('Kode verifikasi yang Anda masukkan salah. Silakan periksa kembali.');
      } else if (err?.code === 'auth/code-expired') {
        setErrorMsg('Kode verifikasi telah kedaluwarsa. Silakan kirim ulang kode baru.');
      } else {
        setErrorMsg(err?.message || 'Verifikasi 2 langkah gagal.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Find hint metadata
  const currentHint = mfaResolver?.hints?.[0];
  const isTotpFactor = currentHint && String(currentHint.factorId) === 'totp';
  const maskedPhone = (currentHint as any)?.phoneNumber || 'Nomor Telepon Terdaftar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      {/* Compatibility container for legacy MFA UI */}
      <div id="recaptcha-container"></div>

      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden text-slate-100 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-6 text-white text-center relative border-b border-slate-800">
          <button
            onClick={() => {
              resetMfaState();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl backdrop-blur-md mb-2 shadow-inner">
            {mfaResolver ? (
              <KeyRound className="w-7 h-7 text-amber-400" />
            ) : (
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            )}
          </div>
          
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">
            {mfaResolver ? 'Verifikasi 2 Langkah (MFA)' : 'Login WiseProfit'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-mono">
            {mfaResolver 
              ? 'Akun Anda dilindungi autentikasi dua faktor. Masukkan kode untuk menyelesaikan login.'
              : 'Akses aman data pribadi toko Anda. Setiap akun terisolasi secara privat di Cloud.'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div role="status" className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* VIEW A: MULTI-FACTOR AUTH RESOLVER STEP */}
          {mfaResolver ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-xs text-amber-200 font-mono space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <KeyRound className="w-4 h-4" />
                  <span>Perlu verifikasi tambahan</span>
                </div>
                <p className="text-[11px] text-amber-300/80">
                  {isTotpFactor
                    ? 'Buka aplikasi Google Authenticator Anda dan masukkan kode 6 digit yang ditampilkan.'
                    : `Kode keamanan SMS akan dikirim ke nomor terdaftar Anda: ${maskedPhone}`}
                </p>
              </div>

              {/* Phone MFA: Send SMS Code button */}
              {!isTotpFactor && !isCodeSent && (
                <button
                  type="button"
                  onClick={handleSendPhoneCode}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold rounded-xl text-xs font-mono shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim Kode SMS...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>Kirim Kode SMS ke {maskedPhone}</span>
                    </>
                  )}
                </button>
              )}

              {/* Input for Verification Code (SMS or TOTP) */}
              {(isTotpFactor || isCodeSent) && (
                <form onSubmit={handleSubmitMfa} className="space-y-3 font-mono">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isTotpFactor ? 'Kode 6-Digit Google Authenticator' : 'Kode 6-Digit dari SMS'}
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={8}
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="Contoh: 123456"
                        required
                        autoFocus
                        className="w-full pl-9 pr-3 py-2.5 text-center text-sm font-bold tracking-widest bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || mfaCode.length < 6}
                    className="w-full mt-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memverifikasi Kode...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>Verifikasi & Masuk</span>
                      </>
                    )}
                  </button>

                  {!isTotpFactor && isCodeSent && (
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={handleSendPhoneCode}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Kirim Ulang Kode SMS</span>
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* Cancel MFA and switch to regular login */}
              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={resetMfaState}
                  className="text-xs font-mono text-slate-400 hover:text-slate-200 underline underline-offset-4 cursor-pointer"
                >
                  ← Batal & Gunakan Metode Lain
                </button>
              </div>
            </div>
          ) : (
            /* VIEW B: STANDARD LOGIN (GOOGLE OR EMAIL/PASSWORD) */
            <>
              {/* Mode Switcher: Google vs Email/Password */}
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('google');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'google'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Akun Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('email');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'email'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Email dan kata sandi</span>
                </button>
              </div>

              {/* SECTION 1: GOOGLE AUTH */}
              {authMode === 'google' && (
                <div className="space-y-4 pt-1">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 p-3.5 border border-slate-700 bg-slate-950 hover:bg-slate-800/90 hover:border-emerald-500/60 rounded-2xl transition-all cursor-pointer shadow-lg disabled:opacity-50 group"
                  >
                    <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-white group-hover:text-emerald-300 font-sans">
                      {isLoading ? 'Menghubungkan ke Google...' : 'Lanjutkan dengan Google'}
                    </span>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400 ml-auto" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-300 ml-auto" />
                    )}
                  </button>

                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-[11px] text-slate-400 font-mono space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Akses akun aman</span>
                    </div>
                    <p>Mendukung verifikasi 2 langkah (MFA) otomatis jika akun Google Anda memiliki perlindungan keamanan ganda.</p>
                  </div>
                </div>
              )}

              {/* SECTION 2: EMAIL & PASSWORD AUTH */}
              {authMode === 'email' && (
                <form onSubmit={handleEmailAuth} className="space-y-3 font-mono">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); setSuccessMsg(null); }}
                        placeholder="sirojuddinkafabillah@gmail.com"
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Kata Sandi</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        required
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {!isRegisterMode && (
                    <div className="text-right -mt-1">
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        disabled={isLoading}
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 disabled:opacity-50 cursor-pointer"
                      >
                        {isLoading ? 'Memproses...' : 'Lupa sandi? Kirim tautan reset'}
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : isRegisterMode ? (
                      <>
                        <UserPlus className="w-4 h-4 stroke-[2.5]" />
                        <span>Buat akun baru</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 stroke-[2.5]" />
                        <span>Masuk</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(!isRegisterMode);
                        setErrorMsg(null);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer underline underline-offset-4"
                    >
                      {isRegisterMode
                        ? 'Sudah punya akun? Masuk di sini'
                        : 'Belum punya akun? Buat Akun Baru'}
                    </button>
                  </div>
                </form>
              )}

              {/* Quick Info Footer */}
              <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-1.5 justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Masuk ke WiseProfit</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
