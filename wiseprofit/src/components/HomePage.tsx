import React, { useEffect, useRef, useState } from 'react';
import { UserRound, Palette, NotebookPen, LogOut, Save, CheckCircle2, Sparkles, Moon, Sun, Monitor, Mail, Camera, Trash2 } from 'lucide-react';
import type { AppUser } from '../context/AuthContext';
import type { BackgroundTheme } from './CosmicInteractiveBackground';

interface HomePageProps {
  user: AppUser;
  theme: BackgroundTheme;
  onThemeChange: (theme: BackgroundTheme) => void;
  accentChoice: string;
  onAccentChange: (color: string) => void;
  tableChoice: string;
  onTableChange: (color: string) => void;
  textChoice: string;
  onTextChange: (color: string) => void;
  fontChoice: string;
  onFontChange: (font: string) => void;
  onWallpaperChange: (wallpaper: string | null) => void;
  wallpaper: string | null;
  onSaveName: (name: string) => Promise<boolean>;
  onLogout: () => Promise<void>;
}

const THEMES: { id: BackgroundTheme; name: string; description: string; preview: string; icon: React.ReactNode }[] = [
  { id: 'cosmic-nebula', name: 'Nebula', description: 'Gelap, tenang, dengan cahaya hijau dan biru', preview: 'from-slate-950 via-indigo-950 to-emerald-950', icon: <Moon className="h-4 w-4" /> },
  { id: 'aurora-emerald', name: 'Aurora Hijau', description: 'Nuansa hijau yang segar', preview: 'from-emerald-950 via-teal-900 to-slate-950', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'cyber-sapphire', name: 'Biru Sapphire', description: 'Biru sejuk dan modern', preview: 'from-blue-950 via-sky-900 to-indigo-950', icon: <Monitor className="h-4 w-4" /> },
  { id: 'light-crystal', name: 'Terang', description: 'Latar cerah dan ringan', preview: 'from-slate-100 via-white to-sky-100', icon: <Sun className="h-4 w-4" /> },
];

