import React, { useState, useRef } from 'react';
import { InventoryItem, GlobalSummary } from '../types/inventory';
import { exportBackupJSON, parseBackupJSON, fetchServerBackup } from '../utils/storageBackup';
import { useAuth } from '../context/AuthContext';
import { batchUploadToCloud, fetchUserItemsOnce, getUserProfile } from '../services/supabaseSync';
import { 
  X, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Laptop, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Server,
  Cloud,
  LogIn,
  RefreshCw,
  Table
} from 'lucide-react';
import { exportToStyledExcel, exportToStandardCSV } from '../utils/excelExporter';

interface DownloadModalProps {
  language: 'id' | 'en';
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  modalAwal: number;
  summary: GlobalSummary;
  onRestoreData: (items: InventoryItem[], modalAwal: number) => void;
  onOpenAuthModal?: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  language,
  isOpen,
  onClose,
  items,
  modalAwal,
  summary,
  onRestoreData,
  onOpenAuthModal,
}) => {
  const { user } = useAuth();
  const isId = language === 'id';
  const t = (id: string, en: string) => isId ? id : en;
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Download Excel (.xlsx) matching user screenshot format
  const handleDownloadExcel = () => {
    try {
      exportToStyledExcel(items, modalAwal);
      setStatusMessage({ type: 'success', text: t('Data berhasil disimpan sebagai file Excel.', 'Data exported to Excel successfully.') });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: `Gagal mengekspor ke Excel: ${e?.message || 'Error'}` });
    }
  };

  // 1b. Download CSV
  const handleDownloadCSV = () => {
    try {
      exportToStandardCSV(items, modalAwal);
      setStatusMessage({ type: 'success', text: t('Data berhasil disimpan sebagai file CSV.', 'Data exported to CSV successfully.') });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: `Gagal mengekspor ke CSV: ${e?.message || 'Error'}` });
    }
  };

  // 2. Download JSON Backup
  const handleDownloadJSON = () => {
    try {
      exportBackupJSON(items, modalAwal);
      setStatusMessage({ 
        type: 'success', 
        text: t('File cadangan berhasil diunduh. Simpan di tempat yang aman.', 'Backup downloaded. Keep it somewhere safe.') 
      });
    } catch {
      setStatusMessage({ type: 'error', text: t('Gagal mengunduh file cadangan.', 'Failed to download the backup file.') });
    }
  };

  // 3. Upload & Restore JSON Backup
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: t('File cadangan terlalu besar. Ukuran maksimum yang didukung adalah 20 MB.', 'Backup file is too large. The maximum supported size is 20 MB.') });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string' || !content.trim()) {
          throw new Error(t('File kosong atau tidak dapat dibaca.', 'The file is empty or cannot be read.'));
        }
        const parsed = parseBackupJSON(content);
        if (!parsed.items.length) {
          setStatusMessage({
            type: 'error',
            text: t('Cadangan tidak berisi data barang yang valid. Data saat ini tidak diubah.', 'The backup contains no valid inventory items. Current data has not been changed.')
          });
          return;
        }

        onRestoreData(parsed.items, parsed.modalAwal);
        setStatusMessage({
          type: 'success',
          text: t(`Berhasil memproses cadangan berisi ${parsed.items.length} barang dan modal Rp ${parsed.modalAwal.toLocaleString('id-ID')}. Sinkronisasi akun berjalan melalui aplikasi.`, `Restored a backup containing ${parsed.items.length} items and starting capital Rp ${parsed.modalAwal.toLocaleString('en-US')}. Account sync is handled by the app.`)
        });
      } catch (error) {
        setStatusMessage({
          type: 'error',
          text: t(`File cadangan tidak valid atau rusak: ${error instanceof Error ? error.message : 'Format JSON tidak sesuai'}`, `Backup file is invalid or corrupted: ${error instanceof Error ? error.message : 'Invalid JSON format'}`)
        });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setStatusMessage({ type: 'error', text: t('File tidak dapat dibaca. Coba pilih file JSON lain.', 'The file could not be read. Try another JSON file.') });
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // 4. Restore from Local Server
  const handleRestoreFromServer = async () => {
    setIsServerLoading(true);
    setStatusMessage(null);
    try {
      const serverData = await fetchServerBackup();
      if (serverData && serverData.items && serverData.items.length > 0) {
        onRestoreData(serverData.items, serverData.modalAwal || modalAwal);
        setStatusMessage({
          type: 'success',
          text: t(`Berhasil memulihkan ${serverData.items.length} barang dari salinan server lokal!`, `Restored ${serverData.items.length} items from the local server backup!`)
        });
      } else {
        setStatusMessage({
          type: 'info',
          text: t('Belum ada data cadangan di server lokal.', 'No backup is available on the local server yet.')
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: t('Gagal menghubungi server lokal.', 'Could not connect to the local server.')
      });
    } finally {
      setIsServerLoading(false);
    }
  };

  // 5. Cloud Sync Now
  const handleCloudSyncNow = async () => {
    if (!user) return;
    setIsCloudSyncing(true);
    setStatusMessage(null);
    try {
      await batchUploadToCloud(user.uid, user.email || '', modalAwal, items);
      setStatusMessage({
        type: 'success',
        text: t(`Semua ${items.length} barang berhasil dicadangkan ke Cloud Supabase!`, `All ${items.length} items were backed up to Supabase Cloud!`)
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: t('Gagal sinkronisasi ke cloud: ', 'Cloud sync failed: ') + (err instanceof Error ? err.message : String(err))
      });
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // 6. Fetch / Restore from Cloud
  const handleCloudFetchNow = async () => {
    if (!user) return;
    setIsCloudSyncing(true);
    setStatusMessage(null);
    try {
      const [cloudItems, profile] = await Promise.all([
        fetchUserItemsOnce(user.uid),
        getUserProfile(user.uid)
      ]);
      if (cloudItems && cloudItems.length > 0) {
        onRestoreData(cloudItems, profile?.modalAwal ?? modalAwal);
        setStatusMessage({
          type: 'success',
          text: t(`Berhasil memuat ${cloudItems.length} barang dari akun cloud Anda!`, `Loaded ${cloudItems.length} items from your cloud account!`)
        });
      } else {
        setStatusMessage({
          type: 'info',
          text: t('Belum ada data tersimpan di akun cloud Anda.', 'No data has been saved to your cloud account yet.')
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: t('Gagal mengambil data dari cloud: ', 'Failed to fetch data from cloud: ') + (err instanceof Error ? err.message : String(err))
      });
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // 7. Standalone Offline HTML
  const handleDownloadOfflineHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan Toko - ${new Date().toLocaleDateString('id-ID')}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; background: #f8fafc; }
    .card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 900px; margin: 0 auto; }
    h1 { font-size: 20px; margin-top: 0; color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    .num { text-align: right; }
    .text-emerald { color: #059669; font-weight: 600; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 16px 0; }
    .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .stat-label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .stat-val { font-size: 18px; font-weight: bold; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Laporan Usaha</h1>
    <p style="font-size: 12px; color: #64748b;">Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
    <div class="stats">
      <div class="stat">
        <div class="stat-label">Modal Awal</div>
        <div class="stat-val">Rp ${modalAwal.toLocaleString('id-ID')}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Uang yang Tersedia</div>
        <div class="stat-val text-emerald">Rp ${summary.saldoKasSaatIni.toLocaleString('id-ID')}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Keuntungan Penjualan</div>
        <div class="stat-val text-emerald">Rp ${summary.totalGainTerjual.toLocaleString('id-ID')}</div>
      </div>
      <div class="stat">
        <div class="stat-label">Total Nilai Usaha</div>
        <div class="stat-val">Rp ${summary.totalSetelahUntung.toLocaleString('id-ID')}</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Nama Barang</th>
          <th>Isi</th>
          <th class="num">Harga Beli</th>
          <th class="num">Terjual</th>
          <th class="num">Harga Jual</th>
          <th class="num">Untung</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((it, idx) => {
          const hpp = it.hargaBeli / (it.jumlahBarangWadah || 1);
          const untung = Math.max(0, (it.hargaJualSatuan - hpp) * it.jumlahBarangDijualSatuan);
          return `<tr>
            <td>${idx + 1}</td>
            <td><strong>${it.namaBarang}</strong></td>
            <td>${it.jumlahBarangWadah} unit</td>
            <td class="num">Rp ${it.hargaBeli.toLocaleString('id-ID')}</td>
            <td class="num"><strong>${it.jumlahBarangDijualSatuan}</strong> / ${it.jumlahBarangWadah}</td>
            <td class="num">Rp ${it.hargaJualSatuan.toLocaleString('id-ID')}</td>
            <td class="num text-emerald">+Rp ${Math.round(untung).toLocaleString('id-ID')}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kalkulator_dagang_offline_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMessage({ type: 'success', text: t('Aplikasi web offline (.html) berhasil diunduh!', 'Offline web app (.html) downloaded successfully!') });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/80 text-slate-100 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">{t('Pusat Cadangan, Cloud & Ekspor Data', 'Backup, Cloud & Data Export Center')}</h3>
              <p className="text-[11px] text-slate-400 font-mono">{t('Amankan pembukuan toko di server online atau file fisik', 'Keep your store records safe online or in a local file')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Status Message Alert */}
          {statusMessage && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 font-mono ${
              statusMessage.type === 'success' 
                ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300' 
                : statusMessage.type === 'error'
                ? 'bg-rose-950/70 border-rose-500/40 text-rose-300'
                : 'bg-blue-950/70 border-blue-500/40 text-blue-300'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : statusMessage.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              ) : (
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
              )}
              <div className="flex-1 font-medium">{statusMessage.text}</div>
            </div>
          )}

          {/* CLOUD SECTION: The user's requested solution */}
          <div className={`p-4 rounded-xl border transition-all ${
            user 
              ? 'bg-slate-950/80 border-emerald-500/30 text-slate-200' 
              : 'bg-slate-950/80 border-emerald-500/40 text-slate-200'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-2 font-mono">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-xs text-white">
                  {user ? t('Penyimpanan Cloud Online (Aktif)', 'Cloud Storage Online (Active)') : t('Simpan Online ke Server (Rekomendasi)', 'Save Online to Server (Recommended)')}
                </span>
              </div>
              {user ? (
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  {t('Tersinkron', 'Synced')}
                </span>
              ) : (
                <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                  {t('Belum Login', 'Not Signed In')}
                </span>
              )}
            </div>

            {user ? (
              <div>
                <p className="text-xs text-slate-400 font-mono">
                  {t('Terhubung ke akun:', 'Connected to account:')} <strong className="text-emerald-400">{user.email}</strong>. {t('Seluruh penambahan barang dan perubahan kas otomatis tersimpan di server cloud.', 'All item additions and cash changes are automatically saved to the cloud database.')}
                </p>
                <div className="mt-3 flex items-center gap-2 font-mono">
                  <button
                    onClick={handleCloudSyncNow}
                    disabled={isCloudSyncing}
                    className="px-3.5 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm shadow-emerald-500/20"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                    <span>{t('Simpan ke akun', 'Save to account')}</span>
                  </button>
                  <button
                    onClick={handleCloudFetchNow}
                    disabled={isCloudSyncing}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('Tarik Data Cloud', 'Fetch Cloud Data')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Dengan login email, Anda bebas menghapus histori penelusuran atau cache browser kapan saja tanpa takut data hilang. Cukup masuk kembali, dan data langsung pulih!
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuthModal?.();
                  }}
                  className="mt-3 px-4 py-2 text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('Masuk dengan Email / Google', 'Sign in with Email / Google')}</span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION 1: CADANGAN MANUAL (FILE FISIK) */}
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Cadangan Manual File Fisik (.JSON)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Download JSON Backup */}
              <button
                onClick={handleDownloadJSON}
                className="p-3 rounded-xl border border-blue-500/30 hover:border-blue-500/60 bg-blue-950/40 hover:bg-blue-950/60 flex items-start gap-2.5 text-left transition-all cursor-pointer group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Download className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-bold text-blue-200">{t('Unduh Cadangan (.JSON)', 'Download Backup (.JSON)')}</div>
                  <div className="text-[10px] font-mono text-blue-300/70 mt-0.5">{t('Simpan ke HP/Laptop atau kirim ke WA/Drive', 'Save to your phone/computer or send via WhatsApp/Drive')}</div>
                </div>
              </button>

              {/* Upload & Restore JSON Backup */}
              <label className="p-3 rounded-xl border border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-950/40 hover:bg-emerald-950/60 flex items-start gap-2.5 text-left transition-all cursor-pointer group shadow-2xs">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-bold text-emerald-200">{t('Pulihkan File Cadangan', 'Restore Backup File')}</div>
                  <div className="text-[10px] font-mono text-emerald-300/70 mt-0.5">{t('Pilih file .json cadangan Anda yang pernah diunduh', 'Select a previously downloaded .json backup file')}</div>
                </div>
              </label>
            </div>

            {/* Restore from Server Button */}
            <button
              onClick={handleRestoreFromServer}
              disabled={isServerLoading}
              className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 flex items-center justify-between text-left transition-all cursor-pointer disabled:opacity-60 text-xs text-slate-200 font-mono"
            >
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{t('Pulihkan dari Salinan Server Lokal', 'Restore from Local Server Backup')}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {isServerLoading ? t('Memeriksa...', 'Checking...') : t('Cek Salinan', 'Check Backup')}
              </span>
            </button>
          </div>

          {/* SECTION 2: EKSPOR LAPORAN */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              {t('Ekspor & Rekap Laporan', 'Export & Report Summary')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option: Excel (.xlsx) Styled 12-Columns */}
              <button
                onClick={handleDownloadExcel}
                className="p-3 rounded-xl border border-cyan-500/40 bg-[#1f4e78]/40 hover:bg-[#1f4e78]/70 flex items-center gap-2.5 text-left transition-all cursor-pointer group shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1f4e78] text-cyan-200 border border-cyan-400/50 flex items-center justify-center shrink-0">
                  <Table className="w-4 h-4 text-cyan-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-bold text-white">{t('Excel (.xlsx) Format Toko', 'Excel (.xlsx) Store Format')}</div>
                  <div className="text-[10px] font-mono text-cyan-200/80">{t('12 Kolom Persis Gambar', 'Exact 12-Column Layout')}</div>
                </div>
              </button>

              {/* Option: CSV */}
              <button
                onClick={handleDownloadCSV}
                className="p-3 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 flex items-center gap-2.5 text-left transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-bold text-slate-100">{t('Format CSV (Excel)', 'CSV Format (Excel)')}</div>
                  <div className="text-[10px] font-mono text-slate-400">{t('12 Kolom Standar', '12 Standard Columns')}</div>
                </div>
              </button>

              {/* Option: Standalone Offline Web HTML */}
              <button
                onClick={handleDownloadOfflineHTML}
                className="p-3 rounded-xl border border-slate-700 bg-slate-950 hover:bg-slate-800 flex items-center gap-2.5 text-left transition-all cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono font-bold text-slate-100">{t('Web Mandiri (.html)', 'Standalone Web App (.html)')}</div>
                  <div className="text-[10px] font-mono text-slate-400">{t('Buka tanpa internet', 'Open without internet')}</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-between items-center text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('Tersambung ke Cloud Database Supabase', 'Connected to Supabase Cloud Database')}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            {t('Tutup', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
