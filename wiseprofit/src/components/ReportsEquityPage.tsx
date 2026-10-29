import React, { useState, useMemo } from 'react';
import { InventoryItem, GlobalSummary } from '../types/inventory';
import { calculateItem, formatRupiah, formatAngka } from '../utils/calculator';
import { 
  TrendingUp, 
  Wallet, 
  Package, 
  BarChart3, 
  Calendar, 
  ArrowUpRight, 
  PieChart, 
  ShieldCheck, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  SlidersHorizontal,
  DollarSign,
  Layers,
  ArrowDownRight,
  ArrowLeft
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { USER_IMAGE_HEADERS, buildExcelExportRows } from '../utils/excelExporter';
import type { Language } from '../i18n/translations';

interface ReportsEquityPageProps {
  language: Language;
  items: InventoryItem[];
  modalAwal: number;
  summary: GlobalSummary;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  onPrintReport: () => void;
  onBackToInventory?: () => void;
}

export const ReportsEquityPage: React.FC<ReportsEquityPageProps> = ({
  language,
  items,
  modalAwal,
  summary,
  selectedMonth,
  onSelectMonth,
  onPrintReport,
  onBackToInventory,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'gain' | 'terjual' | 'omset' | 'nilaiStok' | 'terbaru'>('gain');

  // Extract available months from items
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    items.forEach((item) => {
      const month = (item.tanggalInput || new Date(item.createdAt).toISOString().slice(0, 7)).slice(0, 7);
      monthSet.add(month);
    });
    return Array.from(monthSet).sort().reverse();
  }, [items]);

  // Filter items by selected month
  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedMonth !== 'all') {
      result = result.filter((item) => {
        const itemMonth = (item.tanggalInput || new Date(item.createdAt).toISOString().slice(0, 7)).slice(0, 7);
        return itemMonth === selectedMonth;
      });
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((item) => 
        item.namaBarang.toLowerCase().includes(q) ||
        (item.catatan && item.catatan.toLowerCase().includes(q))
      );
    }
    return result;
  }, [items, selectedMonth, searchTerm]);

  // Calculated items list with metrics
  const analyzedItems = useMemo(() => {
    return filteredItems.map((item, idx) => {
      const calc = calculateItem(item);
      return {
        item,
        calc,
        originalIndex: idx,
      };
    });
  }, [filteredItems]);

  // Sorted items
  const sortedAnalyzedItems = useMemo(() => {
    return [...analyzedItems].sort((a, b) => {
      switch (sortBy) {
        case 'gain':
          return b.calc.totalGainTerjual - a.calc.totalGainTerjual;
        case 'terjual':
          return b.item.jumlahBarangDijualSatuan - a.item.jumlahBarangDijualSatuan;
        case 'omset':
          return b.calc.totalPendapatanTerjual - a.calc.totalPendapatanTerjual;
        case 'nilaiStok':
          return b.calc.nilaiSisaStok - a.calc.nilaiSisaStok;
        case 'terbaru':
        default:
          return b.item.createdAt - a.item.createdAt;
      }
    });
  }, [analyzedItems, sortBy]);

  // Top gain items
  const topGainItems = useMemo(() => {
    return [...analyzedItems]
      .filter((i) => i.calc.totalGainTerjual > 0)
      .sort((a, b) => b.calc.totalGainTerjual - a.calc.totalGainTerjual)
      .slice(0, 3);
  }, [analyzedItems]);

  // Top units sold items
  const topSoldItems = useMemo(() => {
    return [...analyzedItems]
      .filter((i) => i.item.jumlahBarangDijualSatuan > 0)
      .sort((a, b) => b.item.jumlahBarangDijualSatuan - a.item.jumlahBarangDijualSatuan)
      .slice(0, 3);
  }, [analyzedItems]);

  // Equity calculations
  const totalEkuitasUsaha = summary.saldoKasSaatIni + summary.totalNilaiSisaStok;
  const pertumbuhanEkuitasNominal = totalEkuitasUsaha - modalAwal;
  const persenPertumbuhanEkuitas = modalAwal > 0 ? (pertumbuhanEkuitasNominal / modalAwal) * 100 : 0;

  // Percentage breakdown of business equity
  const totalAssets = Math.max(1, totalEkuitasUsaha);
  const percentCash = Math.max(0, Math.min(100, (summary.saldoKasSaatIni / totalAssets) * 100));
  const percentStock = Math.max(0, Math.min(100, (summary.totalNilaiSisaStok / totalAssets) * 100));

  // Export report to Excel matching user image layout
  const handleExportExcel = () => {
    // 1. Primary Sheet: exact 12-column layout matching user's image
    const exportRows = buildExcelExportRows(filteredItems, modalAwal);
    const wsStoreFormat = XLSX.utils.json_to_sheet(exportRows, { header: USER_IMAGE_HEADERS });

    wsStoreFormat['!cols'] = [
      { wch: 6 },   // No
      { wch: 14 },  // Tanggal Input
      { wch: 22 },  // Item Name
      { wch: 16 },  // Jumlah 1 Wadah
      { wch: 18 },  // Purchase Price 1 Wadah
      { wch: 22 },  // Units Sold
      { wch: 18 },  // Selling Price Satuan
      { wch: 24 },  // Gain (Untung Terealisasi)
      { wch: 20 },  // Cost Recovered
      { wch: 22 },  // Remaining Stock Value (Equity)
      { wch: 38 },  // TOTAL SETELAH UNTUNG (Cash Inflow)
      { wch: 16 },  // CASH BALANCE
    ];

    const range = XLSX.utils.decode_range(wsStoreFormat['!ref'] || 'A1:L1');
    wsStoreFormat['!autofilter'] = { ref: `A1:L${range.e.r + 1}` };

    // 2. Summary Sheet
    const summarySheetData = [
      { 'Equity & Financial Metric': 'Initial Business Capital', 'Value (IDR)': modalAwal },
      { 'Equity & Financial Metric': 'Total Stock Purchase Expenses', 'Value (IDR)': summary.totalPengeluaranBeli },
      { 'Equity & Financial Metric': 'Total Sales Revenue Received', 'Value (IDR)': summary.totalPemasukanJual },
      { 'Equity & Financial Metric': 'Cost Recovered', 'Value (IDR)': summary.totalModalKembali },
      { 'Equity & Financial Metric': 'Total Realized Net Profit (Gain)', 'Value (IDR)': summary.totalGainTerjual },
      { 'Equity & Financial Metric': 'Remaining Inventory Equity Value', 'Value (IDR)': summary.totalNilaiSisaStok },
      { 'Equity & Financial Metric': 'Available Cash Balance', 'Value (IDR)': summary.saldoKasSaatIni },
      { 'Equity & Financial Metric': 'TOTAL BUSINESS EQUITY (Cash + Stock)', 'Value (IDR)': totalEkuitasUsaha },
      { 'Equity & Financial Metric': 'Capital Growth / ROI (%)', 'Value (IDR)': `${persenPertumbuhanEkuitas.toFixed(2)}%` },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summarySheetData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsStoreFormat, 'Cashier_Report_Store_Format');
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Equity_Summary');

    const fileName = `Sales_Equity_Report_${selectedMonth === 'all' ? 'All_Periods' : selectedMonth}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Return to Kasir Nav Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 sm:p-5 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          {onBackToInventory && (
            <button
              type="button"
              onClick={onBackToInventory}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-sans text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>{language === 'id' ? 'Kembali ke Kasir' : 'Back to Cashier'}</span>
            </button>
          )}
          <span className="hidden sm:inline-block text-xs font-sans text-slate-400">
            · Standalone Page: <strong className="text-slate-200">{language === 'id' ? 'Laporan Penjualan & Ekuitas' : 'Sales & Equity Report'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 font-sans text-xs">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Download the full report as an Excel file (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{language === 'id' ? 'Ekspor Excel' : 'Export Excel'}</span>
          </button>
          <button
            type="button"
            onClick={onPrintReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Print the report in receipt / A4 format"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'id' ? 'Cetak atau Simpan PDF' : 'Print or Save PDF'}</span>
          </button>
        </div>
      </div>

      {/* Top Banner & Filter Controls */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Sales & Business Equity Report
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Real-time
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Comprehensive overview of cash balance, remaining inventory assets, and realized net profit
              </p>
            </div>
          </div>

          {/* Month Selector & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs font-sans">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <select
                value={selectedMonth}
                onChange={(e) => onSelectMonth(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-slate-900 text-white">{language === 'id' ? 'Semua Periode' : 'All Periods'}</option>
                {availableMonths.map((m) => {
                  const [y, mon] = m.split('-');
                  const monthName = new Date(Number(y), Number(mon) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  return (
                    <option key={m} value={m} className="bg-slate-900 text-white">
                      {monthName}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-sans font-semibold transition-colors cursor-pointer shadow-xs"
              title="Download the full report as an Excel file (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={onPrintReport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/20"
              title="Print the official report in receipt / A4 format"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print or Save PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 PRIMARY EQUITY & CASH METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Initial Business Capital */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.3)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-sans text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-semibold">{language === 'id' ? '1. Modal Awal' : '1. Initial Capital'}</span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-white tracking-tight">
            {formatRupiah(modalAwal)}
          </div>
          <div className="mt-2 text-[11px] font-sans text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
            <span>{language === 'id' ? 'Pembelian stok:' : 'Stock purchases:'}</span>
            <span className="text-slate-200 font-semibold">{formatRupiah(summary.totalPengeluaranBeli)}</span>
          </div>
        </div>

        {/* 2. Current Cash Balance */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.3)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-sans text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-semibold">{language === 'id' ? '2. Saldo Kas Aktual' : '2. Actual Cash Balance'}</span>
            <div className={`p-2 rounded-xl border ${
              summary.saldoKasSaatIni >= modalAwal 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-sans tracking-tight ${
            summary.saldoKasSaatIni >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {formatRupiah(summary.saldoKasSaatIni)}
          </div>
          <div className="mt-2 text-[11px] font-sans text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
            <span>{language === 'id' ? 'Uang masuk:' : 'Inflow:'} <strong className="text-emerald-400 font-semibold">+{formatRupiah(summary.totalPemasukanJual)}</strong></span>
            {summary.totalPenarikanKas > 0 ? (
              <span className="text-rose-400 font-semibold">Withdrawn: -{formatRupiah(summary.totalPenarikanKas)}</span>
            ) : (
              <span className="text-slate-500">{language === 'id' ? 'Belum ada penarikan' : 'No withdrawals yet'}</span>
            )}
          </div>
        </div>

        {/* 3. Remaining Inventory Equity Value */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.3)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-sans text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-semibold">{language === 'id' ? '3. Nilai Sisa Persediaan' : '3. Remaining Inventory Value'}</span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-purple-300 tracking-tight">
            {formatRupiah(summary.totalNilaiSisaStok)}
          </div>
          <div className="mt-2 text-[11px] font-sans text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
            <span>{language === 'id' ? 'Modal kembali dari barang terjual:' : 'Cost recovered from sold items:'}</span>
            <span className="text-slate-200 font-semibold">{formatRupiah(summary.totalModalKembali)}</span>
          </div>
        </div>

        {/* 4. Total Business Equity (Net Business Value) */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.3)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-sans text-slate-400 mb-2">
            <span className="uppercase tracking-wider font-semibold">{language === 'id' ? '4. Total Ekuitas Usaha' : '4. Total Business Equity'}</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-cyan-300 tracking-tight">
            {formatRupiah(totalEkuitasUsaha)}
          </div>
          <div className="mt-2 text-[11px] font-sans flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-slate-400">{language === 'id' ? 'Pertumbuhan Modal:' : 'Capital Growth:'}</span>
            <span className={`font-bold flex items-center gap-0.5 ${
              pertumbuhanEkuitasNominal >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {pertumbuhanEkuitasNominal >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 inline" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 inline" />
              )}
              {persenPertumbuhanEkuitas >= 0 ? '+' : ''}{formatAngka(persenPertumbuhanEkuitas, 1)}%
            </span>
          </div>
        </div>
      </div>

      {/* EQUITY BREAKDOWN COMPOSITION & SALES PERFORMANCE STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Breakdown of Equity & Profit */}
        <div className="lg:col-span-7 bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-white">
                Business Equity Breakdown
              </h2>
            </div>
            <span className="text-xs font-sans text-slate-400">
              Actual Business Value: <strong className="text-white">{formatRupiah(totalEkuitasUsaha)}</strong>
            </span>
          </div>

          {/* Visual Percentage Bar */}
          <div className="space-y-2">
            <div className="h-6 w-full bg-slate-950/80 rounded-xl p-1 border border-slate-800 flex overflow-hidden">
              <div
                style={{ width: `${percentCash}%` }}
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-lg transition-all duration-500 relative group"
                title={`Kas Cair: ${percentCash.toFixed(1)}%`}
              />
              <div
                style={{ width: `${percentStock}%` }}
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-r-lg transition-all duration-500 relative group"
                title={`Inventory Equity: ${percentStock.toFixed(1)}%`}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-sans text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
                <span>{language === 'id' ? 'Kas tersedia:' : 'Available cash:'} <strong>{formatRupiah(summary.saldoKasSaatIni)}</strong> ({percentCash.toFixed(1)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-purple-500 inline-block" />
                <span>{language === 'id' ? 'Nilai persediaan tersisa:' : 'Remaining inventory value:'} <strong>{formatRupiah(summary.totalNilaiSisaStok)}</strong> ({percentStock.toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          {/* 3 Secondary Financial Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs font-sans">
            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
              <span className="text-slate-400 text-[11px] block">{language === 'id' ? 'Laba Bersih Terealisasi' : 'Realized Net Profit'}</span>
              <span className="text-emerald-400 font-bold text-base mt-1 block">
                +{formatRupiah(summary.totalGainTerjual)}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">{language === 'id' ? 'Dari unit yang terjual' : 'From units sold'}</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
              <span className="text-slate-400 text-[11px] block">{language === 'id' ? 'Rata-rata Margin Laba' : 'Average Profit Margin'}</span>
              <span className="text-cyan-400 font-bold text-base mt-1 block">
                {formatAngka(summary.rataRataMargin, 1)}%
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">{language === 'id' ? 'Margin kotor per produk' : 'Gross margin per product'}</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl">
              <span className="text-slate-400 text-[11px] block">{language === 'id' ? 'Potensi Laba dari Sisa Stok' : 'Potential Profit from Remaining Stock'}</span>
              <span className="text-amber-300 font-bold text-base mt-1 block">
                +{formatRupiah(Math.max(0, summary.totalSetelahUntungPenuh - summary.totalPengeluaranBeli - summary.totalGainTerjual))}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">{language === 'id' ? 'Jika seluruh sisa stok terjual' : 'If all remaining stock is sold'}</span>
            </div>
          </div>

          {/* Monthly Profit Savings Simulation */}
          <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl space-y-2 text-xs font-sans">
            <div className="flex items-center justify-between text-emerald-300 font-bold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Monthly Profit Savings Allocation ({50}%)
              </span>
              <span className="text-white text-sm">{formatRupiah(summary.totalSimpananSetelah1Bulan)}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Set aside from total net profit to increase reserves or emergency funds. Cash available to reinvest in stock: <strong className="text-white font-sans">{formatRupiah(summary.totalKasDiputarBulanDepan)}</strong>.
            </p>
          </div>
        </div>

        {/* Right Column: Top Performing Products */}
        <div className="lg:col-span-5 bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-white">
                  Best-Selling Products & Profit Contributors
                </h2>
              </div>
              <span className="text-[11px] font-sans text-slate-400">{filteredItems.length} items</span>
            </div>

            {/* Top Profit Items */}
            <div className="space-y-3 mb-5">
              <div className="text-[11px] font-sans font-semibold text-emerald-400 uppercase tracking-wider">
                Top Profit Contributors
              </div>
              {topGainItems.length > 0 ? (
                topGainItems.map((entry, idx) => (
                  <div key={entry.item.id} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <div className="text-white font-medium truncate">{entry.item.namaBarang}</div>
                        <div className="text-[10px] text-slate-400">{entry.item.jumlahBarangDijualSatuan} sold</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-emerald-400 font-bold">+{formatRupiah(entry.calc.totalGainTerjual)}</div>
                      <div className="text-[10px] text-slate-500">Margin {entry.calc.marginPersen.toFixed(0)}%</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 font-sans py-2 text-center bg-slate-950/50 rounded-xl">
                  No items have been sold yet
                </div>
              )}
            </div>

            {/* Top Sold Units */}
            <div className="space-y-3">
              <div className="text-[11px] font-sans font-semibold text-cyan-400 uppercase tracking-wider">
                Top Units Sold
              </div>
              {topSoldItems.length > 0 ? (
                topSoldItems.map((entry, idx) => (
                  <div key={entry.item.id} className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <div className="text-white font-medium truncate">{entry.item.namaBarang}</div>
                        <div className="text-[10px] text-slate-400">Remaining stock: {entry.calc.sisaStokSatuan} unit</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-cyan-300 font-bold">{entry.item.jumlahBarangDijualSatuan} {entry.item.satuanUnit}</div>
                      <div className="text-[10px] text-slate-500">Revenue {formatRupiah(entry.calc.totalPendapatanTerjual)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 font-sans py-2 text-center bg-slate-950/50 rounded-xl">
                  No sales recorded yet
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-sans text-slate-400">
            <span>{language === 'id' ? 'Status usaha:' : 'Business status:'}</span>
            <span className={`font-semibold ${summary.totalPemasukanJual >= summary.totalPengeluaranBeli ? 'text-emerald-400' : 'text-amber-300'}`}>
              {summary.totalPemasukanJual >= summary.totalPengeluaranBeli 
                ? 'Purchase Cost Sudah Tertutup Penuh' 
                : `Short by ${formatRupiah(summary.totalPengeluaranBeli - summary.totalPemasukanJual)} to recover stock purchase costs`}
            </span>
          </div>
        </div>
      </div>

      {/* DETAILED SALES & EQUITY BREAKDOWN TABLE */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        {/* Table Filters & Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-sans font-bold text-white uppercase tracking-wider">
                Detailed Sales & Inventory Equity
              </h2>
              <p className="text-[11px] font-sans text-slate-400">
                Showing sales revenue received, recovered costs, net profit, and remaining inventory assets
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'id' ? "Cari nama barang..." : "Search item name..."}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-sans w-44 sm:w-56"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-sans">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="gain" className="bg-slate-900 text-white">{language === 'id' ? 'Urutkan: Laba Tertinggi' : 'Sort: Highest Profit'}</option>
                <option value="terjual" className="bg-slate-900 text-white">{language === 'id' ? 'Urutkan: Unit Terjual Terbanyak' : 'Sort: Most Units Sold'}</option>
                <option value="omset" className="bg-slate-900 text-white">{language === 'id' ? 'Urutkan: Omzet Tertinggi' : 'Sort: Highest Revenue'}</option>
                <option value="nilaiStok" className="bg-slate-900 text-white">{language === 'id' ? 'Urutkan: Nilai Sisa Stok' : 'Sort: Remaining Inventory Value'}</option>
                <option value="terbaru" className="bg-slate-900 text-white">{language === 'id' ? 'Urutkan: Tanggal Terbaru' : 'Sort: Newest Date'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 font-sans uppercase text-[10px] tracking-wider border-b border-slate-800">
                <th className="py-3 px-3.5 font-bold">No</th>
                <th className="py-3 px-3.5 font-bold">{language === 'id' ? 'Barang & Tanggal' : 'Item & Date'}</th>
                <th className="py-3 px-3.5 font-bold text-right">{language === 'id' ? 'Biaya Pembelian' : 'Purchase Cost'}</th>
                <th className="py-3 px-3.5 font-bold text-center">{language === 'id' ? 'Terjual / Stok' : 'Sold / Stock'}</th>
                <th className="py-3 px-3.5 font-bold text-right">{language === 'id' ? 'Harga Jual' : 'Selling Price'}</th>
                <th className="py-3 px-3.5 font-bold text-right text-cyan-300">{language === 'id' ? 'Omzet Masuk Kas' : 'Revenue Inflow'}</th>
                <th className="py-3 px-3.5 font-bold text-right text-emerald-300">{language === 'id' ? 'Laba Bersih' : 'Net Profit'}</th>
                <th className="py-3 px-3.5 font-bold text-right text-purple-300">{language === 'id' ? 'Nilai Sisa Stok' : 'Remaining Stock Value'}</th>
                <th className="py-3 px-3.5 font-bold text-center">{language === 'id' ? 'Status Modal' : 'Capital Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans text-[11px]">
              {sortedAnalyzedItems.length > 0 ? (
                sortedAnalyzedItems.map((entry, index) => {
                  const { item, calc } = entry;
                  const percentSold = item.jumlahBarangWadah > 0 
                    ? (item.jumlahBarangDijualSatuan / item.jumlahBarangWadah) * 100 
                    : 0;

                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-slate-900/70 transition-colors"
                    >
                      <td className="py-3 px-3.5 text-slate-500 font-semibold">
                        {index + 1}
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-bold font-sans text-white text-xs">
                          {item.namaBarang}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {item.tanggalInput || new Date(item.createdAt).toISOString().slice(0, 10)} · {item.jumlahBarangWadah} {item.satuanUnit} / {item.satuanWadah}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <div className="text-slate-200 font-semibold">{formatRupiah(item.hargaBeli)}</div>
                        <div className="text-[10px] text-slate-500">Unit Cost: {formatRupiah(calc.hppSatuan)}/{item.satuanUnit}</div>
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-slate-200">
                          <span className="text-emerald-400">{item.jumlahBarangDijualSatuan}</span>
                          <span className="text-slate-500">/</span>
                          <span>{item.jumlahBarangWadah}</span>
                        </div>
                        <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto mt-1 overflow-hidden">
                          <div 
                            style={{ width: `${Math.min(100, percentSold)}%` }}
                            className="h-full bg-emerald-400 rounded-full"
                          />
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-right text-slate-300 font-medium">
                        {formatRupiah(item.hargaJualSatuan)}
                      </td>

                      <td className="py-3 px-3.5 text-right font-bold text-cyan-300">
                        {formatRupiah(calc.totalPendapatanTerjual)}
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <div className="font-bold text-emerald-400">
                          +{formatRupiah(calc.totalGainTerjual)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Margin {calc.marginPersen.toFixed(0)}%
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-right font-semibold text-purple-300">
                        {formatRupiah(calc.nilaiSisaStok)}
                      </td>

                      <td className="py-3 px-3.5 text-center">
                        {calc.isModalLunas ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Capital Recovered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            Remaining {formatRupiah(Math.max(0, item.hargaBeli - calc.totalPendapatanTerjual))}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans text-xs">
                    {searchTerm ? 'No items match your search.' : 'No item data for this period.'}
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Footer Totals */}
            {sortedAnalyzedItems.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900 font-sans font-bold text-xs text-white border-t border-slate-700">
                  <td colSpan={2} className="py-3.5 px-3.5 uppercase tracking-wider">
                    Grand Total ({sortedAnalyzedItems.length} Items)
                  </td>
                  <td className="py-3.5 px-3.5 text-right text-slate-200">
                    {formatRupiah(summary.totalPengeluaranBeli)}
                  </td>
                  <td className="py-3.5 px-3.5 text-center text-slate-400">
                    -
                  </td>
                  <td className="py-3.5 px-3.5 text-right text-slate-400">
                    -
                  </td>
                  <td className="py-3.5 px-3.5 text-right text-cyan-300 text-sm">
                    {formatRupiah(summary.totalPemasukanJual)}
                  </td>
                  <td className="py-3.5 px-3.5 text-right text-emerald-400 text-sm">
                    +{formatRupiah(summary.totalGainTerjual)}
                  </td>
                  <td className="py-3.5 px-3.5 text-right text-purple-300 text-sm">
                    {formatRupiah(summary.totalNilaiSisaStok)}
                  </td>
                  <td className="py-3.5 px-3.5 text-center text-[10px] text-slate-400">
                    {summary.totalPemasukanJual >= summary.totalPengeluaranBeli ? 'Break-even Reached' : 'Break-even in Progress'}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Bottom Return to Kasir Banner */}
      {onBackToInventory && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-900/80 backdrop-blur-xl border border-slate-700/60 rounded-3xl shadow-lg font-sans">
          <div className="text-center sm:text-left">
            <div className="text-sm font-bold text-white font-sans">
              Finished Reviewing the Sales Report?
            </div>
            <div className="text-xs text-slate-400 mt-0.5 font-sans">
              Return to the cashier interface and inventory transaction records.
            </div>
          </div>
          <button
            type="button"
            onClick={onBackToInventory}
            className="flex items-center gap-2.5 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-sans text-xs font-extrabold rounded-2xl shadow-xl shadow-emerald-500/25 transition-all cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>Back to Cashier</span>
          </button>
        </div>
      )}
    </div>
  );
};
