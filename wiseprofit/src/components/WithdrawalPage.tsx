import React, { useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowLeft, CalendarDays, CheckCircle2, CircleAlert, Clock3, History, Trash2, Wallet } from 'lucide-react';
import { formatRupiah } from '../utils/calculator';
import type { Language } from '../i18n/translations';

export interface WithdrawalRecord {
  id: string;
  userId: string;
  nominal: number;
  tanggal: string;
  catatan?: string;
  createdAt: number;
}

interface WithdrawalPageProps {
  withdrawals: WithdrawalRecord[];
  language: Language;
  availableBalance: number;
  isSaving: boolean;
  onSave: (data: { nominal: number; tanggal: string; catatan: string }) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  onBackToInventory?: () => void;
}

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const WithdrawalPage: React.FC<WithdrawalPageProps> = ({
  withdrawals,
  language,
  availableBalance,
  isSaving,
  onSave,
  onDelete,
  onBackToInventory,
}) => {
  const [nominalInput, setNominalInput] = useState('');
  const [tanggal, setTanggal] = useState(today);
  const [catatan, setCatatan] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const nominal = Number(nominalInput);
  const isId = language === 'id';
  const totalWithdrawals = useMemo(
    () => withdrawals.reduce((total, item) => total + Math.max(0, Number(item.nominal) || 0), 0),
    [withdrawals]
  );

  const validationMessage = useMemo(() => {
    if (!nominalInput.trim()) return isId ? 'Masukkan nominal penarikan.' : 'Enter a withdrawal amount.';
    if (!Number.isSafeInteger(nominal) || nominal <= 0) return isId ? 'Nominal harus berupa angka bulat lebih besar dari Rp0.' : 'Amount must be a positive whole number.';
    if (nominal > availableBalance) return isId ? 'Saldo kas tidak mencukupi untuk penarikan ini.' : 'Insufficient cash balance for this withdrawal.';
    if (!tanggal) return isId ? 'Pilih tanggal penarikan.' : 'Select a withdrawal date.';
    if (!catatan.trim()) return isId ? 'Isi catatan atau tujuan penarikan.' : 'Enter a note or withdrawal purpose.';
    if (catatan.trim().length > 500) return isId ? 'Catatan maksimal 500 karakter.' : 'Notes must be 500 characters or fewer.';
    return '';
  }, [nominalInput, nominal, availableBalance, tanggal, catatan]);

  const handleRequestSave = () => {
    setError('');
    setSuccess('');
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    if (!confirmed) {
      setError(isId ? 'Centang konfirmasi bahwa data penarikan sudah benar.' : 'Confirm that the withdrawal details are correct.');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    setError('');
    if (nominal > availableBalance) {
      setShowConfirmation(false);
      setError(isId ? 'Saldo kas berubah dan tidak lagi mencukupi. Periksa saldo lalu coba lagi.' : 'The cash balance changed and is no longer sufficient. Review the balance and try again.');
      return;
    }
    const saved = await onSave({ nominal, tanggal, catatan: catatan.trim() });
    setShowConfirmation(false);
    if (!saved) {
      setError(isId ? 'Transaksi gagal disimpan. Periksa koneksi lalu coba kembali.' : 'Could not save the transaction. Check your connection and try again.');
      return;
    }
    setSuccess(isId ? 'Penarikan berhasil disimpan ke riwayat akun Anda.' : 'Withdrawal saved to your account history.');
    setNominalInput('');
    setTanggal(today());
    setCatatan('');
    setConfirmed(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 bg-slate-900/80 border border-slate-700/60 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase">
            <ArrowDownToLine className="w-4 h-4" /> TRANSAKSI KAS KELUAR
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-2">Penarikan Uang</h1>
          <p className="text-sm text-slate-400 mt-1">Catat uang yang diambil dari kas usaha, beserta alasan dan tanggalnya.</p>
        </div>
        {onBackToInventory && (
          <button
            type="button"
            onClick={onBackToInventory}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Kembali ke Kasir</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-5 sm:p-6 bg-slate-900/85 border border-slate-700/60 rounded-2xl space-y-5">
          <div className="flex items-center gap-3 p-4 bg-emerald-950/50 border border-emerald-500/25 rounded-xl">
            <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Saldo kas tersedia</p>
              <p className="text-2xl font-extrabold font-mono text-emerald-300 break-words">{formatRupiah(availableBalance)}</p>
              <p className="text-[11px] text-slate-500 mt-1">Sudah dikurangi riwayat penarikan yang tercatat.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="withdrawal-amount" className="block text-sm font-semibold text-slate-200">Nominal penarikan (Rp)</label>
            <input id="withdrawal-amount" inputMode="numeric" type="number" min="1" step="1" value={nominalInput}
              onChange={(event) => { setNominalInput(event.target.value); setError(''); setSuccess(''); setShowConfirmation(false); }}
              placeholder="Contoh: 150000"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-lg font-mono text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20" />
            <p className="text-xs text-slate-500">Nominal yang dimasukkan harus berupa rupiah bulat tanpa tanda titik atau koma.</p>
            {nominalInput && Number.isFinite(nominal) && nominal > 0 && (
              <p className="text-sm text-slate-300">Anda akan menarik <strong className="text-rose-300">{formatRupiah(nominal)}</strong>.</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="withdrawal-date" className="block text-sm font-semibold text-slate-200">Tanggal penarikan</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                <input id="withdrawal-date" type="date" value={tanggal} max={today()}
                  onChange={(event) => { setTanggal(event.target.value); setError(''); setSuccess(''); }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-3 text-white outline-none focus:border-emerald-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">Perkiraan saldo setelah penarikan</label>
              <div className={`rounded-xl border px-4 py-3 font-mono font-bold ${nominal > availableBalance ? 'border-rose-500/50 bg-rose-950/30 text-rose-300' : 'border-slate-700 bg-slate-950 text-emerald-300'}`}>
                {formatRupiah(availableBalance - (Number.isFinite(nominal) && nominal > 0 ? nominal : 0))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="withdrawal-note" className="block text-sm font-semibold text-slate-200">Catatan / tujuan penarikan</label>
            <textarea id="withdrawal-note" rows={3} maxLength={500} value={catatan}
              onChange={(event) => { setCatatan(event.target.value); setError(''); setSuccess(''); }}
              placeholder="Contoh: kebutuhan pribadi, biaya operasional, atau pengambilan pemilik"
              className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400 placeholder:text-slate-600" />
            <p className="text-right text-xs text-slate-500">{catatan.length}/500 karakter</p>
          </div>

          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-700 bg-slate-950/60 cursor-pointer">
            <input type="checkbox" checked={confirmed} onChange={(event) => { setConfirmed(event.target.checked); setError(''); }}
              className="mt-1 accent-emerald-400" />
            <span className="text-sm text-slate-300">Saya telah memeriksa nominal, tanggal, dan catatan. Saya memahami bahwa penarikan akan mengurangi saldo kas usaha.</span>
          </label>

          {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-200"><CircleAlert className="w-4 h-4 shrink-0 mt-0.5" />{error}</div>}
          {success && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-sm text-emerald-200"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />{success}</div>}

          <button type="button" disabled={isSaving} onClick={handleRequestSave}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3.5 font-bold text-slate-950 transition-colors">
            <CheckCircle2 className="w-4 h-4" />{isSaving ? 'Menyimpan...' : 'Periksa & Konfirmasi Penarikan'}
          </button>

          {showConfirmation && (
            <div role="dialog" aria-modal="true" aria-labelledby="withdrawal-confirm-title" className="rounded-2xl border border-amber-400/40 bg-amber-950/40 p-4 space-y-3">
              <h2 id="withdrawal-confirm-title" className="font-bold text-white">Konfirmasi terakhir</h2>
              <p className="text-sm text-slate-300">Simpan penarikan sebesar <strong className="text-rose-300">{formatRupiah(nominal)}</strong> pada {tanggal}? Saldo setelah penarikan diperkirakan <strong className="text-emerald-300">{formatRupiah(availableBalance - nominal)}</strong>.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button type="button" disabled={isSaving} onClick={() => setShowConfirmation(false)} className="flex-1 rounded-xl border border-slate-600 px-4 py-2.5 text-slate-200 hover:bg-slate-800">Periksa lagi</button>
                <button type="button" disabled={isSaving} onClick={handleConfirmSave} className="flex-1 rounded-xl bg-emerald-400 px-4 py-2.5 font-bold text-slate-950 hover:bg-emerald-300 disabled:opacity-50">{isSaving ? 'Menyimpan...' : 'Ya, simpan penarikan'}</button>
              </div>
            </div>
          )}
        </div>

        <aside className="p-5 bg-slate-900/70 border border-slate-700/60 rounded-2xl h-fit space-y-4">
          <div className="flex items-center gap-2 text-slate-200 font-bold"><History className="w-4 h-4 text-emerald-300" /> Ringkasan penarikan</div>
          <div>
            <p className="text-xs text-slate-500">Total penarikan tercatat</p>
            <p className="text-xl font-bold font-mono text-rose-300">{formatRupiah(totalWithdrawals)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Jumlah transaksi</p>
            <p className="text-xl font-bold text-white">{withdrawals.length}</p>
          </div>
          <div className="flex items-start gap-2 border-t border-slate-800 pt-3 text-xs text-slate-500 leading-relaxed">
            <Clock3 className="w-4 h-4 shrink-0" />
            Riwayat tersimpan pada akun yang sedang masuk dan akan dimuat kembali saat aplikasi dibuka.
          </div>
        </aside>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/85">
        <div className="flex items-center justify-between gap-3 p-5 border-b border-slate-800">
          <div>
            <h2 className="font-bold text-white text-lg">Riwayat Penarikan</h2>
            <p className="text-xs text-slate-500 mt-1">Transaksi terbaru ditampilkan lebih dahulu.</p>
          </div>
          <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{withdrawals.length} transaksi</span>
        </div>
        {withdrawals.length === 0 ? (
          <div className="p-10 text-center">
            <History className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">Belum ada riwayat penarikan</p>
            <p className="text-xs text-slate-500 mt-1">Transaksi yang sudah dikonfirmasi akan muncul di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-950/70 text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Catatan</th>
                  <th className="px-5 py-3 text-right">Nominal</th>
                  <th className="px-5 py-3">Waktu dicatat</th>
                  {onDelete && <th className="px-5 py-3 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[...withdrawals].sort((a, b) => b.createdAt - a.createdAt).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="px-5 py-4 whitespace-nowrap text-slate-300">{new Date(item.tanggal + 'T00:00:00').toLocaleDateString(isId ? 'id-ID' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-4 text-slate-200 max-w-sm"><div className="break-words">{item.catatan || '—'}</div><div className="text-[10px] text-slate-600 mt-1 font-mono">{item.id}</div></td>
                    <td className="px-5 py-4 text-right whitespace-nowrap font-mono font-bold text-rose-300">−{formatRupiah(item.nominal)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">{new Date(item.createdAt).toLocaleString(isId ? 'id-ID' : 'en-US')}</td>
                    {onDelete && (
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={async () => {
                            const confirmedDelete = window.confirm(isId ? `Hapus riwayat penarikan ${formatRupiah(item.nominal)}? Saldo kas akan dihitung ulang.` : `Delete withdrawal ${formatRupiah(item.nominal)}? The cash balance will be recalculated.`);
                            if (!confirmedDelete) return;
                            const deleted = await onDelete(item.id);
                            if (!deleted) setError(isId ? 'Riwayat gagal dihapus. Periksa koneksi lalu coba lagi.' : 'Could not delete the history. Check your connection and try again.');
                            else setSuccess(isId ? 'Riwayat penarikan berhasil dihapus.' : 'Withdrawal history deleted.');
                          }}
                          title="Hapus riwayat penarikan"
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
