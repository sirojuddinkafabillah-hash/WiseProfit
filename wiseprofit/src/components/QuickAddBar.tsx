import React, { useState, useEffect, useMemo, useRef } from 'react';
import { t } from '../i18n/translations';
import { InventoryItem } from '../types/inventory';
import { calculateItem, formatRupiah, formatAngka } from '../utils/calculator';
import { Plus, Calendar, Package, Calculator, ChevronDown, X, Search, Check, PackagePlus, RefreshCw } from 'lucide-react';

interface QuickAddBarProps {
  onAdd: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  existingItems?: InventoryItem[];
  globalSavePercentMonthly?: number;
}
const inputClass = "w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-sm text-[#18345F] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
const labelClass = "mb-1.5 block text-xs font-semibold text-[#385477]";

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onAdd, existingItems = [], globalSavePercentMonthly = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<'new' | 'old'>('old');
  const panelRef = useRef<HTMLElement>(null);
  const productSearchRef = useRef<HTMLInputElement>(null);
  const [showProductList, setShowProductList] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  useEffect(() => {
    if (!isExpanded) return;
    const handleOutsideInteraction = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && panelRef.current && !panelRef.current.contains(target)) {
        setIsExpanded(false);
        setShowProductList(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideInteraction, true);
    return () => document.removeEventListener('pointerdown', handleOutsideInteraction, true);
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded && mode === 'old') {
      const frame = requestAnimationFrame(() => productSearchRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
  }, [isExpanded, mode]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const [tanggalInput, setTanggalInput] = useState(todayStr);
  const [namaBarang, setNamaBarang] = useState('');
  const [satuanWadah, setSatuanWadah] = useState('Dus');
  const [isiPerKemasan, setIsiPerKemasan] = useState<number | ''>('');
  const [jumlahKemasan, setJumlahKemasan] = useState<number | ''>(1);
  const [satuanUnit, setSatuanUnit] = useState('pcs');
  const [hargaBeliPerKemasan, setHargaBeliPerKemasan] = useState<number | ''>('');
  const [hargaJual, setHargaJual] = useState<number | ''>('');
  const [catatan, setCatatan] = useState('');

  const uniqueProducts = useMemo(() => {
    const ordered = [...existingItems].sort((a, b) => (Number(b.updatedAt || b.createdAt) || 0) - (Number(a.updatedAt || a.createdAt) || 0));
    const seen = new Set<string>();
    return ordered.filter((item) => {
      const key = item.namaBarang.trim().toLocaleLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [existingItems]);
  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLocaleLowerCase();
    return uniqueProducts.filter((item) => !query || item.namaBarang.toLocaleLowerCase().includes(query)).slice(0, 30);
  }, [uniqueProducts, productSearch]);

  const selectProduct = (item: InventoryItem) => {
    const packCount = Math.max(1, Number(item.jumlahKemasanDibeli) || 1);
    const packSize = Math.max(1, Number(item.isiPerKemasan) || (Number(item.jumlahBarangWadah) / packCount) || 1);
    const packPrice = Number(item.hargaBeliPerKemasan) || (Number(item.hargaBeli) / packCount) || 0;
    setSelectedProduct(item);
    setNamaBarang(item.namaBarang);
    setProductSearch(item.namaBarang);
    setSatuanWadah(item.satuanWadah || 'Dus');
    setIsiPerKemasan(packSize);
    setSatuanUnit(item.satuanUnit || 'pcs');
    setHargaBeliPerKemasan(Math.round(packPrice));
    setHargaJual(Number(item.hargaJualSatuan) || '');
    setJumlahKemasan(1);
    setCatatan('');
    setShowProductList(false);
  };

  const packQty = Math.max(0, Number(jumlahKemasan) || 0);
  const packSize = Math.max(0, Number(isiPerKemasan) || 0);
  const totalQty = packQty * packSize;
  const packPrice = Math.max(0, Number(hargaBeliPerKemasan) || 0);
  const totalBuy = packQty * packPrice;
  const sell = Math.max(0, Number(hargaJual) || 0);
  const preview = totalQty > 0 && totalBuy > 0 && sell > 0 ? calculateItem({
    id: 'tmp', namaBarang: namaBarang || 'Barang', satuanWadah: satuanWadah || 'Wadah',
    jumlahBarangWadah: totalQty, satuanUnit: satuanUnit || 'pcs', hargaBeli: totalBuy,
    jumlahBarangDijualSatuan: 0, hargaJualSatuan: sell, perputaranBulan: 1,
    persentaseLabaDisimpanBulanan: globalSavePercentMonthly, tanggalInput,
    createdAt: 0, updatedAt: 0,
  }) : null;

  const resetForm = () => {
    setNamaBarang(''); setProductSearch(''); setSelectedProduct(null);
    setIsiPerKemasan(''); setJumlahKemasan(1); setHargaBeliPerKemasan('');
    setHargaJual(''); setCatatan(''); setMode('old'); setShowProductList(false);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBarang.trim() || totalQty <= 0 || totalBuy <= 0 || sell <= 0) return;
    if (mode === 'old' && !selectedProduct) return;
    onAdd({
      namaBarang: namaBarang.trim(), satuanWadah: satuanWadah || 'Wadah',
      jumlahBarangWadah: totalQty, satuanUnit: satuanUnit || 'pcs', hargaBeli: totalBuy,
      jumlahBarangDijualSatuan: 0, hargaJualSatuan: sell, perputaranBulan: 1,
      persentaseLabaDisimpanBulanan: globalSavePercentMonthly, tanggalInput,
      catatan: catatan.trim(),
      isiPerKemasan: packSize,
      jumlahKemasanDibeli: packQty,
      hargaBeliPerKemasan: packPrice,
      jenisPencatatan: mode === 'old' ? 'pembelian_ulang' : 'baru',
    });
    resetForm();
    setIsExpanded(false);
  };
  const duplicateName = mode === 'new' && namaBarang.trim() && uniqueProducts.some((item) => item.namaBarang.trim().toLocaleLowerCase() === namaBarang.trim().toLocaleLowerCase());

  return (
    <section ref={panelRef} className="cirrel-quick-add wp-quick-add-panel mb-0 rounded-2xl border border-blue-100 bg-white/95 p-4 shadow-[0_12px_32px_rgba(37,99,235,0.08)] backdrop-blur-xl sm:p-5">
      <button type="button" onClick={() => { if (isExpanded) { setIsExpanded(false); setShowProductList(false); } else { resetForm(); setMode('old'); setIsExpanded(true); } }} aria-expanded={isExpanded} className="flex w-full items-center justify-between gap-3 text-left">
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
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-blue-50 p-1">
          <button type="button" onClick={() => { resetForm(); setMode('old'); }} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === 'old' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}><RefreshCw className="h-4 w-4"/>Barang Lama</button>
          <button type="button" onClick={() => { resetForm(); setMode('new'); }} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === 'new' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}><PackagePlus className="h-4 w-4"/>Barang Baru</button>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#42618B]">Informasi barang</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div><label className={labelClass}>{t('quick.inputDate')}</label><div className="relative"><Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" /><input type="date" required value={tanggalInput} onChange={e=>setTanggalInput(e.target.value)} className={inputClass+" pl-9"} /></div></div>
            <div className="sm:col-span-2 relative">
              <label className={labelClass}>{t('quick.itemName')}</label>
              {mode === 'old' ? <>
                <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500"/><input ref={productSearchRef} type="text" required value={productSearch} onFocus={() => setShowProductList(Boolean(productSearch.trim()))} onChange={e=>{const value=e.target.value;setProductSearch(value);setSelectedProduct(null);setNamaBarang('');setShowProductList(Boolean(value.trim()));}} placeholder="Ketik nama barang, misalnya: s..." className={inputClass+" pl-9 pr-9"} /><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/></div>
                {showProductList && productSearch.trim() && filteredProducts.length>0 && <div className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-blue-100 bg-white shadow-xl">
                  {filteredProducts.map(item=><button key={item.id} type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>selectProduct(item)} className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 text-left last:border-0 hover:bg-blue-50"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-[#18345F]">{item.namaBarang}</span><span className="block text-xs text-slate-500">{item.isiPerKemasan ?? item.jumlahBarangWadah} {item.satuanUnit}/kemasan</span></span><Check className="h-4 w-4 shrink-0 text-emerald-600"/></button>)}
                </div>}
                {showProductList && productSearch.trim() && filteredProducts.length===0 && <p className="mt-1 text-xs text-slate-500">Nama barang belum ditemukan. Periksa ejaan atau pilih Barang Baru.</p>}
                {selectedProduct && <p className="mt-1 flex items-center gap-1 text-xs text-emerald-700"><Check className="h-3 w-3"/>Data barang dipilih. Isi kemasan dan harga jual terisi otomatis.</p>}
              </> : <input type="text" required value={namaBarang} onChange={e=>setNamaBarang(e.target.value)} placeholder={t('quick.itemPlaceholder')} className={inputClass} />}
              {duplicateName && <p className="mt-1 text-xs text-amber-700">Nama ini sudah ada. Pilih Barang Lama untuk menambah stoknya.</p>}
            </div>
            <div><label className={labelClass}>Satuan kemasan</label><input type="text" value={satuanWadah} onChange={e=>setSatuanWadah(e.target.value)} placeholder="Dus / Karton / Pak" className={inputClass} /></div>
            <div><label className={labelClass}>Isi per kemasan</label><input type="number" min="1" required value={isiPerKemasan} onChange={e=>setIsiPerKemasan(e.target.value===''?'':Number(e.target.value))} placeholder="Contoh: 24" className={inputClass} /></div>
            <div><label className={labelClass}>Jumlah kemasan dibeli</label><input type="number" min="1" required value={jumlahKemasan} onChange={e=>setJumlahKemasan(e.target.value===''?'':Number(e.target.value))} placeholder="Contoh: 2" className={inputClass} /></div>
            <div><label className={labelClass}>Satuan barang</label><input type="text" value={satuanUnit} onChange={e=>setSatuanUnit(e.target.value)} placeholder="Pcs / Botol / Kg" className={inputClass} /></div>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#42618B]">Informasi harga</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div><label className={labelClass}>Harga beli per kemasan</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span><input type="number" min="1" required value={hargaBeliPerKemasan} onChange={e=>setHargaBeliPerKemasan(e.target.value===''?'':Number(e.target.value))} placeholder="0" className={inputClass+" pl-9"} /></div></div>
            <div><label className={labelClass}>Harga jual per satuan</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span><input type="number" min="1" required value={hargaJual} onChange={e=>setHargaJual(e.target.value===''?'':Number(e.target.value))} placeholder="0" className={inputClass+" pl-9"} /></div></div>
            <div className="sm:col-span-2"><label className={labelClass}>Catatan barang (opsional)</label><input type="text" value={catatan} onChange={e=>setCatatan(e.target.value)} placeholder="Contoh: Kulakan agen, rak depan..." className={inputClass} /></div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-blue-50 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {preview ? <>
              <div className="rounded-xl bg-blue-50 px-3 py-2"><span className="block text-[10px] text-slate-500">Total isi masuk</span><strong className="text-sm text-[#18345F]">{formatAngka(totalQty,0)} {satuanUnit}</strong></div>
              <div className="rounded-xl bg-blue-50 px-3 py-2"><span className="block text-[10px] text-slate-500">Total modal</span><strong className="text-sm text-[#18345F]">{formatRupiah(totalBuy)}</strong></div>
              <div className="rounded-xl bg-blue-50 px-3 py-2"><span className="block text-[10px] text-slate-500">Modal per satuan</span><strong className="text-sm text-[#18345F]">{formatRupiah(preview.hppSatuan)}</strong></div>
              <div className="rounded-xl bg-emerald-50 px-3 py-2"><span className="block text-[10px] text-slate-500">Untung per satuan</span><strong className="text-sm text-emerald-700">+{formatRupiah(preview.gainSatuan)}</strong></div>
              <div className="rounded-xl bg-indigo-50 px-3 py-2"><span className="block text-[10px] text-slate-500">Potensi keuntungan total</span><strong className="text-sm text-indigo-700">+{formatRupiah(preview.potensiTotalGain)}</strong><span className="ml-1 text-[10px] text-slate-500">({formatAngka(preview.marginPersen,1)}%)</span></div>
            </> : <span className="flex items-center gap-2 text-xs text-slate-500"><Calculator className="h-4 w-4 text-blue-500" />Isi jumlah dan harga untuk melihat perhitungan otomatis.</span>}
          </div>
          <button type="submit" disabled={mode==='old'&&!selectedProduct} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-4 w-4" />{mode==='old'?'Simpan Pembelian':'Tambah Barang'}</button>
        </div>
      </form>}
    </section>
  );
};
