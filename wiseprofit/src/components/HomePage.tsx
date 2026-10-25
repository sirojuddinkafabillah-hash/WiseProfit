import React, { useEffect, useState } from 'react';
import { UserRound, Palette, NotebookPen, LogOut, Save, CheckCircle2, Sparkles, Moon, Sun, Monitor, Mail } from 'lucide-react';
import type { AppUser } from '../context/AuthContext';
import type { BackgroundTheme } from './CosmicInteractiveBackground';

interface HomePageProps {
  user: AppUser;
  theme: BackgroundTheme;
  onThemeChange: (theme: BackgroundTheme) => void;
  onSaveName: (name: string) => Promise<boolean>;
  onLogout: () => Promise<void>;
}

const THEMES: { id: BackgroundTheme; name: string; description: string; preview: string; icon: React.ReactNode }[] = [
  { id: 'cosmic-nebula', name: 'Nebula', description: 'Gelap, tenang, dengan cahaya hijau dan biru', preview: 'from-slate-950 via-indigo-950 to-emerald-950', icon: <Moon className="h-4 w-4" /> },
  { id: 'aurora-emerald', name: 'Aurora Hijau', description: 'Nuansa hijau yang segar', preview: 'from-emerald-950 via-teal-900 to-slate-950', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'cyber-sapphire', name: 'Biru Sapphire', description: 'Biru sejuk dan modern', preview: 'from-blue-950 via-sky-900 to-indigo-950', icon: <Monitor className="h-4 w-4" /> },
  { id: 'light-crystal', name: 'Terang', description: 'Latar cerah dan ringan', preview: 'from-slate-100 via-white to-sky-100', icon: <Sun className="h-4 w-4" /> },
];

export const HomePage: React.FC<HomePageProps> = ({ user, theme, onThemeChange, onSaveName, onLogout }) => {
  const [name, setName] = useState(user.displayName || '');
  const [note, setNote] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setName(user.displayName || '');
  }, [user.displayName]);

  useEffect(() => {
    try {
      setNote(localStorage.getItem(`wiseprofit_notes_${user.uid}`) || '');
    } catch {
      setNote('');
    }
  }, [user.uid]);

  const saveName = async () => {
    const clean = name.trim();
    if (!clean) {
      setNameMessage('Nama tidak boleh kosong.');
      return;
    }
    setIsSavingName(true);
    setNameMessage('');
    const ok = await onSaveName(clean);
    setIsSavingName(false);
    setNameMessage(ok ? 'Nama berhasil disimpan.' : 'Nama belum tersimpan. Coba lagi.');
  };

  const saveNote = () => {
    try {
      localStorage.setItem(`wiseprofit_notes_${user.uid}`, note);
      setNameMessage('Catatan pribadi berhasil disimpan di perangkat ini.');
    } catch {
      setNameMessage('Catatan tidak dapat disimpan di browser ini.');
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = user.displayName || user.email?.split('@')[0] || 'Pengguna WiseProfit';
  const initials = (name.trim() || displayName).slice(0, 1).toUpperCase();

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-emerald-950/60 p-6 sm:p-8 shadow-xl">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-emerald-300/30 bg-emerald-400/15 text-3xl font-bold text-emerald-200 shadow-lg">
            {user.photoURL ? <img src={user.photoURL} alt="Foto profil" className="h-full w-full rounded-3xl object-cover" /> : initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200"><CheckCircle2 className="h-3.5 w-3.5" /> Beranda WiseProfit</div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Halo, {displayName}!</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">Atur profil, pilih tampilan yang nyaman, dan simpan catatan pribadi usaha Anda di satu tempat.</p>
            <div className="mt-3 flex items-center gap-2 break-all text-xs text-slate-400"><Mail className="h-3.5 w-3.5 shrink-0" />{user.email || 'Email tidak tersedia'}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/85 p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-emerald-400/10 p-2.5 text-emerald-300"><UserRound className="h-5 w-5" /></div><div><h2 className="font-bold text-white">Profil Anda</h2><p className="mt-1 text-xs text-slate-400">Nama ini akan digunakan di WiseProfit.</p></div></div>
          <label htmlFor="wiseprofit-profile-name" className="mb-2 block text-sm font-medium text-slate-300">Nama tampilan</label>
          <div className="flex flex-col gap-2 sm:flex-row"><input id="wiseprofit-profile-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Masukkan nama Anda" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white" /><button type="button" onClick={saveName} disabled={isSavingName} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-300 disabled:opacity-60"><Save className="h-4 w-4" />{isSavingName ? 'Menyimpan…' : 'Simpan nama'}</button></div>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">Email akun tidak berubah. Anda hanya mengubah nama yang ditampilkan.</p>
        </div>

        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/85 p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-sky-400/10 p-2.5 text-sky-300"><Palette className="h-5 w-5" /></div><div><h2 className="font-bold text-white">Tema tampilan</h2><p className="mt-1 text-xs text-slate-400">Pilih warna yang paling nyaman dilihat.</p></div></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {THEMES.map((item) => (
              <button key={item.id} type="button" onClick={() => onThemeChange(item.id)} className={`rounded-xl border p-3 text-left transition-all ${theme === item.id ? 'border-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-400/30' : 'border-slate-700 bg-slate-950/60 hover:border-slate-500'}`}>
                <div className={`mb-3 h-12 rounded-lg bg-gradient-to-r ${item.preview}`} />
                <div className="flex items-center gap-2 text-sm font-semibold text-white">{item.icon}{item.name}{theme === item.id && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-300" />}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/85 p-5 sm:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3"><div className="rounded-xl bg-amber-400/10 p-2.5 text-amber-300"><NotebookPen className="h-5 w-5" /></div><div><h2 className="font-bold text-white">Catatan pribadi</h2><p className="mt-1 text-xs text-slate-400">Tulis pengingat, target, atau ide usaha yang ingin Anda ingat.</p></div></div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={5} maxLength={5000} placeholder="Contoh: target penjualan minggu ini, barang yang perlu dibeli, atau ide usaha…" className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-relaxed text-white" />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500">{note.length}/5000 karakter · Disimpan di browser/perangkat ini, khusus akun yang sedang masuk.</p><button type="button" onClick={saveNote} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-400/15"><Save className="h-4 w-4" />Simpan catatan</button></div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-rose-400/20 bg-rose-950/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div><h2 className="font-bold text-white">Keluar dari WiseProfit</h2><p className="mt-1 text-sm leading-relaxed text-slate-400">Akun akan keluar dan data usaha tidak ditampilkan sampai Anda masuk kembali.</p></div>
        <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-5 py-3 text-sm font-bold text-rose-200 hover:bg-rose-500/20 disabled:opacity-60"><LogOut className="h-4 w-4" />{isLoggingOut ? 'Sedang keluar…' : 'Keluar dari akun'}</button>
      </section>
      {nameMessage && <p role="status" className="rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-slate-300">{nameMessage}</p>}
    </div>
  );
};
