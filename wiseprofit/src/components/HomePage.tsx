import React, { useEffect, useRef, useState } from 'react';
import { UserRound, Palette, LogOut, Save, CheckCircle2, Sparkles, Moon, Sun, Monitor, Mail, Camera, Trash2 } from 'lucide-react';
import type { AppUser } from '../context/AuthContext';
import type { BackgroundTheme } from './CosmicInteractiveBackground';
import { getProfilePhotoUrl, uploadProfilePhoto, removeProfilePhoto } from '../services/supabaseSync';

interface HomePageProps {
  user: AppUser;
  language: 'id' | 'en';
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
  { id: 'cosmic-nebula', name: 'Nebula', description: 'Dark theme with green and blue glow', preview: 'from-slate-950 via-indigo-950 to-emerald-950', icon: <Moon className="h-4 w-4" /> },
  { id: 'aurora-emerald', name: 'Aurora Green', description: 'Fresh green tones', preview: 'from-emerald-950 via-teal-900 to-slate-950', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'cyber-sapphire', name: 'Blue Sapphire', description: 'Cool, modern blue tones', preview: 'from-blue-950 via-sky-900 to-indigo-950', icon: <Monitor className="h-4 w-4" /> },
  { id: 'light-crystal', name: 'Light', description: 'Bright, lightweight background', preview: 'from-slate-100 via-white to-sky-100', icon: <Sun className="h-4 w-4" /> },
];

