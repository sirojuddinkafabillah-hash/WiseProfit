import { ArrowUpRight, Boxes, CalendarDays, PackagePlus } from 'lucide-react';
import type { InventoryItem } from '../types/inventory';
import { formatRupiah } from '../utils/calculator';

export default function PurchasesModule({ items, onAddPurchase }: { items: InventoryItem[]; onAddPurchase: () => void }) {
  const rows = [...items].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  const total = rows.reduce((sum, item) => sum + (Number(item.hargaBeli) || 0), 0);
  return <section className="module-stack">
    <div className="module-intro"><div><span className="eyebrow">PENGADAAN STOK</span><h2>Data pembelian barang</h2><p>Daftar pembelian yang tercatat saat barang dimasukkan ke inventaris.</p></div><button className="primary-button" onClick={onAddPurchase}><PackagePlus size={16}/> Catat barang masuk</button></div>
    <div className="purchase-summary">
      <article className="glass report-card"><small><Boxes size={14}/> Total barang masuk</small><b>{rows.length} item</b></article>
      <article className="glass report-card"><small><CalendarDays size={14}/> Total modal pembelian</small><b>{formatRupiah(total)}</b></article>
    </div>
    <div className="glass module-table-wrap"><div className="module-table-heading"><b>Riwayat barang masuk</b><span>Urutan terbaru terlebih dahulu</span></div><div className="module-table-scroll"><table className="module-table"><thead><tr><th>Tanggal input</th><th>Nama barang</th><th>Jumlah per wadah</th><th>Harga beli</th><th>Harga jual/unit</th><th>Catatan</th></tr></thead><tbody>{rows.map(item=><tr key={item.id}><td>{item.tanggalInput || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID') : '-')}</td><td><b>{item.namaBarang}</b></td><td>{item.jumlahBarangWadah} {item.satuanUnit}/{item.satuanWadah}</td><td>{formatRupiah(item.hargaBeli)}</td><td>{formatRupiah(item.hargaJualSatuan)}</td><td>{item.catatan || '-'}</td></tr>)}{!rows.length&&<tr><td colSpan={6} className="table-empty">Belum ada pembelian. Catat barang masuk melalui tombol di atas.</td></tr>}</tbody></table></div></div>
    <p className="module-footnote"><ArrowUpRight size={13}/> Catatan: berdasarkan struktur data lama, satu entri inventaris mewakili satu catatan barang masuk. Modul ini belum menyimpan beberapa batch pembelian untuk SKU yang sama atau faktur pemasok terpisah.</p>
  </section>;
}
