import React, { useEffect, useRef, useState } from 'react';
import { UserRound, Palette, NotebookPen, LogOut, Save, CheckCircle2, Sparkles, Moon, Sun, Monitor, Mail, Camera, Trash2, Folder, FolderPlus, FileText, Plus, Search, ArrowLeft, Trash } from 'lucide-react';
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

type NoteFolder = { id: string; name: string };
type SavedNote = { id: string; title: string; content: string; folderId: string; updatedAt: number };

const DEFAULT_NOTE_FOLDERS: NoteFolder[] = [{ id: 'personal', name: 'Pribadi' }, { id: 'business', name: 'Usaha' }];

const THEMES: { id: BackgroundTheme; name: string; description: string; preview: string; icon: React.ReactNode }[] = [
  { id: 'cosmic-nebula', name: 'Nebula', description: 'Gelap, tenang, dengan cahaya hijau dan biru', preview: 'from-slate-950 via-indigo-950 to-emerald-950', icon: <Moon className="h-4 w-4" /> },
  { id: 'aurora-emerald', name: 'Aurora Hijau', description: 'Nuansa hijau yang segar', preview: 'from-emerald-950 via-teal-900 to-slate-950', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'cyber-sapphire', name: 'Biru Sapphire', description: 'Biru sejuk dan modern', preview: 'from-blue-950 via-sky-900 to-indigo-950', icon: <Monitor className="h-4 w-4" /> },
  { id: 'light-crystal', name: 'Terang', description: 'Latar cerah dan ringan', preview: 'from-slate-100 via-white to-sky-100', icon: <Sun className="h-4 w-4" /> },
];

