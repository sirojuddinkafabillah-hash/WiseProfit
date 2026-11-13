import { useRef, useState } from 'react';
import { Download, FileJson, FileSpreadsheet, LoaderCircle, ShieldCheck, Upload } from 'lucide-react';
import type { InventoryItem, Withdrawal } from '../types/inventory';
import { formatRupiah } from '../utils/calculator';
import { saveInventoryItemToCloud, saveUserProfile, saveWithdrawalToCloud } from '../services/supabaseSync';

type Backup = { version?: number; appName?: string; exportedAt?: string; modalAwal?: number; modal_awal?: number; items: InventoryItem[]; withdrawals?: Withdrawal[]; notes?: unknown[]; noteFolders?: unknown[] };
const validItem = (value: unknown): value is InventoryItem => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<InventoryItem>;
  return typeof item.id === 'string' && typeof item.namaBarang === 'string' && item.namaBarang.trim().length > 0 &&
    Number.isFinite(Number(item.jumlahBarangWadah)) && Number(item.jumlahBarangWadah) >= 1 &&
    Number.isFinite(Number(item.hargaBeli)) && Number(item.hargaBeli) >= 0 &&
    Number.isFinite(Number(item.hargaJualSatuan)) && Number(item.hargaJualSatuan) >= 0 &&
    Number.isFinite(Number(item.jumlahBarangDijualSatuan)) && Number(item.jumlahBarangDijualSatuan) >= 0 && Number(item.jumlahBarangDijualSatuan) <= Number(item.jumlahBarangWadah);
};
const validWithdrawal = (value: unknown): value is Withdrawal => {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Withdrawal>;
  return typeof item.id === 'string' && Number.isFinite(Number(item.nominal)) && Number(item.nominal) > 0 && typeof item.tanggal === 'string';
};
const safeLocalArray = (key: string): unknown[] => { try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
const download = (name: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export default function ExportImportModule({ userId, email, items, withdrawals, modalAwal, onRestoreData }: {
  userId: string; email: string | null; items: InventoryItem[]; withdrawals: Withdrawal[]; modalAwal: number;
  onRestoreData: (items: InventoryItem[], withdrawals: Withdrawal[], modalAwal: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'success' | 'error' | 'info'; text: string } | null>(null);
  const exportJson = () => {
    try {
      const payload: Backup = {
        version: 2, appName: 'WiseProfit Next', exportedAt: new Date().toISOString(), modalAwal, items, withdrawals,
        notes: safeLocalArray('wp_notes_v2_' + userId),
        noteFolders: safeLocalArray('wp_note_folders_' + userId),
      };
      download('wiseprofit-backup-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(payload, null, 2), 'application/json');
      setMessage({ kind: 'success', text: 'Cadangan JSON berhasil dibuat. Simpan file ini di tempat aman.' });
    } catch (error) { setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Gagal membuat cadangan.' }); }
  };
  const exportCsv = () => {
    const rows = [['Nama barang', 'Jumlah per wadah', 'Satuan', 'Harga beli', 'Harga jual per unit', 'Jumlah terjual', 'Tanggal input'],
      ...items.map(item => [item.namaBarang, String(item.jumlahBarangWadah), item.satuanUnit, String(item.hargaBeli), String(item.hargaJualSatuan), String(item.jumlahBarangDijualSatuan), item.tanggalInput || ''])];
    const csv = rows.map(row => row.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\r\n');
    download('wiseprofit-inventaris-' + new Date().toISOString().slice(0, 10) + '.csv', '\uFEFF' + csv, 'text/csv;charset=utf-8');
    setMessage({ kind: 'success', text: 'Data inventaris berhasil diekspor ke CSV.' });
  };
  const importFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setMessage({ kind: 'error', text: 'Ukuran file melebihi batas 20 MB.' }); return; }
    setBusy(true); setMessage({ kind: 'info', text: 'Memeriksa struktur dan validitas cadangan...' });
    try {
      const parsed = JSON.parse(await file.text()) as Backup | InventoryItem[];
      const rawItems = Array.isArray(parsed) ? parsed : parsed?.items;
      if (!Array.isArray(rawItems)) throw new Error('Format tidak dikenali. File harus berisi daftar items.');
      const cleanItems = rawItems.filter(validItem).map(item => ({ ...item, namaBarang: item.namaBarang.trim(), jumlahBarangWadah: Number(item.jumlahBarangWadah), jumlahBarangDijualSatuan: Number(item.jumlahBarangDijualSatuan), hargaBeli: Number(item.hargaBeli), hargaJualSatuan: Number(item.hargaJualSatuan), createdAt: Number(item.createdAt) || Date.now(), updatedAt: Date.now() }));
      if (cleanItems.length !== rawItems.length) throw new Error('Ada data barang yang tidak valid. Tidak ada data yang diimpor.');
      if (!cleanItems.length) throw new Error('Cadangan tidak berisi barang. Data akun tidak diubah.');
      const rawWithdrawals = Array.isArray(parsed) ? [] : (parsed.withdrawals || []);
      const cleanWithdrawals = rawWithdrawals.filter(validWithdrawal);
      if (cleanWithdrawals.length !== rawWithdrawals.length) throw new Error('Ada data penarikan yang tidak valid. Tidak ada data yang diimpor.');
      const importedModal = Array.isArray(parsed) ? modalAwal : Number(parsed.modalAwal ?? parsed.modal_awal ?? modalAwal);
      if (!Number.isFinite(importedModal) || importedModal < 0) throw new Error('Nilai modal awal pada file tidak valid.');
      if (!window.confirm('Impor ' + cleanItems.length + ' barang dan ' + cleanWithdrawals.length + ' penarikan? Data yang memiliki ID sama akan diperbarui; data lain yang sudah ada tidak dihapus.')) return;
      setMessage({ kind: 'info', text: 'Menyimpan cadangan ke akun Supabase...' });
      await saveUserProfile(userId, { email: email || undefined, modal_awal: importedModal });
      await Promise.all(cleanItems.map(item => saveInventoryItemToCloud(userId, item)));
      await Promise.all(cleanWithdrawals.map(item => saveWithdrawalToCloud(userId, item)));
      if (!Array.isArray(parsed)) {
        if (Array.isArray(parsed.notes)) localStorage.setItem('wp_notes_v2_' + userId, JSON.stringify(parsed.notes));
        if (Array.isArray(parsed.noteFolders)) localStorage.setItem('wp_note_folders_' + userId, JSON.stringify(parsed.noteFolders));
      }
      const mergedItems = new Map(items.map(item => [item.id, item]));
      cleanItems.forEach(item => mergedItems.set(item.id, item));
      const mergedWithdrawals = new Map(withdrawals.map(item => [item.id, item]));
      cleanWithdrawals.forEach(item => mergedWithdrawals.set(item.id, item));
      onRestoreData([...mergedItems.values()].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)), [...mergedWithdrawals.values()].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)), importedModal);
      setMessage({ kind: 'success', text: 'Impor berhasil: ' + cleanItems.length + ' barang dan ' + cleanWithdrawals.length + ' penarikan tersimpan. Data yang tidak ada di file tetap dipertahankan.' });
    } catch (error) {
      setMessage({ kind: 'error', text: (error instanceof Error ? error.message : 'Gagal membaca atau menyimpan cadangan.') + ' Jika gangguan terjadi saat penyimpanan cloud, sebagian baris mungkin sudah tersimpan. Mengimpor ulang file yang sama aman karena data diperbarui berdasarkan ID.' });
    } finally { setBusy(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  return <section className="module-stack">
    <div className="module-intro"><div><span className="eyebrow">KEAMANAN DATA</span><h2>Ekspor & Impor Data</h2><p>Buat salinan data usaha atau pulihkan data dari file cadangan.</p></div></div>
    <div className="backup-status glass"><ShieldCheck size={20}/><div><b>Cadangan akun saat ini</b><span>{items.length} barang · {withdrawals.length} penarikan · Modal awal {formatRupiah(modalAwal)}</span></div></div>
    <div className="backup-grid">
      <article className="glass backup-card"><div className="backup-icon"><FileJson size={21}/></div><h3>Cadangan lengkap JSON</h3><p>Menyimpan barang, penarikan, modal awal, dan catatan lokal pada perangkat ini.</p><button className="primary-button" onClick={exportJson}><Download size={16}/> Unduh JSON</button></article>
      <article className="glass backup-card"><div className="backup-icon"><FileSpreadsheet size={21}/></div><h3>Ekspor inventaris CSV</h3><p>Format tabel yang dapat dibuka melalui Excel, Google Sheets, atau aplikasi spreadsheet lain.</p><button className="primary-button" onClick={exportCsv}><Download size={16}/> Unduh CSV</button></article>
      <article className="glass backup-card"><div className="backup-icon"><Upload size={21}/></div><h3>Impor cadangan JSON</h3><p>Periksa format file sebelum menyimpan. Data yang tidak ada di file tidak akan dihapus.</p><input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={e => void importFile(e.target.files?.[0])}/><button className="primary-button" onClick={() => fileRef.current?.click()} disabled={busy}>{busy?<LoaderCircle className="spin" size={16}/>:<Upload size={16}/>} Pilih file JSON</button></article>
    </div>
    {message && <div role="status" className={'backup-message ' + message.kind}>{message.text}</div>}
    <p className="module-footnote">Penting: proses impor menggabungkan data berdasarkan ID dan tidak menghapus data akun yang sudah ada. Setelah impor, periksa kembali laporan serta saldo kas.</p>
  </section>;
}