export const HomePage: React.FC<HomePageProps> = ({ user, language, theme, onThemeChange, accentChoice, onAccentChange, tableChoice, onTableChange, textChoice, onTextChange, fontChoice, onFontChange, wallpaper, onWallpaperChange, onSaveName, onLogout }) => {
  const t = (id: string, en: string) => language === 'id' ? id : en;
  const [name, setName] = useState(user.displayName || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoMessage, setPhotoMessage] = useState('');
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
    } catch (error) { console.error('Could not save color preference:', error); }
  }, [customAccent, customTable, customText]);

  useEffect(() => { try { setLocalPhoto(localStorage.getItem(`wp_profile_photo_${user.uid}`)); getProfilePhotoUrl(user.uid).then((url) => { if (url) setLocalPhoto(url); }).catch((error) => console.warn('[WiseProfit] Avatar cloud read failed:', error)); } catch { setLocalPhoto(null); } }, [user.uid]);


  const handleWallpaperSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setNameMessage(t('Pilih file gambar untuk wallpaper.', 'Choose an image file for the wallpaper.')); return; }
    if (file.size > 3 * 1024 * 1024) { setNameMessage(t('Ukuran wallpaper maksimal 3 MB.', 'Wallpaper must be 3 MB or smaller.')); return; }
    const reader = new FileReader();
    reader.onload = () => { const result = typeof reader.result === 'string' ? reader.result : null; if (result) { onWallpaperChange(result); setNameMessage(t('Wallpaper diterapkan di perangkat ini.', 'Wallpaper applied on this device.')); } };
    reader.onerror = () => setNameMessage(t('Gambar wallpaper tidak dapat dibaca.', 'Wallpaper image could not be read.'));
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handlePhotoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setPhotoMessage('');
    if (!file.type.startsWith('image/')) {
      setPhotoMessage(t('File bukan gambar yang valid.', 'The selected file is not a valid image.'));
      input.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoMessage(t('Ukuran foto maksimal 10 MB. Pilih foto yang lebih kecil.', 'Photo size limit is 10 MB. Choose a smaller photo.'));
      input.value = '';
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoMessage(t('Membaca foto…', 'Reading photo…'));
    try {
      // Decode the selected file directly instead of relying on Image.onload + object URLs,
      // which could leave the UI stuck in the preparation state on some browsers/formats.
      const bitmap = await Promise.race([
        createImageBitmap(file),
        new Promise<ImageBitmap>((_, reject) => window.setTimeout(() => reject(new Error('Photo decoding timed out')), 15000)),
      ]);
      try {
        setPhotoMessage(t('Mengoptimalkan foto…', 'Optimizing photo…'));
        const maxDimension = 640;
        const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(bitmap.width * scale));
        canvas.height = Math.max(1, Math.round(bitmap.height * scale));
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas is unavailable');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const blob = await Promise.race([
          new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Photo conversion failed')), 'image/jpeg', 0.88)),
          new Promise<Blob>((_, reject) => window.setTimeout(() => reject(new Error('Photo conversion timed out')), 15000)),
        ]);
        setPhotoMessage(t('Mengunggah foto ke cloud…', 'Uploading photo to cloud…'));
        const cloudUrl = await Promise.race([
          uploadProfilePhoto(user.uid, blob),
          new Promise<string>((_, reject) => window.setTimeout(() => reject(new Error('Photo upload timed out')), 30000)),
        ]);
        try { localStorage.removeItem(`wp_profile_photo_${user.uid}`); } catch { /* cloud copy is authoritative */ }
        setLocalPhoto(cloudUrl);
        window.dispatchEvent(new CustomEvent('wiseprofit-profile-photo-updated', { detail: { url: cloudUrl } }));
        setPhotoMessage(t('Foto profil berhasil disimpan dan disinkronkan.', 'Profile photo saved and synced successfully.'));
      } finally {
        bitmap.close();
      }
    } catch (error) {
      console.error('[WiseProfit] Avatar upload failed:', error);
      const detail = error instanceof Error ? error.message : String(error);
      setPhotoMessage(t(`Foto gagal diproses: ${detail}. Silakan coba JPG/PNG lain.`, `Photo could not be processed: ${detail}. Please try another JPG/PNG.`));
    } finally {
      setIsUploadingPhoto(false);
      input.value = '';
    }
  };

  const removePhoto = async () => {
    try {
      await removeProfilePhoto(user.uid);
      localStorage.removeItem(`wp_profile_photo_${user.uid}`);
      setLocalPhoto(null);
      window.dispatchEvent(new CustomEvent('wiseprofit-profile-photo-updated', { detail: { url: null } }));
      setPhotoMessage(t('Foto unggahan dihapus. Foto Google akan digunakan jika tersedia.', 'Uploaded photo removed. Google photo will be used if available.'));
    } catch (error) {
      console.error('[WiseProfit] Avatar removal failed:', error);
      setPhotoMessage(t('Foto belum dapat dihapus dari cloud. Periksa pengaturan Supabase lalu coba lagi.', 'Could not remove cloud photo. Check Supabase settings and try again.'));
    }
  };

  const saveName = async () => {
    const clean = name.trim();
    if (!clean) {
      setNameMessage(t('Nama tidak boleh kosong.', 'Name cannot be empty.'));
      return;
    }
    setIsSavingName(true);
    setNameMessage('');
    const ok = await onSaveName(clean);
    setIsSavingName(false);
    setNameMessage(ok ? t('Nama berhasil disimpan.', 'Name saved successfully.') : t('Nama belum tersimpan. Silakan coba lagi.', 'Name was not saved. Try again.'));
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = user.displayName || user.email?.split('@')[0] || 'WiseProfit User';
  const initials = (name.trim() || displayName).slice(0, 1).toUpperCase();

  return (
    <div className="w-full min-w-0 max-w-none space-y-3 animate-in fade-in text-sm">
      {mode !== 'notes' && <>
      <section className="wp-profile-hero relative overflow-hidden rounded-2xl border p-4 shadow-sm">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-4">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoSelected} className="hidden" aria-label={t('Pilih foto profil', 'Choose profile photo')} />
            <button type="button" onClick={() => photoInputRef.current?.click()} title={t('Ubah foto profil', 'Change profile photo')} aria-label={t('Ubah foto profil', 'Change profile photo')} className="wp-profile-avatar group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 text-3xl font-bold shadow-sm transition focus:outline-none focus:ring-2">
              {localPhoto ? <img src={localPhoto} alt={t('Foto profil', 'Profile photo')} className="h-full w-full object-cover" /> : user.photoURL ? <img src={user.photoURL} alt={t('Foto profil', 'Profile photo')} className="h-full w-full object-cover" /> : <span aria-label={`Initials for ${displayName}`} className="wp-profile-initials">{initials}</span>}
            </button>
            <button type="button" onClick={() => { if (photoInputRef.current) { photoInputRef.current.value = ''; photoInputRef.current.click(); } }} className="wp-profile-photo-action inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold">
              <Camera className="h-3.5 w-3.5" /> {localPhoto || user.photoURL ? t('Ubah foto', 'Change photo') : t('Tambah foto', 'Add photo')}
            </button>
            {isUploadingPhoto && <div role="status" aria-live="polite" className="mt-1 flex items-center gap-2 text-xs font-medium text-blue-600"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />{t('Sedang mengunggah foto…', 'Uploading photo…')}</div>}
            {photoMessage && <p role="status" aria-live="polite" className={`max-w-xs text-center text-xs font-medium ${photoMessage.includes('berhasil') || photoMessage.includes('successfully') ? 'text-emerald-600' : photoMessage.includes('gagal') || photoMessage.includes('could not') || photoMessage.includes('bukan') ? 'text-rose-600' : 'text-slate-500'}`}>{photoMessage}</p>}
            {localPhoto && <button type="button" onClick={removePhoto} title={t('Hapus foto profil', 'Remove profile photo')} aria-label={t('Hapus foto profil', 'Remove profile photo')} className="rounded-full p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="wp-profile-eyebrow mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"><CheckCircle2 className="h-3.5 w-3.5" /> {t('Beranda WiseProfit', 'WiseProfit Home')}</div>
            <h1 className="wp-profile-title break-words text-xl font-bold tracking-tight">{t('Halo', 'Hello')}, {displayName}!</h1>
            <p className="wp-profile-description mt-2 max-w-2xl text-sm leading-relaxed">{t('Kelola profil, sesuaikan ruang kerja, dan simpan catatan usaha di satu tempat.', 'Manage your profile, customize your workspace, and keep your business notes in one place.')}</p>
            <div className="wp-profile-email mt-3 flex items-center gap-2 break-all text-xs"><Mail className="h-3.5 w-3.5 shrink-0" />{user.email || t('Email tidak tersedia', 'Email unavailable')}</div>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-4">
        <div className="wp-profile-card rounded-2xl border p-4">
          <div className="mb-5 flex items-center gap-3"><div className="wp-profile-icon rounded-xl p-2.5"><UserRound className="h-5 w-5" /></div><div><h2 className="wp-profile-title font-bold">{t('Profil Anda', 'Your Profile')}</h2><p className="wp-profile-muted mt-1 text-xs">{t('Nama ini akan ditampilkan di WiseProfit.', 'This name will be displayed in WiseProfit.')}</p></div></div>
          <label htmlFor="wiseprofit-profile-name" className="wp-profile-label mb-2 block text-sm font-semibold">{t('Nama tampilan', 'Display name')}</label>
          <div className="flex min-w-0 flex-col gap-2"><input id="wiseprofit-profile-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder={t('Masukkan nama Anda', 'Enter your name')} className="wp-profile-input min-w-0 flex-1 rounded-xl border px-3 py-3 text-sm" /><button type="button" onClick={saveName} disabled={isSavingName} className="wp-profile-save inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold disabled:opacity-60"><Save className="h-4 w-4" />{isSavingName ? t('Menyimpan…', 'Saving…') : t('Simpan nama', 'Save name')}</button></div>
          <p className="wp-profile-muted mt-3 text-xs leading-relaxed">{t('Email akun tidak berubah. Hanya nama tampilan yang diperbarui.', 'Your account email will not change. Only your display name will be updated.')}</p>
        </div>

        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/85 p-3">
          <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-sky-400/10 p-2.5 text-sky-300"><Palette className="h-5 w-5" /></div><div><h2 className="font-bold text-white">{t('Tema Tampilan', 'Appearance Theme')}</h2><p className="mt-1 text-xs text-slate-400">{t('Pilih warna yang paling nyaman untuk Anda.', 'Choose the colors that are most comfortable for you.')}</p></div></div>
          <div className="grid min-w-0 grid-cols-1 gap-3">
            {THEMES.map((item) => (
              <button key={item.id} type="button" onClick={() => onThemeChange(item.id)} className={`rounded-xl border p-3 text-left transition-all ${theme === item.id ? 'border-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-400/30' : 'border-slate-700 bg-slate-950/60 hover:border-slate-500'}`}>
                <div className={`mb-3 h-12 rounded-lg bg-gradient-to-r ${item.preview}`} />
                <div className="flex items-center gap-2 text-sm font-semibold text-white">{item.icon}{(language === 'id' ? ({'cosmic-nebula':'Nebula Kosmik','aurora-emerald':'Aurora Hijau','cyber-sapphire':'Safir Biru','light-crystal':'Terang'} as Record<string,string>)[item.id] : item.name)}{theme === item.id && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-300" />}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{language === 'id' ? ({'cosmic-nebula':'Tema gelap dengan cahaya hijau dan biru','aurora-emerald':'Nuansa hijau segar','cyber-sapphire':'Nuansa biru modern yang sejuk','light-crystal':'Latar cerah dan ringan'} as Record<string,string>)[item.id] : item.description}</p>
              </button>
            ))}
          </div>
        </div>


        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/90 p-3">
          <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-violet-400/10 p-2.5 text-violet-300"><Palette className="h-5 w-5" /></div><div><h2 className="font-bold text-white">{t('Sesuaikan Tampilan', 'Customize Appearance')}</h2><p className="mt-1 text-xs text-slate-400">{t('Sesuaikan tema, font, warna tabel, warna teks, dan wallpaper.', 'Customize the theme, font, table colors, text colors, and wallpaper.')}</p></div></div>
          <div className="grid min-w-0 grid-cols-1 gap-4">
            <div><label className="mb-2 block text-sm font-semibold text-slate-200">{t('Jenis font', 'Font family')}</label><select value={fontChoice} onChange={(e) => onFontChange(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white"><option value="Calibri, Carlito, Arial, sans-serif">Calibri — {t('Dokumen profesional', 'Professional documents')}</option><option value="Cambria, Georgia, serif">Cambria — {t('Dokumen formal', 'Formal documents')}</option><option value="Arial, Helvetica, sans-serif">Arial</option><option value="Helvetica, Arial, sans-serif">Helvetica</option><option value="Swiss, Arial, Helvetica, sans-serif">Swiss — Sans-serif</option><option value="Aptos, Calibri, sans-serif">Aptos — {t('Office modern', 'Modern Office')}</option><option value="Times New Roman, Times, serif">Times New Roman</option><option value="Georgia, serif">Georgia — {t('Klasik', 'Classic')}</option><option value="Verdana, sans-serif">Verdana — {t('Lebar', 'Wide')}</option><option value="Tahoma, sans-serif">Tahoma</option><option value="Trebuchet MS, sans-serif">Trebuchet MS</option><option value="Garamond, serif">Garamond</option><option value="Inter, Arial, sans-serif">Inter — {t('Modern', 'Modern')}</option><option value="system-ui, sans-serif">{t('Bawaan sistem', 'System default')}</option><option value="monospace">Monospace — {t('Teknis', 'Technical')}</option></select></div>
            <div><label className="mb-2 block text-sm font-semibold text-slate-200">{t('Warna teks', 'Text color')}</label><div className="grid grid-cols-2 gap-2">{([{id:'default',name:'Default',sample:'#cbd5e1'},{id:'bright',name:'Bright white',sample:'#ffffff'},{id:'soft',name:'Soft gray',sample:'#94a3b8'},{id:'warm',name:'Cream',sample:'#f5deb3'}] as const).map((x) => <button type="button" key={x.id} onClick={() => onTextChange(x.id)} className={`flex items-center gap-2 rounded-xl border p-2 text-xs ${textChoice===x.id?'border-white ring-1 ring-white/20':'border-slate-700'}`}><span className="h-5 w-5 rounded" style={{backgroundColor:x.sample}}/><span className="text-slate-200">{language === 'id' ? ({Default:'Standar','Bright white':'Putih terang','Soft gray':'Abu-abu lembut',Cream:'Krem'} as Record<string,string>)[x.name] || x.name : x.name}</span></button>)}</div></div>
            <div><label className="mb-2 block text-sm font-semibold text-slate-200">{t('Warna aksen dasbor', 'Dashboard accent color')}</label><div className="flex flex-wrap gap-3">{([{id:'emerald',name:'Green',color:'#34d399'},{id:'blue',name:'Blue',color:'#60a5fa'},{id:'violet',name:'Purple',color:'#a78bfa'},{id:'rose',name:'Pink',color:'#fb7185'},{id:'amber',name:'Gold',color:'#fbbf24'},{id:'cyan',name:'Cyan',color:'#22d3ee'}] as const).map((x) => <button type="button" key={x.id} onClick={() => onAccentChange(x.id)} title={x.name} aria-label={x.name} className={`h-9 w-9 rounded-full border-2 ${accentChoice===x.id?'border-white ring-2 ring-white/20':'border-transparent'}`} style={{backgroundColor:x.color}}>{accentChoice===x.id && <CheckCircle2 className="mx-auto h-4 w-4 text-slate-950"/>}</button>)}</div></div>
            <div><label className="mb-2 block text-sm font-semibold text-slate-200">{t('Warna tabel', 'Table color')}</label><div className="grid grid-cols-2 gap-2">{([{id:'slate',name:'Dark',sample:'#172033'},{id:'light',name:'Light',sample:'#e2e8f0'},{id:'blue',name:'Blue',sample:'#172c49'},{id:'green',name:'Green',sample:'#17352f'}] as const).map((x) => <button type="button" key={x.id} onClick={() => onTableChange(x.id)} className={`flex items-center gap-2 rounded-xl border p-2 text-xs ${tableChoice===x.id?'border-white ring-1 ring-white/20':'border-slate-700'}`}><span className="h-5 w-5 rounded border border-white/20" style={{backgroundColor:x.sample}}/><span className="text-slate-200">{language === 'id' ? ({Dark:'Gelap',Light:'Terang',Blue:'Biru',Green:'Hijau'} as Record<string,string>)[x.name] || x.name : x.name}</span></button>)}</div></div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-700 pt-5">
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 p-3 text-sm text-slate-200">{t('Warna aksen khusus', 'Custom accent color')}<input type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent" /></label>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 p-3 text-sm text-slate-200">{t('Warna tabel khusus', 'Custom table color')}<input type="color" value={customTable} onChange={(e) => setCustomTable(e.target.value)} className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent" /></label>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 p-3 text-sm text-slate-200">{t('Warna teks khusus', 'Custom text color')}<input type="color" value={customText} onChange={(e) => setCustomText(e.target.value)} className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent" /></label>
          </div>
          <div className="mt-6 border-t border-slate-700 pt-5"><label className="mb-2 block text-sm font-semibold text-slate-200">{t('Wallpaper dasbor', 'Dashboard wallpaper')}</label>
            <input ref={wallpaperInputRef} type="file" accept="image/*" onChange={handleWallpaperSelected} className="hidden" aria-label={t('Pilih wallpaper', 'Choose wallpaper')}/>
            <div className="flex flex-wrap gap-3"><button type="button" onClick={() => wallpaperInputRef.current?.click()} className="rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-300"><Camera className="mr-2 inline h-4 w-4"/>{t('Pilih wallpaper', 'Choose wallpaper')}</button>{wallpaper && <button type="button" onClick={() => {onWallpaperChange(null); setNameMessage(t('Wallpaper dihapus.', 'Wallpaper removed.'));}} className="rounded-xl border border-rose-400/30 px-4 py-2.5 text-sm font-semibold text-rose-200 hover:bg-rose-500/10"><Trash2 className="mr-2 inline h-4 w-4"/>{t('Hapus wallpaper', 'Remove wallpaper')}</button>}</div>
            {wallpaper && <img src={wallpaper} alt={t('Pratinjau wallpaper', 'Wallpaper preview')} className="mt-3 h-28 w-full rounded-xl border border-slate-700 object-cover"/>}
            <p className="mt-2 text-xs text-slate-400">{t('Ukuran gambar maksimal 3 MB. Pengaturan ini disimpan di browser/perangkat ini dan tidak memengaruhi data transaksi.', 'Images must be 3 MB or smaller. This setting is saved in this browser/device and does not affect transaction data.')}</p>
          </div>
        </div>

      </>}
     {mode !== 'notes' && <>
      <section className="flex flex-col gap-3 rounded-2xl border border-rose-400/20 bg-rose-950/20 p-3">
        <div><h2 className="font-bold text-white">{t('Keluar dari WiseProfit', 'Sign out of WiseProfit')}</h2><p className="mt-1 text-sm leading-relaxed text-slate-400">{t('Anda akan keluar, dan data usaha disembunyikan sampai Anda masuk kembali.', 'You will be signed out, and business data will be hidden until you sign in again.')}</p></div>
        <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-5 py-3 text-sm font-bold text-rose-200 hover:bg-rose-500/20 disabled:opacity-60"><LogOut className="h-4 w-4" />{isLoggingOut ? t('Sedang keluar…', 'Signing out…') : t('Keluar', 'Sign out')}</button>
      </section>
      {nameMessage && <p role="status" className="rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-slate-300">{nameMessage}</p>}
      </>}
    </div>
  );
};
