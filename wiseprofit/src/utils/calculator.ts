import { InventoryItem, ItemCalculations, GlobalSummary, Withdrawal } from '../types/inventory';

export function calculateItem(item: InventoryItem): ItemCalculations {
  const jumlahWadah = Math.max(1, Number(item.jumlahBarangWadah) || 1);
  const hargaBeli = Math.max(0, Number(item.hargaBeli) || 0);
  const hargaJualSatuan = Math.max(0, Number(item.hargaJualSatuan) || 0);
  const jumlahJualSatuan = Math.max(0, Number(item.jumlahBarangDijualSatuan) || 0);
  const persenSimpanBulanan = Math.min(100, Math.max(0, Number(item.persentaseLabaDisimpanBulanan) ?? 50));

  // 1. HPP Satuan (Harga Beli per 1 satuan/pcs)
  const hppSatuan = hargaBeli / jumlahWadah;

  // 2. Gain per Satuan (Keuntungan per 1 satuan)
  const gainSatuan = hargaJualSatuan - hppSatuan;

  // 3. Omzet & Modal Kembali DARI UNIT YANG SUDAH TERJUAL SAJA
  // JIKA BELUM TERJUAL (jumlahJualSatuan === 0), SEMUANYA 0!
  const totalPendapatanTerjual = hargaJualSatuan * jumlahJualSatuan;
  const totalModalKembali = hppSatuan * jumlahJualSatuan;
  const totalGainTerjual = gainSatuan * jumlahJualSatuan;

  // 4. Margin & Markup
  const marginPersen = hargaJualSatuan > 0 ? (gainSatuan / hargaJualSatuan) * 100 : 0;
  const markupPersen = hppSatuan > 0 ? (gainSatuan / hppSatuan) * 100 : 0;

  // 5. Sisa Stok dan Nilai Sisa Modal (Aset tertahan di rak)
  const sisaStokSatuan = Math.max(0, jumlahWadah - jumlahJualSatuan);
  const nilaiSisaStok = sisaStokSatuan * hppSatuan;

  // 6. BEP (Break-even point) & Status Modal
  const bepSatuan = hargaJualSatuan > 0 ? Math.ceil(hargaBeli / hargaJualSatuan) : 0;
  const isModalLunas = totalPendapatanTerjual >= hargaBeli;

  // 7. TOTAL SETELAH UNTUNG DARI UNIT YANG SUDAH TERJUAL
  const totalSetelahUntungTerjual = totalPendapatanTerjual;
  const potensiTotalGain = Math.max(0, (hargaJualSatuan * jumlahWadah) - hargaBeli);
  const totalSetelahUntungPenuh = hargaBeli + potensiTotalGain;

  // 8. SIMPANAN SETELAH UNTUNG 1 BULAN
  const estimasiUntung1Bulan = totalGainTerjual;
  // Simpanan tidak boleh negatif saat barang dijual rugi.
  const simpananSetelahUntung1Bulan = Math.max(0, estimasiUntung1Bulan) * (persenSimpanBulanan / 100);

  // Uang hasil penjualan setelah dikurangi simpanan laba yang positif.
  const modalDiputarBulanDepan = Math.max(0, totalPendapatanTerjual - simpananSetelahUntung1Bulan);

  return {
    hppSatuan,
    gainSatuan,
    totalPendapatanTerjual,
    totalModalKembali,
    totalGainTerjual,
    marginPersen,
    markupPersen,
    sisaStokSatuan,
    nilaiSisaStok,
    bepSatuan,
    isModalLunas,
    totalSetelahUntungTerjual,
    totalSetelahUntungPenuh,
    potensiTotalGain,
    estimasiUntung1Bulan,
    simpananSetelahUntung1Bulan,
    modalDiputarBulanDepan,
  };
}

