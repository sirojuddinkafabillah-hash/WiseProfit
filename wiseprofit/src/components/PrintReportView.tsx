import React from 'react';
import { InventoryItem, GlobalSummary } from '../types/inventory';
import { calculateItem, formatRupiah } from '../utils/calculator';
import { Printer, ArrowLeft } from 'lucide-react';
import type { Language } from '../i18n/translations';

interface PrintReportViewProps {
  items: InventoryItem[];
  summary: GlobalSummary;
  language: Language;
  modalAwal?: number;
  onBack?: () => void;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({ items, summary, language, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date());

  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-white min-h-screen p-6 sm:p-10 max-w-none text-neutral-900">
      <div className="no-print mb-8 pb-4 border-b border-neutral-200 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'id' ? 'Kembali ke WiseProfit' : 'Back to WiseProfit'}</span>
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{language === 'id' ? 'Cetak atau Simpan sebagai PDF' : 'Print or Save as PDF'}</span>
        </button>
      </div>

      <div className="border-b-2 border-neutral-900 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
        <div>
          <div className="text-[11px] font-mono font-bold tracking-widest text-emerald-800 uppercase mb-0.5">
            NIAGANOVA RETAIL MATRIX
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {language === 'id' ? 'LAPORAN PENJUALAN & EKUITAS ARUS KAS' : 'SALES & CASH FLOW EQUITY REPORT'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            {language === 'id' ? 'Format: Nama Barang · Isi Wadah · Harga Beli · Terjual · Harga Jual · Keuntungan · Ekuitas · Kas Masuk · Simpanan 1 Bulan' : 'Format: Item Name · Units per Container · Purchase Price · Units Sold · Selling Price · Realized Gain · Equity · Cash Inflow · 1-Month Savings'}
          </p>
        </div>
        <div className="text-left sm:text-right text-xs text-neutral-600 font-mono">
          <div>{language === 'id' ? 'Tanggal Laporan:' : 'Report Date:'}</div>
          <div className="font-semibold text-neutral-900">{todayStr}</div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 border border-neutral-300 rounded bg-neutral-50">
          <span className="text-neutral-500 block">{language === 'id' ? 'Modal Awal Usaha:' : 'Initial Business Capital:'}</span>
          <span className="font-bold text-base font-mono tabular-nums">{formatRupiah(summary.modalAwalUsaha)}</span>
        </div>
        <div className="p-3 border border-neutral-300 rounded bg-neutral-50">
          <span className="text-neutral-500 block">{language === 'id' ? 'Untung Terealisasi (Gain):' : 'Realized Profit (Gain):'}</span>
          <span className="font-bold text-base font-mono tabular-nums text-emerald-800">+{formatRupiah(summary.totalGainTerjual)}</span>
        </div>
        <div className="p-3 border border-neutral-900 rounded bg-emerald-50 text-emerald-950">
          <span className="text-emerald-800 block font-semibold text-[10px] uppercase">{language === 'id' ? 'SISA KAS TOKO:' : 'REMAINING CASH:'}</span>
          <span className="font-extrabold text-base font-mono tabular-nums text-emerald-900">{formatRupiah(summary.saldoKasSaatIni)}</span>
        </div>
        <div className="p-3 border border-neutral-300 rounded bg-neutral-50">
          <span className="text-neutral-500 block">{language === 'id' ? 'Total Setelah Untung:' : 'Total After Profit:'}</span>
          <span className="font-extrabold text-base font-mono tabular-nums text-neutral-900">{formatRupiah(summary.totalSetelahUntung)}</span>
        </div>
      </div>

      {/* Itemized Table */}
      <table className="w-full text-left border-collapse text-xs mb-8">
        <thead>
          <tr className="border-y border-neutral-900 bg-neutral-100 text-neutral-900 font-bold">
            <th className="py-2 px-2">{language === 'id' ? 'NAMA BARANG' : 'ITEM NAME'}</th>
            <th className="py-2 px-2 text-center">{language === 'id' ? 'ISI WADAH' : 'UNITS / CONTAINER'}</th>
            <th className="py-2 px-2 text-right">{language === 'id' ? 'HARGA BELI' : 'PURCHASE PRICE'}</th>
            <th className="py-2 px-2 text-center">{language === 'id' ? 'TERJUAL' : 'UNITS SOLD'}</th>
            <th className="py-2 px-2 text-right">{language === 'id' ? 'HARGA JUAL' : 'SELLING PRICE'}</th>
            <th className="py-2 px-2 text-right">{language === 'id' ? 'GAIN (UNTUNG)' : 'GAIN (PROFIT)'}</th>
            <th className="py-2 px-2 text-right">{language === 'id' ? 'EQUITY (MODAL)' : 'EQUITY (CAPITAL)'}</th>
            <th className="py-2 px-2 text-right bg-neutral-200">{language === 'id' ? 'TOTAL SETELAH UNTUNG' : 'TOTAL AFTER PROFIT'}</th>
            <th className="py-2 px-2 text-right bg-emerald-100">{language === 'id' ? 'SISA KAS' : 'CASH BALANCE'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-300">
          {(() => {
            let runningCash = summary.modalAwalUsaha;
            const sorted = [...items].sort((a, b) => {
              if (typeof a.noUrut === 'number' && typeof b.noUrut === 'number') {
                return a.noUrut - b.noUrut;
              }
              if (typeof a.noUrut === 'number') return -1;
              if (typeof b.noUrut === 'number') return 1;
              return a.createdAt - b.createdAt;
            });
            const cashMap = new Map<string, number>();
            for (const it of sorted) {
              runningCash = runningCash - (Number(it.hargaBeli) || 0) + ((Number(it.hargaJualSatuan) || 0) * (Number(it.jumlahBarangDijualSatuan) || 0));
              cashMap.set(it.id, runningCash);
            }

            return sorted.map((item, idx) => {
              const calc = calculateItem(item);
              const rowCash = cashMap.get(item.id) ?? summary.modalAwalUsaha;

              return (
                <tr key={item.id} className="text-neutral-800">
                  <td className="py-2 px-2 font-medium">
                    <div>{item.noUrut !== undefined ? item.noUrut : idx + 1}. {item.namaBarang}</div>
                  </td>
                  <td className="py-2 px-2 text-center font-mono tabular-nums">
                    {item.jumlahBarangWadah}
                  </td>
                  <td className="py-2 px-2 text-right font-mono tabular-nums">
                    {formatRupiah(item.hargaBeli)}
                  </td>
                  <td className="py-2 px-2 text-center font-mono tabular-nums font-semibold">
                    {item.jumlahBarangDijualSatuan}
                  </td>
                  <td className="py-2 px-2 text-right font-mono tabular-nums">
                    {formatRupiah(item.hargaJualSatuan)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono tabular-nums font-semibold text-emerald-800">
                    {calc.totalGainTerjual > 0 ? `+${formatRupiah(calc.totalGainTerjual)}` : 'Rp 0'}
                  </td>
                  <td className="py-2 px-2 text-right font-mono tabular-nums">
                    {formatRupiah(item.jumlahBarangDijualSatuan === 0 ? item.hargaBeli : calc.nilaiSisaStok)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono tabular-nums font-bold bg-neutral-50">
                    {formatRupiah(calc.totalSetelahUntungTerjual)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono tabular-nums font-bold bg-emerald-50 text-emerald-900">
                    {formatRupiah(rowCash)}
                  </td>
                </tr>
              );
            });
          })()}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-neutral-900 font-bold bg-neutral-100">
            <td colSpan={5} className="py-2.5 px-2 text-right">{language === 'id' ? 'TOTAL KESELURUHAN:' : 'GRAND TOTAL:'}</td>
            <td className="py-2.5 px-2 text-right font-mono tabular-nums text-emerald-900">
              +{formatRupiah(summary.totalGainTerjual)}
            </td>
            <td className="py-2.5 px-2 text-right font-mono tabular-nums">
              {formatRupiah(summary.totalNilaiSisaStok)}
            </td>
            <td className="py-2.5 px-2 text-right font-mono tabular-nums text-neutral-950">
              {formatRupiah(summary.totalPemasukanJual)}
            </td>
            <td className="py-2.5 px-2 text-right font-mono tabular-nums text-emerald-950">
              {formatRupiah(summary.saldoKasSaatIni)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-8 pt-4 border-t border-neutral-300 grid grid-cols-2 text-xs">
        <div className="space-y-1 text-neutral-500">
          <p className="font-semibold text-neutral-700">{language === 'id' ? 'Catatan Penutupan Kas Toko:' : 'Cash Closing Notes:'}</p>
          <p>• {language === 'id' ? 'Barang belum laku mengurangi ekuitas kas dan tidak dicatat untung sebelum terjual.' : 'Unsold goods reduce cash equity and are not recorded as profit until sold.'}</p>
          <p>• {language === 'id' ? 'Keuntungan dan simpanan dihitung nyata dari barang yang telah laku.' : 'Profit and savings are calculated from items that have actually been sold.'}</p>
        </div>
        <div className="text-right space-y-10">
          <p className="text-neutral-600">{language === 'id' ? 'Kasir / Pemilik Usaha,' : 'Cashier / Business Owner,'}</p>
          <p className="font-semibold text-neutral-900 underline underline-offset-4">( ........................................ )</p>
        </div>
      </div>
    </div>
  );
};
