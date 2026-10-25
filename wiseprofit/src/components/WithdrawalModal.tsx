import React, { useState } from 'react';
import { Withdrawal } from '../types/inventory';
import { formatRupiah } from '../utils/calculator';
import { 
  Wallet, 
  ArrowDownCircle, 
  Trash2, 
  Plus, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  X,
  History
} from 'lucide-react';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawals: Withdrawal[];
  saldoKasSaatIni: number;
  onAddWithdrawal: (nominal: number, tanggal: string, catatan?: string) => Promise<boolean>;
  onDeleteWithdrawal: (id: string) => Promise<boolean>;
  isSaving?: boolean;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  withdrawals,
  saldoKasSaatIni,
  onAddWithdrawal,
  onDeleteWithdrawal,
  isSaving = false,
}) => {
  const [nominalInput, setNominalInput] = useState<string>('');
  const [tanggalInput, setTanggalInput] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [catatanInput, setCatatanInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const parsedNominal = Math.max(0, Number(nominalInput.replace(/\D/g, '')) || 0);
  const projectedSaldo = saldoKasSaatIni - parsedNominal;
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + (Number(w.nominal) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (parsedNominal <= 0) {
      setErrorMessage('Masukkan jumlah penarikan lebih dari Rp0.');
      return;
    }

    if (!tanggalInput) {
      setErrorMessage('Pilih tanggal penarikan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await onAddWithdrawal(parsedNominal, tanggalInput, catatanInput.trim() || undefined);
      if (ok) {
        setSuccessMessage(`Penarikan berhasil dicatat ${formatRupiah(parsedNominal)} ke Cloud.`);
        setNominalInput('');
        setCatatanInput('');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage('Penarikan belum berhasil disimpan. Periksa koneksi lalu coba lagi.');
      }
    } catch (err) {
      setErrorMessage('Terjadi kesalahan saat menyimpan data penarikan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteWithdrawal(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreset = (amount: number) => {
    setNominalInput(String(amount));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Penarikan Uang / Kas Toko
              </h2>
              <p className="text-xs text-slate-400">
                Pencatatan uang keluar dari kasir (ambil untung / keperluan pribadi / operasional)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Status Banners */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Current Cashflow Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Uang yang tersedia:</span>
              </div>
              <div className="text-xl font-bold text-emerald-400 tabular-nums">
                {formatRupiah(saldoKasSaatIni)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Total uang fisik di laci kasir
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <ArrowDownCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Total uang yang sudah ditarik:</span>
              </div>
              <div className="text-xl font-bold text-rose-400 tabular-nums">
                {formatRupiah(totalWithdrawn)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {withdrawals.length} riwayat penarikan tercatat
              </div>
            </div>
          </div>

          {/* New Withdrawal Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 border border-emerald-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Catat Penarikan Kas Baru
              </span>
              {parsedNominal > 0 && (
                <span className={`text-[11px] font-mono font-medium ${projectedSaldo < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  Sisa Kas Menjadi: <strong className={projectedSaldo < 0 ? 'text-rose-300' : 'text-emerald-300'}>{formatRupiah(projectedSaldo)}</strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nominal Input */}
              <div className="space-y-1 sm:col-span-1">
                <label className="block text-xs font-medium text-slate-300">
                  Nominal Penarikan (Rp) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1000"
                    placeholder="0"
                    value={nominalInput}
                    onChange={(e) => setNominalInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-emerald-500 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Tanggal Input */}
              <div className="space-y-1 sm:col-span-1">
                <label className="block text-xs font-medium text-slate-300">
                  Tanggal Penarikan *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={tanggalInput}
                    onChange={(e) => setTanggalInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Catatan Input */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300">
                  Catatan / Keperluan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Ambil laba harian, Kebutuhan pribadi, Uang transport..."
                  value={catatanInput}
                  onChange={(e) => setCatatanInput(e.target.value)}
                  maxLength={500}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-mono mr-1">Pilihan Cepat:</span>
              {[20000, 50000, 100000, 200000, 500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handlePreset(amt)}
                  className="px-2.5 py-1 text-[11px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg cursor-pointer transition-colors"
                >
                  +{amt >= 1000 ? `${amt / 1000}rb` : amt}
                </button>
              ))}
              {saldoKasSaatIni > 0 && (
                <button
                  type="button"
                  onClick={() => handlePreset(saldoKasSaatIni)}
                  className="px-2.5 py-1 text-[11px] font-mono bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 rounded-lg cursor-pointer transition-colors"
                >
                  Tarik Semua Kas
                </button>
              )}
            </div>

            {/* Warning if overdrawn */}
            {parsedNominal > saldoKasSaatIni && saldoKasSaatIni > 0 && (
              <div className="text-[11px] text-amber-300 font-mono bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Nominal penarikan ({formatRupiah(parsedNominal)}) melebihi sisa kasir saat ini ({formatRupiah(saldoKasSaatIni)}). Kas toko akan berstatus defisit.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || parsedNominal <= 0}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold font-mono text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan ke Cloud...' : `Simpan Penarikan ${parsedNominal > 0 ? formatRupiah(parsedNominal) : ''}`}</span>
            </button>
          </form>

          {/* Withdrawal History Table */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-400" />
                Riwayat Penarikan Kas ({withdrawals.length})
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Tersimpan Permanen di Supabase
              </span>
            </div>

            {withdrawals.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800 text-slate-400 space-y-1">
                <p className="text-sm font-medium text-slate-300">Belum ada riwayat penarikan kas</p>
                <p className="text-xs text-slate-500">Uang tunai hasil penjualan dan sisa modal masih tersimpan penuh di kasir.</p>
              </div>
            ) : (
              <div className="border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80 bg-slate-950/60 max-h-64 overflow-y-auto">
                {withdrawals.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-900/60 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-rose-400 tabular-nums">
                          -{formatRupiah(item.nominal)}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {item.tanggal}
                        </span>
                      </div>
                      {item.catatan ? (
                        <p className="text-xs text-slate-300 font-sans">
                          {item.catatan}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          Tanpa catatan
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      title="Hapus riwayat penarikan ini"
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Jumlah ini akan mengurangi uang kas yang tersedia.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
