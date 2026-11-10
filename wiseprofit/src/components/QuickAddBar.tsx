import React, { useState, useEffect, useRef } from 'react';
import { t } from '../i18n/translations';
import { InventoryItem } from '../types/inventory';
import { calculateItem, formatRupiah, formatAngka } from '../utils/calculator';
import { Plus, Calendar, Package, Calculator, ChevronDown, X } from 'lucide-react';

interface QuickAddBarProps {
  onAdd: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  globalSavePercentMonthly?: number;
}
const inputClass = "w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm text-[#18345F] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1.5 block text-xs font-semibold text-[#385477]";

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onAdd, globalSavePercentMonthly = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!isExpanded) return;
    const handleOutsideInteraction = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && panelRef.current && !panelRef.current.contains(target)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideInteraction, true);
    return () => document.removeEventListener('pointerdown', handleOutsideInteraction, true);
  }, [isExpanded]);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [tanggalInput, setTanggalInput] = useState(todayStr);
  const [namaBarang, setNamaBarang] = useState('');
  const [satuanWadah, setSatuanWadah] = useState('Dus');
  const [jumlahWadah, setJumlahWadah] = useState<number | ''>('');
  const [satuanUnit, setSatuanUnit] = useState('pcs');
  const [hargaBeli, setHargaBeli] = useState<number | ''>('');
  const [hargaJual, setHargaJual] = useState<number | ''>('');
  const [catatan, setCatatan] = useState('');
  const qty = Number(jumlahWadah) || 0;
  const buy = Number(hargaBeli) || 0;
  const sell = Number(hargaJual) || 0;
  const preview = qty > 0 && buy > 0 && sell > 0 ? calculateItem({
    id: 'tmp', namaBarang: namaBarang || 'Barang', satuanWadah: satuanWadah || 'Wadah',
    jumlahBarangWadah: qty, satuanUnit: satuanUnit || 'pcs', hargaBeli: buy,
    jumlahBarangDijualSatuan: 0, hargaJualSatuan: sell, perputaranBulan: 1,
    persentaseLabaDisimpanBulanan: globalSavePercentMonthly, tanggalInput,
    createdAt: 0, updatedAt: 0,
  }) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBarang.trim() || qty <= 0 || buy <= 0 || sell <= 0) return;
    onAdd({
      namaBarang: namaBarang.trim(), satuanWadah: satuanWadah || 'Wadah',
      jumlahBarangWadah: qty, satuanUnit: satuanUnit || 'pcs', hargaBeli: buy,
      jumlahBarangDijualSatuan: 0, hargaJualSatuan: sell, perputaranBulan: 1,
      persentaseLabaDisimpanBulanan: globalSavePercentMonthly, tanggalInput,
      catatan: catatan.trim(),
    });
    setNamaBarang(''); setJumlahWadah(''); setHargaBeli(''); setHargaJual(''); setCatatan('');
    setIsExpanded(false);
  };

  return (
    <section ref={panelRef} className="wp-quick-add-panel mb-0 rounded-2xl border border-blue-100 bg-white/95 p-4 shadow-[0_12px_32px_rgba(37,99,235,0.08)] backdrop-blur-xl sm:p-5">
      <button type="button" onClick={() => setIsExpanded((open) => !open)} aria-expanded={isExpanded} className="flex w-full items-center justify-between gap-3 text-left">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Package className="h-5 w-5" /></span>
          <span className="min-w-0"><span className="block text-sm font-bold text-[#18345F]">{t('quick.title')}</span><span className="block text-xs text-slate-500">{isExpanded ? 'Formulir input barang' : 'Buka formulir untuk menambahkan barang'}</span></span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700">
          {isExpanded ? <><X className="h-4 w-4" />Tutup</> : <><Plus className="h-4 w-4" />Tambah Barang</>}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {isExpanded && <form onSubmit={handleSubmit} className="mt-4 space-y-4 border-t border-blue-100 pt-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#42618B]">Informasi barang</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div><label className={labelClass}>{t('quick.inputDate')}</label><div className="relative"><Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" /><input type="date" required value={tanggalInput} onChange={e=>setTanggalInput(e.target.value)} className={inputClass+" pl-9"} /></div></div>
            <div className="sm:col-span-2"><label className={labelClass}>{t('quick.itemName')}</label><input type="text" required value={namaBarang} onChange={e=>setNamaBarang(e.target.value)} placeholder={t('quick.itemPlaceholder')} className={inputClass} /></div>
            <div><label className={labelClass}>Satuan kemasan</label><input type="text" value={satuanWadah} onChange={e=>setSatuanWadah(e.target.value)} placeholder="Dus / Karton / Pak" className={inputClass} /></div>
            <div><label className={labelClass}>Isi per kemasan</label><input type="number" min="1" required value={jumlahWadah} onChange={e=>setJumlahWadah(e.target.value===''?'':Number(e.target.value))} placeholder="Contoh: 24" className={inputClass} /></div>
            <div><label className={labelClass}>Satuan barang</label><input type="text" value={satuanUnit} onChange={e=>setSatuanUnit(e.target.value)} placeholder="Pcs / Botol / Kg" className={inputClass} /></div>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#42618B]">Informasi harga</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div><label className={labelClass}>Harga beli total per kemasan</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span><input type="number" min="1" required value={hargaBeli} onChange={e=>setHargaBeli(e.target.value===''?'':Number(e.target.value))} placeholder="0" className={inputClass+" pl-9"} /></div></div>
            <div><label className={labelClass}>Harga jual per satuan</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span><input type="number" min="1" required value={hargaJual} onChange={e=>setHargaJual(e.target.value===''?'':Number(e.target.value))} placeholder="0" className={inputClass+" pl-9"} /></div></div>
            <div className="sm:col-span-2"><label className={labelClass}>Catatan barang (opsional)</label><input type="text" value={catatan} onChange={e=>setCatatan(e.target.value)} placeholder="Contoh: Kulakan agen, rak depan..." className={inputClass} /></div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-blue-50 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {preview ? <>
              <div className="rounded-xl bg-blue-50 px-3 py-2"><span className="block text-[10px] text-slate-500">Modal per satuan</span><strong className="text-sm text-[#18345F]">{formatRupiah(preview.hppSatuan)}</strong></div>
              <div className="rounded-xl bg-emerald-50 px-3 py-2"><span className="block text-[10px] text-slate-500">Untung per satuan</span><strong className="text-sm text-emerald-700">+{formatRupiah(preview.gainSatuan)}</strong></div>
              <div className="rounded-xl bg-indigo-50 px-3 py-2"><span className="block text-[10px] text-slate-500">Potensi keuntungan total</span><strong className="text-sm text-indigo-700">+{formatRupiah(preview.potensiTotalGain)}</strong><span className="ml-1 text-[10px] text-slate-500">({formatAngka(preview.marginPersen,1)}%)</span></div>
            </> : <span className="flex items-center gap-2 text-xs text-slate-500"><Calculator className="h-4 w-4 text-blue-500" />Isi jumlah dan harga untuk melihat perhitungan otomatis.</span>}
          </div>
          <button type="submit" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.98]"><Plus className="h-4 w-4" />Tambah Barang</button>
        </div>
      </form>}
    </section>
  );
};
