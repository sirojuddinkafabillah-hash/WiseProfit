export interface InventoryItem {
  id: string; noUrut?: number; namaBarang: string; satuanWadah: string; jumlahBarangWadah: number; satuanUnit: string; hargaBeli: number; jumlahBarangDijualSatuan: number; hargaJualSatuan: number; perputaranBulan?: number; persentaseLabaDisimpanBulanan: number; tanggalInput?: string; waktuInput?: string; catatan?: string; createdAt: number; updatedAt: number;
}
export interface ItemCalculations {
  hppSatuan:number; gainSatuan:number; totalPendapatanTerjual:number; totalModalKembali:number; totalGainTerjual:number; marginPersen:number; markupPersen:number; sisaStokSatuan:number; nilaiSisaStok:number; bepSatuan:number; isModalLunas:boolean; totalSetelahUntungTerjual:number; totalSetelahUntungPenuh:number; potensiTotalGain:number; estimasiUntung1Bulan:number; simpananSetelahUntung1Bulan:number; modalDiputarBulanDepan:number;
}
export interface Withdrawal { id:string; userId:string; nominal:number; tanggal:string; catatan?:string; createdAt:number; updatedAt?:number; }
export interface GlobalSummary {
 modalAwalUsaha:number; totalItems:number; totalPengeluaranBeli:number; sisaModalSebelumJual:number; totalPemasukanJual:number; totalModalKembali:number; totalGainTerjual:number; totalNilaiSisaStok:number; totalPenarikanKas:number; saldoKasSaatIni:number; totalPenarikan:number; totalSetelahUntung:number; totalSetelahUntungPenuh:number; persenTumbuhRugi:number; statusTumbuhRugi:'tumbuh'|'rugi'|'impas'; totalUntung1Bulan:number; totalSimpananSetelah1Bulan:number; totalKasDiputarBulanDepan:number; rataRataMargin:number;
}