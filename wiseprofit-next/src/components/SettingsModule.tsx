import { useRef, useState } from 'react';
import { Camera, LoaderCircle, Moon, Save, Sun, Trash2, UserRound } from 'lucide-react';
import { formatRupiah } from '../utils/calculator';
import { removeProfilePhoto, saveUserProfile, uploadProfilePhoto } from '../services/supabaseSync';

export default function SettingsModule({ userId, email, modalAwal, onModalAwalChange, dark, onToggleTheme, avatarUrl, onAvatarChange }: {
  userId: string; email: string | null; modalAwal: number; onModalAwalChange: (value: number) => void;
  dark: boolean; onToggleTheme: () => void; avatarUrl: string | null; onAvatarChange: (url: string | null) => void;
}) {
  const [capital, setCapital] = useState(String(modalAwal));
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const saveCapital = async (event: React.FormEvent) => {
    event.preventDefault(); const value = Number(capital);
    if (!Number.isFinite(value) || value < 0) { setNotice('Modal awal harus berupa angka nol atau lebih.'); return; }
    setSaving(true); setNotice('');
    try { await saveUserProfile(userId, { modal_awal: value }); onModalAwalChange(value); setNotice('Modal awal berhasil disimpan ke profil akun.'); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Pengaturan gagal disimpan.'); }
    finally { setSaving(false); }
  };
  const upload = async (file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setNotice('Ukuran foto maksimal 10 MB.'); if (fileRef.current) fileRef.current.value = ''; return; }
    if (file.type !== 'image/jpeg') { setNotice('Untuk saat ini gunakan foto JPG/JPEG agar sesuai dengan aturan penyimpanan Supabase.'); if (fileRef.current) fileRef.current.value = ''; return; }
    setPhotoBusy(true); setNotice('');
    try { const url = await uploadProfilePhoto(userId, file); onAvatarChange(url); setNotice('Foto profil berhasil diunggah.'); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Foto profil gagal diunggah.'); }
    finally { setPhotoBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  };
  const remove = async () => {
    if (!window.confirm('Hapus foto profil dari akun ini?')) return;
    setPhotoBusy(true); setNotice('');
    try { await removeProfilePhoto(userId, avatarUrl); onAvatarChange(null); setNotice('Foto profil berhasil dihapus.'); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Foto profil gagal dihapus.'); }
    finally { setPhotoBusy(false); }
  };
  return <section className="module-stack">
    <div className="module-intro"><div><span className="eyebrow">PREFERENSI AKUN</span><h2>Pengaturan</h2><p>Atur identitas profil, modal awal, dan tampilan aplikasi.</p></div></div>
    <div className="settings-grid">
      <article className="glass settings-card"><div className="module-form-title"><UserRound size={18}/><b>Profil akun</b></div><div className="settings-profile"><div className="settings-avatar">{avatarUrl ? <img src={avatarUrl} alt="Foto profil"/> : <UserRound size={28}/>}</div><div><b>{email || 'Akun WiseProfit'}</b><small>Foto JPG/JPEG · Maksimal 10 MB</small></div></div><input ref={fileRef} type="file" accept="image/jpeg,.jpg,.jpeg" hidden onChange={e => void upload(e.target.files?.[0])}/><div className="settings-actions"><button className="primary-button" onClick={() => fileRef.current?.click()} disabled={photoBusy}>{photoBusy?<LoaderCircle className="spin" size={15}/>:<Camera size={15}/>} Unggah foto</button>{avatarUrl&&<button className="secondary-button" onClick={() => void remove()} disabled={photoBusy}><Trash2 size={15}/> Hapus foto</button>}</div></article>
      <article className="glass settings-card"><div className="module-form-title"><Sun size={18}/><b>Tampilan</b></div><p className="settings-description">Pilih tema yang nyaman digunakan. Pengaturan tema berlaku langsung pada dashboard ini.</p><button className="theme-setting-button" onClick={onToggleTheme}>{dark?<Moon size={18}/>:<Sun size={18}/>}<span><b>{dark?'Tema gelap':'Tema terang'}</b><small>Klik untuk beralih ke tema {dark?'terang':'gelap'}.</small></span><span className="theme-switch">{dark?'ON':'OFF'}</span></button></article>
    </div>
    <form className="glass module-form settings-capital" onSubmit={saveCapital}><div className="module-form-title"><Save size={18}/><b>Modal awal usaha</b></div><p className="settings-description">Modal awal menjadi dasar perhitungan saldo kas dan ekuitas. Mengubahnya akan memperbarui ringkasan laporan.</p><label>Modal awal (Rp)<input type="number" min="0" step="1" value={capital} onChange={e => setCapital(e.target.value)} required/></label><div className="settings-capital-preview"><span>Nilai saat ini</span><b>{formatRupiah(modalAwal)}</b></div><button className="primary-button" type="submit" disabled={saving}>{saving?<LoaderCircle className="spin" size={15}/>:<Save size={15}/>} Simpan modal awal</button></form>
    {notice&&<p role="status" className="module-footnote">{notice}</p>}
  </section>;
}
