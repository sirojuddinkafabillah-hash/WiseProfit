import { describe, expect, it } from 'vitest';
import { calculateItem, calculateSummary, formatRupiah } from './calculator';
import type { InventoryItem, Withdrawal } from '../types/inventory';

const item = (overrides: Partial<InventoryItem> = {}): InventoryItem => ({
  id: 'item-1', noUrut: 1, namaBarang: 'Air mineral', satuanWadah: 'Dus',
  jumlahBarangWadah: 10, satuanUnit: 'botol', hargaBeli: 10000,
  jumlahBarangDijualSatuan: 3, hargaJualSatuan: 1500,
  persentaseLabaDisimpanBulanan: 50, tanggalInput: '2026-11-13',
  createdAt: 1, updatedAt: 1, ...overrides,
});

describe('calculateItem', () => {
  it('calculates HPP, revenue, returned capital, gain and remaining stock', () => {
    const result = calculateItem(item());
    expect(result.hppSatuan).toBe(1000);
    expect(result.totalPendapatanTerjual).toBe(4500);
    expect(result.totalModalKembali).toBe(3000);
    expect(result.totalGainTerjual).toBe(1500);
    expect(result.sisaStokSatuan).toBe(7);
    expect(result.nilaiSisaStok).toBe(7000);
  });

  it('does not report revenue or profit when nothing is sold', () => {
    const result = calculateItem(item({ jumlahBarangDijualSatuan: 0 }));
    expect(result.totalPendapatanTerjual).toBe(0);
    expect(result.totalGainTerjual).toBe(0);
    expect(result.sisaStokSatuan).toBe(10);
  });

  it('supports loss-making sales without creating positive savings', () => {
    const result = calculateItem(item({ hargaJualSatuan: 800 }));
    expect(result.totalGainTerjual).toBe(-600);
    expect(result.simpananSetelahUntung1Bulan).toBe(0);
  });
});

describe('calculateSummary', () => {
  it('subtracts purchases and withdrawals from cash and adds remaining stock to equity', () => {
    const withdrawals: Withdrawal[] = [{ id: 'w-1', userId: 'u-1', nominal: 1000, tanggal: '2026-11-13', createdAt: 2 }];
    const result = calculateSummary([item()], 50000, withdrawals);
    expect(result.totalPengeluaranBeli).toBe(10000);
    expect(result.totalPemasukanJual).toBe(4500);
    expect(result.totalPenarikanKas).toBe(1000);
    expect(result.saldoKasSaatIni).toBe(43500);
    expect(result.totalNilaiSisaStok).toBe(7000);
    expect(result.totalSetelahUntung).toBe(50500);
  });

  it('does not allow negative withdrawal values to increase cash', () => {
    const withdrawals: Withdrawal[] = [{ id: 'w-2', userId: 'u-1', nominal: -5000, tanggal: '2026-11-13', createdAt: 3 }];
    const result = calculateSummary([], 50000, withdrawals);
    expect(result.saldoKasSaatIni).toBe(50000);
  });
});

describe('formatRupiah', () => {
  it('formats Indonesian rupiah without decimal fractions', () => {
    expect(formatRupiah(1500)).toContain('1.500');
    expect(formatRupiah(Number.NaN)).toContain('0');
  });
});