export const HomePage: React.FC<HomePageProps> = ({ user, theme, onThemeChange, accentChoice, onAccentChange, tableChoice, onTableChange, textChoice, onTextChange, fontChoice, onFontChange, wallpaper, onWallpaperChange, onSaveName, onLogout }) => {
  const [name, setName] = useState(user.displayName || '');
  const [note, setNote] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const [customAccent, setCustomAccent] = useState(() => { try { return localStorage.getItem('wp_custom_accent') || '#34d399'; } catch { return '#34d399'; } });
  const [customTable, setCustomTable] = useState(() => { try { return localStorage.getItem('wp_custom_table') || '#172033'; } catch { return '#172033'; } });
  const [customText, setCustomText] = useState(() => { try { return localStorage.getItem('wp_custom_text') || '#cbd5e1'; } catch { return '#cbd5e1'; } });
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const wallpaperInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setName(user.displayName || '');
  }, [user.displayName]);

  useEffect(() => {
    document.documentElement.style.setProperty('--wp-custom-accent', customAccent);
    document.documentElement.style.setProperty('--wp-custom-table', customTable);
    document.documentElement.style.setProperty('--wp-custom-text', customText);
    try {
      localStorage.setItem('wp_custom_accent', customAccent);
      localStorage.setItem('wp_custom_table', customTable);
      localStorage.setItem('wp_custom_text', customText);
    } catch (error) { console.error('Tidak dapat menyimpan pilihan warna:', error); }
  }, [customAccent, customTable, customText]);

  useEffect(() => {
    try {
      setNote(localStorage.getItem(`wp_notes_${user.uid}`) || '');
      setLocalPhoto(localStorage.getItem(`wp_profile_photo_${user.uid}`));
    } catch {
      setNote('');
    }
  }, [user.uid]);

  const handleWallpaperSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setNameMessage('Pilih file gambar untuk wallpaper.'); return; }
    if (file.size > 3 * 1024 * 1024) { setNameMessage('Ukuran wallpaper maksimal 3 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => { const result = typeof reader.result === 'string' ? reader.result : null; if (result) { onWallpaperChange(result); setNameMessage('Wallpaper berhasil diterapkan di perangkat ini.'); } };
    reader.onerror = () => setNameMessage('Foto wallpaper tidak dapat dibaca.');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handlePhotoSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setNameMessage('Pilih file foto dengan format gambar.');
      event.target.value = '';
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setNameMessage('Ukuran foto maksimal 1,5 MB agar bisa tersimpan di browser.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      try {
        localStorage.setItem(`wp_profile_photo_${user.uid}`, reader.result);
        setLocalPhoto(reader.result);
        window.dispatchEvent(new Event('wiseprofit-profile-photo-updated'));
        setNameMessage('Foto profil berhasil diganti di perangkat ini.');
      } catch {
        setNameMessage('Foto belum tersimpan. Coba pilih foto yang lebih kecil.');
      }
    };
    reader.onerror = () => setNameMessage('Foto tidak bisa dibaca. Silakan pilih foto lain.');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const removePhoto = () => {
    try {
      localStorage.removeItem(`wp_profile_photo_${user.uid}`);
      setLocalPhoto(null);
      window.dispatchEvent(new Event('wiseprofit-profile-photo-updated'));
      setNameMessage('Foto profil dihapus.');
    } catch {
      setNameMessage('Foto belum bisa dihapus. Silakan coba lagi.');
    }
  };

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
      localStorage.setItem(`wp_notes_${user.uid}`, note);
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
          <div className="flex shrink-0 flex-col items-center gap-2">
            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoSelected} className="hidden" aria-label="Pilih foto profil" />
            <button type="button" onClick={() => photoInputRef.current?.click()} title="Ganti foto profil" aria-label="Ganti foto profil" className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-300/50 bg-emerald-400/15 text-3xl font-bold text-emerald-200 shadow-lg transition hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300">
              {localPhoto ? <img src={localPhoto} alt="Foto profil" className="h-full w-full object-cover" /> : user.photoURL ? <img src={user.photoURL} alt="Foto profil" className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9" />}
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100"><Camera className="h-6 w-6" /></span>
            </button>
            {localPhoto && <button type="button" onClick={removePhoto} title="Hapus foto profil" aria-label="Hapus foto profil" className="rounded-full p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>}
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


        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/90 p-5 sm:p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-violet-400/10 p-2.5 text-violet-300"><Palette className="h-5 w-5" /></div><div><h2 className="font-bold text-white">Personalisasi tampilan</h2><p className="mt-1 text-xs text-slate-400">Atur tema, font, warna tabel, warna tulisan, dan wallpaper sesuka hati.</p></div></div>
          <div className="grid gap-6 md:grid-cols-2">
            <div><label className="mb-2 block text-sm font-semibold text-slate-200">Jenis font</label><select value={fontChoice} onChange={(e) => onFontChange(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white"><option value="Inter">Inter — Modern</option><option value="Arial">Arial — Sederhana</option><option value="Georgia">Georgia — Klasik</option><option value="Verdana">Verdana — Lebar</option><option value="Trebuchet MS">Trebuchet — Bersih</option><option value="system-ui">Font bawaan perangkat</option><option value="monospace">Monospace — Teknis</option></select></div>
            <div><label className="mb-2 block text-sm font-semibold text-slate-200">Warna tulisan</label><div className="grid grid-cols-2 gap-2">{([{id:'default',name:'Standar',sample:'#cbd5e1'},{id:'bright',name:'Putih terang',sample:'#ffffff'},{id:'soft',name:'Abu lembut',sample:'#94a3b8'},{id:'warm',name:'Krem',sample:'#f5deb3'}] as const).map((x) => <button type="button" key={x.id} onClick={() => onTextChange(x.id)} className={`flex items-center gap-2 rounded-xl border p-2 text-xs ${textChoice===x.id?'border-white ring-1 ring-white/20':'border-slate-700'}`}><span className="h-5 w-5 rounded" style={{backgroundColor:x.sample}}/><span className="text-slate-200">{x.name}</span></button>)}</div></div>
            <div><label className="mb-2 block text-sm font-semibold text-slate-200">Warna aksen dashboard</label><div className="flex flex-wrap gap-3">{([{id:'emerald',name:'Hijau',color:'#34d399'},{id:'blue',name:'Biru',color:'#60a5fa'},{id:'violet',name:'Ungu',color:'#a78bfa'},{id:'rose',name:'Merah muda',color:'#fb7185'},{id:'amber',name:'Emas',color:'#fbbf24'},{id:'cyan',name:'Cyan',color:'#22d3ee'}] as const).map((x) => <button type="button" key={x.id} onClick={() => onAccentChange(x.id)} title={x.name} aria-label={x.name} className={`h-9 w-9 rounded-full border-2 ${accentChoice===x.id?'border-white ring-2 ring-white/20':'border-transparent'}`} style={{backgroundColor:x.color}}>{accentChoice===x.id && <CheckCircle2 className="mx-auto h-4 w-4 text-slate-950"/>}</button>)}</div></div>
            <div><label className="mb-2 block text-sm font-semibold text-slate-200">Warna tabel</label><div className="grid grid-cols-2 gap-2">{([{id:'slate',name:'Gelap',sample:'#172033'},{id:'light',name:'Terang',sample:'#e2e8f0'},{id:'blue',name:'Biru',sample:'#172c49'},{id:'green',name:'Hijau',sample:'#17352f'}] as const).map((x) => <button type="button" key={x.id} onClick={() => onTableChange(x.id)} className={`flex items-center gap-2 rounded-xl border p-2 text-xs ${tableChoice===x.id?'border-white ring-1 ring-white/20':'border-slate-700'}`}><span className="h-5 w-5 rounded border border-white/20" style={{backgroundColor:x.sample}}/><span className="text-slate-200">{x.name}</span></button>)}</div></div>
          </div>
          <div className="mt-6 grid gap-4 border-t border-slate-700 pt-5 sm:grid-cols-3">
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 p-3 text-sm text-slate-200">Warna bebas aksen<input type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent" /></label>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 p-3 text-sm text-slate-200">Warna bebas tabel<input type="color" value={customTable} onChange={(e) => setCustomTable(e.target.value)} className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent" /></label>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 p-3 text-sm text-slate-200">Warna bebas tulisan<input type="color" value={customText} onChange={(e) => setCustomText(e.target.value)} className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent" /></label>
          </div>
          <div className="mt-6 border-t border-slate-700 pt-5"><label className="mb-2 block text-sm font-semibold text-slate-200">Foto wallpaper dashboard</label>
            <input ref={wallpaperInputRef} type="file" accept="image/*" onChange={handleWallpaperSelected} className="hidden" aria-label="Pilih foto wallpaper"/>
            <div className="flex flex-wrap gap-3"><button type="button" onClick={() => wallpaperInputRef.current?.click()} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-300"><Camera className="mr-2 inline h-4 w-4"/>Pilih foto wallpaper</button>{wallpaper && <button type="button" onClick={() => {onWallpaperChange(null); setNameMessage('Wallpaper dihapus.');}} className="rounded-xl border border-rose-400/30 px-4 py-2.5 text-sm font-semibold text-rose-200 hover:bg-rose-500/10"><Trash2 className="mr-2 inline h-4 w-4"/>Hapus wallpaper</button>}</div>
            {wallpaper && <img src={wallpaper} alt="Pratinjau wallpaper" className="mt-3 h-28 w-full rounded-xl border border-slate-700 object-cover"/>}
            <p className="mt-2 text-xs text-slate-400">Gambar maksimal 3 MB. Pengaturan ini tersimpan di browser/perangkat ini, tidak mengubah data transaksi.</p>
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
