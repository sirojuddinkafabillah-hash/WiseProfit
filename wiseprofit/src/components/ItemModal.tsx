import React, { useEffect, useMemo, useState } from 'react';
import { t } from '../i18n/translations';
import { InventoryItem } from '../types/inventory';
import { calculateItem, formatRupiah } from '../utils/calculator';
import { X, Calculator, Calendar, PackagePlus, Package, Search, Check } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  editingItem?: InventoryItem | null;
  existingItems?: InventoryItem[];
}

const COMMON_CONTAINERS = ['Dus', 'Karton', 'Slop', 'Bal', 'Peti', 'Pak', 'Karung', 'Krat', 'Boks', 'Botol'];
const COMMON_UNITS = ['Pcs', 'Bungkus', 'Botol', 'Sachet', 'Kg', 'Kaleng', 'Butir', 'Pack', 'Liter', 'Gram', 'Cup', 'Batang'];
const inputClass = 'w-full px-3 py-2.5 text-sm bg-white border border-blue-100 rounded-xl focus:outline-none focus:border-emerald-500 text-[#18345F] placeholder:text-slate-400';
const labelClass = 'block text-xs font-semibold text-[#385477] mb-1.5';

export const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, onSave, editingItem, existingItems = [] }) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [mode, setMode] = useState<'new' | 'old'>('new');
  const [tanggalInput, setTanggalInput] = useState(todayStr);
  const [namaBarang, setNamaBarang] = useState('');
  const [searchName, setSearchName] = useState('');
  const [selectedExisting, setSelectedExisting] = useState<InventoryItem | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [satuanWadah, setSatuanWadah] = useState('Dus');
  const [isiPerKemasan, setIsiPerKemasan] = useState<number>(24);
  const [jumlahKemasan, setJumlahKemasan] = useState<number>(1);
  const [satuanUnit, setSatuanUnit] = useState('Pcs');
  const [hargaBeliPerKemasan, setHargaBeliPerKemasan] = useState<number>(120000);
  const [jumlahBarangDijualSatuan, setJumlahBarangDijualSatuan] = useState<number>(0);
  const [hargaJualSatuan, setHargaJualSatuan] = useState<number>(6500);
  const [perputaranBulan, setPerputaranBulan] = useState<number>(1);
  const [persentaseLabaDisimpanBulanan, setPersentaseLabaDisimpanBulanan] = useState<number>(50);
  const [catatan, setCatatan] = useState('');

  const uniqueProducts = useMemo(() => {
    const sorted = [...existingItems].sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
    const seen = new Set<string>();
    return sorted.filter((item) => {
      const key = item.namaBarang.trim().toLocaleLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [existingItems]);

  const suggestions = useMemo(() => {
    const q = searchName.trim().toLocaleLowerCase();
    return uniqueProducts.filter((item) => !q || item.namaBarang.toLocaleLowerCase().includes(q)).slice(0, 8);
  }, [uniqueProducts, searchName]);

  useEffect(() => {
    if (!isOpen) return;
    if (editingItem) {
      setMode('new');
      setTanggalInput(editingItem.tanggalInput || todayStr);
      setNamaBarang(editingItem.namaBarang);
      setSearchName(editingItem.namaBarang);
      setSelectedExisting(null);
      setSatuanWadah(editingItem.satuanWadah);
      setIsiPerKemasan(editingItem.jumlahBarangWadah);
      setJumlahKemasan(1);
      setSatuanUnit(editingItem.satuanUnit);
      setHargaBeliPerKemasan(editingItem.hargaBeli);
      setJumlahBarangDijualSatuan(editingItem.jumlahBarangDijualSatuan);
      setHargaJualSatuan(editingItem.hargaJualSatuan);
      setPerputaranBulan(editingItem.perputaranBulan ?? 1);
      setPersentaseLabaDisimpanBulanan(editingItem.persentaseLabaDisimpanBulanan ?? 50);
      setCatatan(editingItem.catatan || '');
    } else {
      setMode('new');
      setTanggalInput(todayStr);
      setNamaBarang('');
      setSearchName('');
      setSelectedExisting(null);
      setSatuanWadah('Dus');
      setIsiPerKemasan(24);
      setJumlahKemasan(1);
      setSatuanUnit('Pcs');
      setHargaBeliPerKemasan(120000);
      setJumlahBarangDijualSatuan(0);
      setHargaJualSatuan(6500);
      setPerputaranBulan(1);
      setPersentaseLabaDisimpanBulanan(50);
      setCatatan('');
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!editingItem;
  const totalIsi = isEditing ? Math.max(1, Number(isiPerKemasan) || 1) : Math.max(1, Number(isiPerKemasan) || 1) * Math.max(1, Number(jumlahKemasan) || 1);
  const totalModal = isEditing ? Math.max(0, Number(hargaBeliPerKemasan) || 0) : Math.max(0, Number(hargaBeliPerKemasan) || 0) * Math.max(1, Number(jumlahKemasan) || 1);
  const previewItem: InventoryItem = {
    id: 'preview',
    namaBarang: namaBarang || 'Nama barang',
    satuanWadah,
    jumlahBarangWadah: totalIsi,
    satuanUnit,
    hargaBeli: totalModal,
    jumlahBarangDijualSatuan: isEditing ? Number(jumlahBarangDijualSatuan) || 0 : 0,
    hargaJualSatuan: Number(hargaJualSatuan) || 0,
    perputaranBulan,
    persentaseLabaDisimpanBulanan,
    createdAt: 0,
    updatedAt: 0,
  };
  const previewCalc = calculateItem(previewItem);

  const selectExisting = (item: InventoryItem) => {
    setSelectedExisting(item);
    setNamaBarang(item.namaBarang);
    setSearchName(item.namaBarang);
    setSatuanWadah(item.satuanWadah || 'Dus');
    setIsiPerKemasan(Math.max(1, Number(item.isiPerKemasan) || (Number(item.jumlahBarangWadah) / Math.max(1, Number(item.jumlahKemasanDibeli) || 1)) || 1));
    setSatuanUnit(item.satuanUnit || 'Pcs');
    setHargaBeliPerKemasan(Math.max(0, Number(item.hargaBeliPerKemasan ?? item.hargaBeli) || 0));
    setHargaJualSatuan(Number(item.hargaJualSatuan) || 0);
    setJumlahBarangDijualSatuan(0);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBarang.trim()) return;
    if (mode === 'old' && !selectedExisting) return;

    onSave({
      namaBarang: namaBarang.trim(),
      satuanWadah,
      jumlahBarangWadah: totalIsi,
      satuanUnit,
      hargaBeli: totalModal,
      jumlahBarangDijualSatuan: isEditing ? Number(jumlahBarangDijualSatuan) || 0 : 0,
      hargaJualSatuan: Number(hargaJualSatuan) || 0,
      perputaranBulan: Number(perputaranBulan) || 1,
      persentaseLabaDisimpanBulanan: Number(persentaseLabaDisimpanBulanan) ?? 50,
      tanggalInput: tanggalInput || todayStr,
      catatan: catatan.trim(),
      ...(isEditing ? {
        isiPerKemasan: editingItem?.isiPerKemasan,
        jumlahKemasanDibeli: editingItem?.jumlahKemasanDibeli,
        hargaBeliPerKemasan: editingItem?.hargaBeliPerKemasan,
        jenisPencatatan: editingItem?.jenisPencatatan,
      } : {
        isiPerKemasan: Number(isiPerKemasan) || 1,
        jumlahKemasanDibeli: Number(jumlahKemasan) || 1,
        hargaBeliPerKemasan: Number(hargaBeliPerKemasan) || 0,
        jenisPencatatan: mode === 'old' ? 'pembelian_ulang' : 'baru',
      }),
    }, editingItem ? editingItem.id : undefined);
    onClose();
  };

  const duplicateName = mode === 'new' && namaBarang.trim() && uniqueProducts.some((item) => item.namaBarang.trim().toLocaleLowerCase() === namaBarang.trim().toLocaleLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="wp-item-modal-card bg-white border border-blue-100 text-[#18345F] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between bg-blue-50/80">
          <div>
            <h3 className="text-base font-bold text-[#18345F] tracking-tight">{isEditing ? t('modal.editTitle') : t('modal.addTitle')}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{isEditing ? t('modal.subtitle') : 'Pilih barang baru atau lakukan pembelian ulang.'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer" aria-label="Tutup"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {!isEditing && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-blue-50 rounded-xl">
              <button type="button" onClick={() => { setMode('new'); setSelectedExisting(null); setNamaBarang(''); setSearchName(''); setJumlahKemasan(1); }} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${mode === 'new' ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-500 hover:text-[#18345F]'}`}>
                <PackagePlus className="w-4 h-4" /> Barang Baru
              </button>
              <button type="button" onClick={() => { setMode('old'); setSelectedExisting(null); setNamaBarang(''); setSearchName(''); setJumlahKemasan(1); }} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${mode === 'old' ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-500 hover:text-[#18345F]'}`}>
                <Package className="w-4 h-4" /> Barang Lama
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}><Calendar className="w-3.5 h-3.5 inline mr-1" />{t('modal.purchaseDate')}</label>
              <input type="date" required value={tanggalInput} onChange={(e) => setTanggalInput(e.target.value)} className={inputClass} />
            </div>
            <div className="relative">
              <label className={labelClass}>{t('modal.itemName')} <span className="text-rose-500">*</span></label>
              {mode === 'old' && !isEditing ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" required value={searchName} onFocus={() => setShowSuggestions(true)} onChange={(e) => { setSearchName(e.target.value); setSelectedExisting(null); setNamaBarang(e.target.value); setShowSuggestions(true); }} placeholder="Cari barang yang sudah terdaftar..." className={`${inputClass} pl-9`} autoComplete="off" />
                  </div>
                  {showSuggestions && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-xl border border-blue-100 bg-white shadow-xl">
                      {suggestions.map((item) => (
                        <button key={item.id} type="button" onClick={() => selectExisting(item)} className="w-full px-3 py-2.5 text-left hover:bg-blue-50 flex items-center justify-between gap-2 border-b border-slate-100 last:border-0">
                          <span className="text-sm font-semibold text-[#18345F]">{item.namaBarang}</span>
                          <span className="text-xs text-slate-500">{item.isiPerKemasan ?? item.jumlahBarangWadah} {item.satuanUnit}/kemasan</span>
                        </button>
                      ))}
                      {suggestions.length === 0 && <p className="px-3 py-3 text-xs text-slate-500">Barang belum ditemukan. Tambahkan melalui pilihan Barang Baru.</p>}
                    </div>
                  )}
                  {selectedExisting && <p className="mt-1 text-xs text-emerald-700 flex items-center gap-1"><Check className="w-3 h-3" /> Data barang berhasil dipilih dari katalog.</p>}
                </>
              ) : (
                <input type="text" required value={namaBarang} onChange={(e) => setNamaBarang(e.target.value)} placeholder={t('modal.itemPlaceholder')} className={inputClass} />
              )}
              {duplicateName && <p className="mt-1 text-xs text-amber-700">Nama ini sudah terdaftar. Gunakan pilihan Barang Lama untuk menambah stoknya.</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{isEditing ? t('modal.containerQuantity') : 'Isi per kemasan'}</label>
              <div className="flex gap-2">
                <input type="number" min="1" required value={isiPerKemasan || ''} onChange={(e) => setIsiPerKemasan(Math.max(1, Number(e.target.value) || 1))} className={inputClass} />
                <select value={COMMON_CONTAINERS.includes(satuanWadah) ? satuanWadah : 'Lainnya'} onChange={(e) => setSatuanWadah(e.target.value === 'Lainnya' ? '' : e.target.value)} className="px-2.5 py-2 text-xs bg-blue-50 border border-blue-100 rounded-xl text-[#18345F]">
                  {COMMON_CONTAINERS.map((c) => <option key={c} value={c}>{c}</option>)}
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              {!COMMON_CONTAINERS.includes(satuanWadah) && <input type="text" value={satuanWadah} onChange={(e) => setSatuanWadah(e.target.value)} placeholder="Tulis satuan kemasan..." className={inputClass + " mt-2"} />}
            </div>
            <div>
              <label className={labelClass}>{t('modal.retailUnit')}</label>
              <select value={COMMON_UNITS.includes(satuanUnit) ? satuanUnit : 'Lainnya'} onChange={(e) => setSatuanUnit(e.target.value === 'Lainnya' ? '' : e.target.value)} className={inputClass}>
                {COMMON_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                <option value="Lainnya">Lainnya</option>
              </select>
              {!COMMON_UNITS.includes(satuanUnit) && <input type="text" value={satuanUnit} onChange={(e) => setSatuanUnit(e.target.value)} placeholder="Tulis satuan barang..." className={inputClass + " mt-2"} />}
            </div>
          </div>

          {!isEditing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Jumlah kemasan dibeli</label>
                <input type="number" min="1" required value={jumlahKemasan || ''} onChange={(e) => setJumlahKemasan(Math.max(1, Number(e.target.value) || 1))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Harga beli per kemasan (Rp)</label>
                <input type="number" min="0" step="100" required value={hargaBeliPerKemasan || ''} onChange={(e) => setHargaBeliPerKemasan(Math.max(0, Number(e.target.value) || 0))} className={inputClass} />
              </div>
            </div>
          )}
          {isEditing && (
            <div>
              <label className={labelClass}>{t('modal.buyPrice')} (total modal)</label>
              <input type="number" min="0" step="100" required value={hargaBeliPerKemasan || ''} onChange={(e) => setHargaBeliPerKemasan(Math.max(0, Number(e.target.value) || 0))} className={inputClass} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isEditing && (
              <div>
                <label className={labelClass}>Jumlah barang sudah terjual ({satuanUnit})</label>
                <input type="number" min="0" max={isiPerKemasan} value={jumlahBarangDijualSatuan} onChange={(e) => setJumlahBarangDijualSatuan(Math.max(0, Number(e.target.value) || 0))} className={inputClass} />
              </div>
            )}
            <div>
              <label className={labelClass}>Harga jual per {satuanUnit} (Rp) <span className="text-rose-500">*</span></label>
              <input type="number" min="0" step="50" required value={hargaJualSatuan || ''} onChange={(e) => setHargaJualSatuan(Math.max(0, Number(e.target.value) || 0))} className={inputClass} />
              {!isEditing && mode === 'old' && <p className="mt-1 text-xs text-slate-500">Otomatis mengambil harga jual terakhir; kamu tetap bisa mengubahnya.</p>}
            </div>
          </div>

          <div>
            <label className={labelClass}>Catatan barang (opsional)</label>
            <input type="text" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Contoh: Kulakan agen, rak depan" className={inputClass} />
          </div>

          <div className="wp-item-preview bg-blue-50 rounded-xl border border-blue-100 p-4 text-sm space-y-3">
            <div className="flex items-center gap-2 font-bold text-[#18345F]"><Calculator className="w-4 h-4 text-emerald-600" /><span>Ringkasan pembelian</span></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white border border-blue-100 p-3 rounded-lg"><span className="text-slate-500 block text-[11px]">Total isi masuk</span><strong className="text-[#18345F]">{totalIsi} {satuanUnit}</strong></div>
              <div className="bg-white border border-blue-100 p-3 rounded-lg"><span className="text-slate-500 block text-[11px]">Total modal</span><strong className="text-[#18345F]">{formatRupiah(totalModal)}</strong></div>
              <div className="bg-white border border-blue-100 p-3 rounded-lg"><span className="text-slate-500 block text-[11px]">Modal per {satuanUnit}</span><strong className="text-[#18345F]">{formatRupiah(previewCalc.hppSatuan)}</strong></div>
              <div className="bg-white border border-blue-100 p-3 rounded-lg"><span className="text-slate-500 block text-[11px]">Potensi untung per {satuanUnit}</span><strong className="text-emerald-700">+{formatRupiah(previewCalc.gainSatuan)}</strong></div>
            </div>
            {!isEditing && <p className="text-xs text-slate-600"><strong className="text-emerald-700">Total isi otomatis:</strong> {isiPerKemasan} {satuanUnit} × {jumlahKemasan} kemasan = <strong className="text-emerald-700">{totalIsi} {satuanUnit}</strong>. Total modal: {formatRupiah(hargaBeliPerKemasan)} × {jumlahKemasan} = {formatRupiah(totalModal)}.</p>}
          </div>

          <div className="pt-3 border-t border-blue-100 flex justify-end gap-2.5">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-[#18345F] hover:bg-blue-50 rounded-xl">Batal</button>
            <button type="submit" disabled={mode === 'old' && !isEditing && !selectedExisting} className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md">Simpan {mode === 'old' && !isEditing ? 'Pembelian' : 'Barang'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