export const HomePage: React.FC<HomePageProps> = ({ user, theme, onThemeChange, accentChoice, onAccentChange, tableChoice, onTableChange, textChoice, onTextChange, fontChoice, onFontChange, wallpaper, onWallpaperChange, onSaveName, onLogout }) => {
  const [name, setName] = useState(user.displayName || '');
  const [noteFolders, setNoteFolders] = useState<NoteFolder[]>(DEFAULT_NOTE_FOLDERS);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [activeFolderId, setActiveFolderId] = useState('all');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [noteSearch, setNoteSearch] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);
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
      const foldersRaw = localStorage.getItem(`wp_note_folders_${user.uid}`);
      const notesRaw = localStorage.getItem(`wp_notes_v2_${user.uid}`);
      const folders = foldersRaw ? JSON.parse(foldersRaw) as NoteFolder[] : DEFAULT_NOTE_FOLDERS;
      const notes = notesRaw ? JSON.parse(notesRaw) as SavedNote[] : [];
      const legacyNote = localStorage.getItem(`wp_notes_${user.uid}`) || '';
      const migratedNotes = notes.length || !legacyNote.trim() ? notes : [{ id: `legacy-${Date.now()}`, title: 'Catatan lama', content: legacyNote, folderId: 'personal', updatedAt: Date.now() }];
      setNoteFolders(folders.length ? folders : DEFAULT_NOTE_FOLDERS);
      setSavedNotes(migratedNotes);
      setActiveFolderId('all');
      setActiveNoteId(null);
      setDraftTitle('');
      setDraftContent('');
      setLocalPhoto(localStorage.getItem(`wp_profile_photo_${user.uid}`));
    } catch {
      setNoteFolders(DEFAULT_NOTE_FOLDERS);
      setSavedNotes([]);
      setLocalPhoto(null);
    }
  }, [user.uid]);

  useEffect(() => {
    try {
      localStorage.setItem(`wp_note_folders_${user.uid}`, JSON.stringify(noteFolders));
      localStorage.setItem(`wp_notes_v2_${user.uid}`, JSON.stringify(savedNotes));
    } catch (error) {
      console.error('Catatan belum dapat disimpan di browser:', error);
    }
  }, [user.uid, noteFolders, savedNotes]);

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

  const createNote = () => {
    const folderId = activeFolderId === 'all' ? 'personal' : activeFolderId;
    const id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newNote: SavedNote = { id, title: '', content: '', folderId, updatedAt: Date.now() };
    setSavedNotes((previous) => [newNote, ...previous]);
    setActiveNoteId(id);
    setDraftTitle('');
    setDraftContent('');
  };

  const openNote = (item: SavedNote) => {
    setActiveNoteId(item.id);
    setDraftTitle(item.title);
    setDraftContent(item.content);
  };

  const updateCurrentNote = (field: 'title' | 'content', value: string) => {
    if (field === 'title') setDraftTitle(value); else setDraftContent(value);
    if (!activeNoteId) return;
    setSavedNotes((previous) => previous.map((item) => item.id === activeNoteId ? { ...item, [field]: value, updatedAt: Date.now() } : item));
  };

  const saveNote = () => {
    if (!activeNoteId) { setNameMessage('Pilih atau buat catatan terlebih dahulu.'); return; }
    setSavedNotes((previous) => previous.map((item) => item.id === activeNoteId ? { ...item, title: draftTitle.trim() || 'Catatan tanpa judul', content: draftContent, updatedAt: Date.now() } : item));
    setNameMessage('Catatan disimpan di browser/perangkat ini.');
  };

  const addNoteFolder = () => {
    const clean = newFolderName.trim();
    if (!clean) return;
    const folder = { id: `folder-${Date.now()}`, name: clean.slice(0, 32) };
    setNoteFolders((previous) => [...previous, folder]);
    setActiveFolderId(folder.id);
    setNewFolderName('');
    setShowFolderInput(false);
  };

  const deleteCurrentNote = () => {
    if (!activeNoteId) return;
    setSavedNotes((previous) => previous.filter((item) => item.id !== activeNoteId));
    setActiveNoteId(null);
    setDraftTitle('');
    setDraftContent('');
    setNameMessage('Catatan dihapus.');
  };

  const visibleNotes = savedNotes
    .filter((item) => activeFolderId === 'all' || item.folderId === activeFolderId)
    .filter((item) => `${item.title} ${item.content}`.toLowerCase().includes(noteSearch.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt);

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
    <div className="w-full min-w-0 max-w-none space-y-3 animate-in fade-in text-sm">
      <section className="wp-profile-hero relative overflow-hidden rounded-2xl border p-4 shadow-sm">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-4">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoSelected} className="hidden" aria-label="Pilih foto profil" />
            <button type="button" onClick={() => photoInputRef.current?.click()} title="Ganti foto profil" aria-label="Ganti foto profil" className="wp-profile-avatar group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 text-3xl font-bold shadow-sm transition focus:outline-none focus:ring-2">
              {localPhoto ? <img src={localPhoto} alt="Foto profil" className="h-full w-full object-cover" /> : user.photoURL ? <img src={user.photoURL} alt="Foto profil" className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9" />}
            </button>
            {localPhoto && <button type="button" onClick={removePhoto} title="Hapus foto profil" aria-label="Hapus foto profil" className="rounded-full p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="wp-profile-eyebrow mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"><CheckCircle2 className="h-3.5 w-3.5" /> Beranda WiseProfit</div>
            <h1 className="wp-profile-title break-words text-xl font-bold tracking-tight">Halo, {displayName}!</h1>
            <p className="wp-profile-description mt-2 max-w-2xl text-sm leading-relaxed">Atur profil, pilih tampilan yang nyaman, dan simpan catatan pribadi usaha Anda di satu tempat.</p>
            <div className="wp-profile-email mt-3 flex items-center gap-2 break-all text-xs"><Mail className="h-3.5 w-3.5 shrink-0" />{user.email || 'Email tidak tersedia'}</div>
          </div>
        </div>
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-4">
        <div className="wp-profile-card rounded-2xl border p-4">
          <div className="mb-5 flex items-center gap-3"><div className="wp-profile-icon rounded-xl p-2.5"><UserRound className="h-5 w-5" /></div><div><h2 className="wp-profile-title font-bold">Profil Anda</h2><p className="wp-profile-muted mt-1 text-xs">Nama ini akan digunakan di WiseProfit.</p></div></div>
          <label htmlFor="wiseprofit-profile-name" className="wp-profile-label mb-2 block text-sm font-semibold">Nama tampilan</label>
          <div className="flex min-w-0 flex-col gap-2"><input id="wiseprofit-profile-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Masukkan nama Anda" className="wp-profile-input min-w-0 flex-1 rounded-xl border px-3 py-3 text-sm" /><button type="button" onClick={saveName} disabled={isSavingName} className="wp-profile-save inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold disabled:opacity-60"><Save className="h-4 w-4" />{isSavingName ? 'Menyimpan…' : 'Simpan nama'}</button></div>
          <p className="wp-profile-muted mt-3 text-xs leading-relaxed">Email akun tidak berubah. Anda hanya mengubah nama yang ditampilkan.</p>
        </div>

        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/85 p-3">
          <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-sky-400/10 p-2.5 text-sky-300"><Palette className="h-5 w-5" /></div><div><h2 className="font-bold text-white">Tema tampilan</h2><p className="mt-1 text-xs text-slate-400">Pilih warna yang paling nyaman dilihat.</p></div></div>
          <div className="grid min-w-0 grid-cols-1 gap-3">
            {THEMES.map((item) => (
              <button key={item.id} type="button" onClick={() => onThemeChange(item.id)} className={`rounded-xl border p-3 text-left transition-all ${theme === item.id ? 'border-emerald-400 bg-emerald-400/10 ring-1 ring-emerald-400/30' : 'border-slate-700 bg-slate-950/60 hover:border-slate-500'}`}>
                <div className={`mb-3 h-12 rounded-lg bg-gradient-to-r ${item.preview}`} />
                <div className="flex items-center gap-2 text-sm font-semibold text-white">{item.icon}{item.name}{theme === item.id && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-300" />}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.description}</p>
              </button>
            ))}
          </div>
        </div>


        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/90 p-3">
          <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-violet-400/10 p-2.5 text-violet-300"><Palette className="h-5 w-5" /></div><div><h2 className="font-bold text-white">Personalisasi tampilan</h2><p className="mt-1 text-xs text-slate-400">Atur tema, font, warna tabel, warna tulisan, dan wallpaper sesuka hati.</p></div></div>
          <div className="grid min-w-0 grid-cols-1 gap-4">
            <div><label className="mb-2 block text-sm font-semibold text-slate-200">Jenis font</label><select value={fontChoice} onChange={(e) => onFontChange(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white"><option value="Calibri, Carlito, Arial, sans-serif">Calibri — Dokumen resmi</option><option value="Cambria, Georgia, serif">Cambria — Dokumen formal</option><option value="Arial, Helvetica, sans-serif">Arial</option><option value="Helvetica, Arial, sans-serif">Helvetica</option><option value="Swiss, Arial, Helvetica, sans-serif">Swiss — Sans-serif</option><option value="Aptos, Calibri, sans-serif">Aptos — Office modern</option><option value="Times New Roman, Times, serif">Times New Roman</option><option value="Georgia, serif">Georgia — Klasik</option><option value="Verdana, sans-serif">Verdana — Lebar</option><option value="Tahoma, sans-serif">Tahoma</option><option value="Trebuchet MS, sans-serif">Trebuchet MS</option><option value="Garamond, serif">Garamond</option><option value="Inter, Arial, sans-serif">Inter — Modern</option><option value="system-ui, sans-serif">Font bawaan perangkat</option><option value="monospace">Monospace — Teknis</option></select></div>
            <div><label className="mb-2 block text-sm font-semibold text-slate-200">Warna tulisan</label><div className="grid grid-cols-2 gap-2">{([{id:'default',name:'Standar',sample:'#cbd5e1'},{id:'bright',name:'Putih terang',sample:'#ffffff'},{id:'soft',name:'Abu lembut',sample:'#94a3b8'},{id:'warm',name:'Krem',sample:'#f5deb3'}] as const).map((x) => <button type="button" key={x.id} onClick={() => onTextChange(x.id)} className={`flex items-center gap-2 rounded-xl border p-2 text-xs ${textChoice===x.id?'border-white ring-1 ring-white/20':'border-slate-700'}`}><span className="h-5 w-5 rounded" style={{backgroundColor:x.sample}}/><span className="text-slate-200">{x.name}</span></button>)}</div></div>
            <div><label className="mb-2 block text-sm font-semibold text-slate-200">Warna aksen dashboard</label><div className="flex flex-wrap gap-3">{([{id:'emerald',name:'Hijau',color:'#34d399'},{id:'blue',name:'Biru',color:'#60a5fa'},{id:'violet',name:'Ungu',color:'#a78bfa'},{id:'rose',name:'Merah muda',color:'#fb7185'},{id:'amber',name:'Emas',color:'#fbbf24'},{id:'cyan',name:'Cyan',color:'#22d3ee'}] as const).map((x) => <button type="button" key={x.id} onClick={() => onAccentChange(x.id)} title={x.name} aria-label={x.name} className={`h-9 w-9 rounded-full border-2 ${accentChoice===x.id?'border-white ring-2 ring-white/20':'border-transparent'}`} style={{backgroundColor:x.color}}>{accentChoice===x.id && <CheckCircle2 className="mx-auto h-4 w-4 text-slate-950"/>}</button>)}</div></div>
            <div><label className="mb-2 block text-sm font-semibold text-slate-200">Warna tabel</label><div className="grid grid-cols-2 gap-2">{([{id:'slate',name:'Gelap',sample:'#172033'},{id:'light',name:'Terang',sample:'#e2e8f0'},{id:'blue',name:'Biru',sample:'#172c49'},{id:'green',name:'Hijau',sample:'#17352f'}] as const).map((x) => <button type="button" key={x.id} onClick={() => onTableChange(x.id)} className={`flex items-center gap-2 rounded-xl border p-2 text-xs ${tableChoice===x.id?'border-white ring-1 ring-white/20':'border-slate-700'}`}><span className="h-5 w-5 rounded border border-white/20" style={{backgroundColor:x.sample}}/><span className="text-slate-200">{x.name}</span></button>)}</div></div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-700 pt-5">
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

        <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/95">
          <div className="flex flex-col items-stretch gap-3 border-b border-slate-700 px-3 py-3">
            <div className="flex items-center gap-3"><div className="rounded-xl bg-amber-400/10 p-2.5 text-amber-300"><NotebookPen className="h-5 w-5" /></div><div><h2 className="font-bold text-white">Notes</h2><p className="mt-1 text-xs text-slate-400">Catatan seperti aplikasi Notes di ponsel, tersusun dalam folder.</p></div></div>
            <button type="button" onClick={createNote} className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-3 py-2 text-sm font-bold text-slate-950 hover:bg-amber-200"><Plus className="h-4 w-4"/>Catatan baru</button>
          </div>
          <div className="grid min-w-0 grid-cols-1">
            <aside className="border-b border-slate-700 p-3">
              <div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Folder</span><button type="button" onClick={() => setShowFolderInput((value) => !value)} title="Buat folder" className="rounded-lg p-1.5 text-amber-200 hover:bg-amber-300/10"><FolderPlus className="h-4 w-4"/></button></div>
              {showFolderInput && <form onSubmit={(e) => { e.preventDefault(); addNoteFolder(); }} className="mb-3 flex gap-1"><input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} autoFocus maxLength={32} placeholder="Nama folder" className="min-w-0 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-white"/><button type="submit" className="rounded-lg bg-amber-300 px-2 text-xs font-bold text-slate-950">OK</button></form>}
              <div className="flex gap-2 overflow-x-auto flex-col">
                <button type="button" onClick={() => {setActiveFolderId('all'); setActiveNoteId(null);}} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${activeFolderId === 'all' ? 'bg-amber-300/15 text-amber-200' : 'text-slate-300 hover:bg-slate-800'}`}><Folder className="h-4 w-4"/>Semua <span className="ml-auto text-xs opacity-70">{savedNotes.length}</span></button>
                {noteFolders.map((folder) => <button type="button" key={folder.id} onClick={() => {setActiveFolderId(folder.id); setActiveNoteId(null);}} className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${activeFolderId === folder.id ? 'bg-amber-300/15 text-amber-200' : 'text-slate-300 hover:bg-slate-800'}`}><Folder className="h-4 w-4"/><span className="truncate">{folder.name}</span><span className="ml-auto text-xs opacity-70">{savedNotes.filter((n) => n.folderId === folder.id).length}</span></button>)}
              </div>
            </aside>
            <div className="min-w-0">
              {!activeNoteId ? <>
                <div className="border-b border-slate-800 p-3"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"/><input value={noteSearch} onChange={(e) => setNoteSearch(e.target.value)} placeholder="Cari catatan..." className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white"/></div></div>
                <div className="max-h-[420px] overflow-y-auto p-2">
                  {visibleNotes.length ? visibleNotes.map((item) => <button key={item.id} type="button" onClick={() => openNote(item)} className="mb-2 block w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-left transition hover:border-amber-300/40 hover:bg-slate-900"><div className="flex items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-amber-300"/><span className="truncate text-sm font-semibold text-slate-100">{item.title || 'Catatan tanpa judul'}</span></div><p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-slate-400">{item.content || 'Belum ada isi catatan'}</p><p className="mt-2 text-[10px] text-slate-500">{new Date(item.updatedAt).toLocaleString('id-ID', {dateStyle:'medium',timeStyle:'short'})} · {noteFolders.find((f) => f.id === item.folderId)?.name || 'Folder'}</p></button>) : <div className="p-8 text-center text-sm text-slate-500"><NotebookPen className="mx-auto mb-2 h-7 w-7 opacity-50"/>Belum ada catatan di folder ini.</div>}
                </div>
              </> : <div className="p-3 sm:p-4">
                <div className="mb-3 flex items-center justify-between gap-2"><button type="button" onClick={() => setActiveNoteId(null)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-300/10"><ArrowLeft className="h-3.5 w-3.5"/>Semua catatan</button><button type="button" onClick={deleteCurrentNote} title="Hapus catatan" className="rounded-lg p-2 text-rose-300 hover:bg-rose-500/10"><Trash className="h-4 w-4"/></button></div>
                <input value={draftTitle} onChange={(e) => updateCurrentNote('title', e.target.value)} maxLength={120} placeholder="Judul catatan" className="mb-3 w-full border-0 border-b border-slate-700 bg-transparent px-1 py-3 text-lg font-bold text-white outline-none placeholder:text-slate-600"/>
                <textarea value={draftContent} onChange={(e) => updateCurrentNote('content', e.target.value)} maxLength={20000} rows={12} placeholder="Mulai menulis..." className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3 text-sm leading-7 text-slate-100 outline-none focus:border-amber-300/40"/>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-slate-500">Tersimpan otomatis di browser ini · {draftContent.length} karakter</p><button type="button" onClick={saveNote} className="inline-flex items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-300/15"><Save className="h-4 w-4"/>Simpan sekarang</button></div>
              </div>}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-rose-400/20 bg-rose-950/20 p-3">
        <div><h2 className="font-bold text-white">Keluar dari WiseProfit</h2><p className="mt-1 text-sm leading-relaxed text-slate-400">Akun akan keluar dan data usaha tidak ditampilkan sampai Anda masuk kembali.</p></div>
        <button type="button" onClick={handleLogout} disabled={isLoggingOut} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-5 py-3 text-sm font-bold text-rose-200 hover:bg-rose-500/20 disabled:opacity-60"><LogOut className="h-4 w-4" />{isLoggingOut ? 'Sedang keluar…' : 'Keluar dari akun'}</button>
      </section>
      {nameMessage && <p role="status" className="rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-slate-300">{nameMessage}</p>}
    </div>
  );
};