export function calculateSummary(
  items: InventoryItem[], 
  modalAwal: number = 50000,
  withdrawals: Withdrawal[] = []
): GlobalSummary {
  const modalAwalUsaha = Math.max(0, Number(modalAwal) || 0);

  let totalPengeluaranBeli = 0;
  let totalPemasukanJual = 0;
  let totalModalKembali = 0;
  let totalGainTerjual = 0;
  let totalNilaiSisaStok = 0;
  let totalSetelahUntungPenuh = 0;
  let totalUntung1Bulan = 0;
  let totalSimpananSetelah1Bulan = 0;
  let totalMarginAccum = 0;

  for (const item of items) {
    const calc = calculateItem(item);
    totalPengeluaranBeli += Number(item.hargaBeli) || 0;
    totalPemasukanJual += calc.totalPendapatanTerjual;
    totalModalKembali += calc.totalModalKembali;
    totalGainTerjual += calc.totalGainTerjual;
    totalNilaiSisaStok += calc.nilaiSisaStok;

    totalSetelahUntungPenuh += calc.totalSetelahUntungPenuh;
    totalUntung1Bulan += calc.estimasiUntung1Bulan;
    totalSimpananSetelah1Bulan += calc.simpananSetelahUntung1Bulan;

    totalMarginAccum += calc.marginPersen;
  }

  // Akumulasi penarikan kas
  const totalPenarikanKas = (withdrawals || []).reduce((acc, w) => acc + (Math.max(0, Number(w.nominal)) || 0), 0);

  const sisaModalSebelumJual = modalAwalUsaha - totalPengeluaranBeli;
  // Sisa kas saat ini = Modal Awal - Belanja Barang + Penjualan Barang - Penarikan Kas Toko
  const saldoKasSaatIni = modalAwalUsaha - totalPengeluaranBeli + totalPemasukanJual - totalPenarikanKas;
  // Ekuitas usaha = kas tersisa + nilai modal stok yang masih dimiliki.
  // Penarikan pemilik mengurangi ekuitas usaha, karena kas keluar dari usaha.
  const totalSetelahUntung = saldoKasSaatIni + totalNilaiSisaStok;

  // Persentase Tumbuh / Rugi
  const persenTumbuhRugi = modalAwalUsaha > 0 ? (totalGainTerjual / modalAwalUsaha) * 100 : 0;
  const statusTumbuhRugi = totalGainTerjual > 0 ? 'tumbuh' : (saldoKasSaatIni < 0 ? 'rugi' : 'impas');

  const totalKasDiputarBulanDepan = Math.max(0, saldoKasSaatIni - totalSimpananSetelah1Bulan);
  const rataRataMargin = items.length > 0 ? totalMarginAccum / items.length : 0;

  return {
    modalAwalUsaha,
    totalItems: items.length,
    totalPengeluaranBeli,
    sisaModalSebelumJual,
    totalPemasukanJual,
    totalModalKembali,
    totalGainTerjual,
    totalNilaiSisaStok,
    totalPenarikanKas,
    saldoKasSaatIni,
    totalPenarikan: totalPenarikanKas,
    totalSetelahUntung,
    totalSetelahUntungPenuh,
    persenTumbuhRugi,
    statusTumbuhRugi,
    totalUntung1Bulan,
    totalSimpananSetelah1Bulan,
    totalKasDiputarBulanDepan,
    rataRataMargin,
  };
}

export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatAngka(num: number, decimals: number = 0): string {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Format tanggal lengkap Indonesia
export function formatTanggal(timestamp: number | string): string {
  if (!timestamp) return '-';
  const d = typeof timestamp === 'string' && timestamp.length === 10 ? new Date(timestamp + 'T00:00:00') : new Date(timestamp);
  if (isNaN(d.getTime())) return String(timestamp);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
}

// Format tanggal singkat (DD/MM/YYYY)
export function formatTanggalSederhana(timestamp: number | string): string {
  if (!timestamp) return '-';
  const d = typeof timestamp === 'string' && timestamp.length === 10 ? new Date(timestamp + 'T00:00:00') : new Date(timestamp);
  if (isNaN(d.getTime())) return String(timestamp);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

// Format jam real-time (HH:MM:SS)
export function formatJam(timestamp: number | string): string {
  if (!timestamp) return '-';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return String(timestamp);
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
}
