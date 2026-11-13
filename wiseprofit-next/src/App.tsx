import { useState } from 'react'
import { Activity, ArrowDownLeft, ArrowUpRight, Bell, Box, ChevronDown, ChevronLeft, CircleHelp, Command, CreditCard, Download, LayoutDashboard, Menu, Moon, Package, Plus, Search, Settings2, ShieldCheck, ShoppingBag, Sparkles, Sun, Wallet, ChartNoAxesCombined, NotebookPen } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const navigation = [
  { section: 'WORKSPACE', items: [{ label: 'Dashboard', icon: LayoutDashboard }, { label: 'Kasir', icon: ShoppingBag }, { label: 'Barang', icon: Package }, { label: 'Pembelian', icon: Box }] },
  { section: 'KEUANGAN', items: [{ label: 'Laporan', icon: ChartNoAxesCombined }, { label: 'Penarikan', icon: Wallet }, { label: 'Catatan', icon: NotebookPen }] },
  { section: 'LAINNYA', items: [{ label: 'Ekspor & Impor', icon: Download }, { label: 'Bantuan & Keluhan', icon: CircleHelp }] },
]
const stats = [
  { label: 'Total omzet', value: 'Rp0', note: 'Belum ada transaksi', icon: ArrowUpRight, tone: 'blue' },
  { label: 'Keuntungan bersih', value: 'Rp0', note: 'Menunggu data penjualan', icon: Activity, tone: 'green' },
  { label: 'Saldo kas', value: 'Rp0', note: 'Saldo usaha saat ini', icon: Wallet, tone: 'violet' },
  { label: 'Total barang', value: '0', note: 'Produk dalam inventaris', icon: Package, tone: 'amber' },
]
const periods = ['7 hari', '30 hari', '6 bulan', '12 bulan']

export default function App() {
  const [active, setActive] = useState('Dashboard')
  const [expanded, setExpanded] = useState(true)
  const [dark, setDark] = useState(true)
  const [period, setPeriod] = useState('30 hari')
  const [searchOpen, setSearchOpen] = useState(false)

  return <div className={dark ? 'app dark' : 'app light'}>
    <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="ambient ambient-three" />
    <aside className={expanded ? 'sidebar expanded' : 'sidebar collapsed'}>
      <div className="brand"><div className="brand-mark">W</div>{expanded && <div className="brand-copy"><strong>WiseProfit</strong><span>BUSINESS DESK</span></div>}</div>
      <button className="collapse-button" onClick={() => setExpanded(!expanded)} aria-label="Ciutkan sidebar"><ChevronLeft size={16} /></button>
      <div className="workspace-switch"><div className="store-avatar">W</div>{expanded && <><div><b>Usaha Saya</b><small>Workspace utama</small></div><ChevronDown size={15} /></>}</div>
      <nav>{navigation.map(group => <div className="nav-group" key={group.section}>{expanded && <p className="nav-label">{group.section}</p>}{group.items.map(item => { const Icon = item.icon; return <button key={item.label} title={!expanded ? item.label : undefined} onClick={() => setActive(item.label)} className={active === item.label ? 'nav-item active' : 'nav-item'}><Icon size={18} /><span>{item.label}</span>{active === item.label && <i />}</button>})}</div>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item" onClick={() => setActive('Pengaturan')}><Settings2 size={18}/><span>Pengaturan</span></button><div className="profile-mini"><div className="avatar">WP</div>{expanded && <div><b>Pengguna</b><small><i className="online-dot"/> Online</small></div>}</div></div>
    </aside>
    <main className={expanded ? 'main shifted' : 'main'}>
      <header className="topbar"><div className="crumb"><button className="mobile-menu" onClick={() => setExpanded(!expanded)}><Menu size={19}/></button><span>Workspace</span><b>/</b><strong>{active}</strong></div><div className="top-actions"><button className="search-trigger" onClick={() => setSearchOpen(!searchOpen)}><Search size={16}/><span>Cari menu...</span><kbd>⌘ K</kbd></button><button className="icon-button" onClick={() => setDark(!dark)} aria-label="Ganti tema">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button><button className="icon-button notification" aria-label="Notifikasi"><Bell size={18}/><i/></button><div className="avatar top-avatar">WP</div></div></header>
      {searchOpen && <div className="search-panel"><Search size={17}/><input autoFocus placeholder="Cari fitur WiseProfit..." onKeyDown={e => { if(e.key === 'Escape') setSearchOpen(false) }}/><kbd>ESC</kbd></div>}
      <div className="content">
        <div className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> BUSINESS OVERVIEW</div><h1>Dashboard</h1><p>Pantau kondisi usaha dan keuanganmu dari satu tempat.</p></div><button className="primary-button" onClick={() => setActive('Kasir')}><Plus size={17}/> Catat transaksi</button></div>
        {active !== 'Dashboard' && <div className="notice"><ShieldCheck size={18}/><div><b>Ruang {active} sedang disiapkan</b><p>Kerangka visual sudah tersedia. Fitur dan koneksi data modul ini akan dipindahkan bertahap dari WiseProfit lama.</p></div></div>}
        <section className="stat-grid">{stats.map((s) => { const Icon=s.icon; return <article className="glass stat-card" key={s.label}><div className="stat-top"><span>{s.label}</span><div className={'stat-icon '+s.tone}><Icon size={17}/></div></div><strong className="stat-value">{s.value}</strong><div className="stat-note">{s.note}</div></article>})}</section>
        <section className="dashboard-grid">
          <article className="glass chart-card"><div className="card-heading"><div><span className="eyebrow">PERFORMA USAHA</span><h2>Arus pendapatan</h2><p>Ringkasan pemasukan akan tampil setelah transaksi tersimpan.</p></div><select value={period} onChange={e => setPeriod(e.target.value)}>{periods.map(p=><option key={p}>{p}</option>)}</select></div><div className="chart-empty"><div className="chart-placeholder"><ResponsiveContainer width="100%" height="100%"><AreaChart data={[{name:'',value:0},{name:'',value:0},{name:'',value:0},{name:'',value:0},{name:'',value:0}]}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4c9cff" stopOpacity={0.28}/><stop offset="95%" stopColor="#4c9cff" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 6" vertical={false} stroke="var(--line)"/><XAxis dataKey="name" hide/><YAxis hide/><Tooltip/><Area dataKey="value" stroke="#4c9cff" fill="url(#revenueFill)" /></AreaChart></ResponsiveContainer></div><div className="empty-overlay"><div className="empty-icon"><ChartNoAxesCombined size={22}/></div><b>Belum ada data grafik</b><span>Catat penjualan pertamamu untuk mulai melihat tren usaha.</span></div></div></article>
          <article className="glass quick-card"><div className="card-heading"><div><span className="eyebrow">AKSES CEPAT</span><h2>Mulai aktivitas</h2></div><Command size={17} className="muted"/></div><div className="quick-list">{[{label:'Penjualan baru',desc:'Catat transaksi pelanggan',icon:ShoppingBag,action:'Kasir'},{label:'Tambah barang',desc:'Kelola produk dan stok',icon:Package,action:'Barang'},{label:'Catat pembelian',desc:'Barang masuk dan modal',icon:CreditCard,action:'Pembelian'},{label:'Lihat laporan',desc:'Pantau laba dan arus kas',icon:ChartNoAxesCombined,action:'Laporan'}].map(q=>{const Icon=q.icon;return <button className="quick-item" key={q.label} onClick={()=>setActive(q.action)}><div className="quick-icon"><Icon size={18}/></div><div><b>{q.label}</b><span>{q.desc}</span></div><ArrowUpRight size={16}/></button>})}</div></article>
        </section>
        <section className="bottom-grid"><article className="glass bottom-card"><div className="card-heading"><div><span className="eyebrow">AKTIVITAS TERBARU</span><h2>Transaksi terakhir</h2></div><button className="text-button" onClick={()=>setActive('Laporan')}>Lihat laporan <ArrowUpRight size={14}/></button></div><div className="empty-row"><div className="empty-icon"><ArrowDownLeft size={19}/></div><div><b>Belum ada transaksi</b><span>Transaksi yang kamu catat akan muncul di sini.</span></div></div></article><article className="glass bottom-card balance-card"><div className="card-heading"><div><span className="eyebrow">RINGKASAN KAS</span><h2>Posisi keuangan</h2></div><Wallet size={18} className="muted"/></div><div className="balance-total">Rp0</div><span className="balance-caption">Saldo kas tercatat</span><div className="balance-line"><span><i className="dot in"/> Pemasukan</span><b>Rp0</b></div><div className="balance-line"><span><i className="dot out"/> Pengeluaran</span><b>Rp0</b></div></article></section>
        <footer>WiseProfit Next <span>•</span> Workspace keuangan usaha</footer>
      </div>
    </main>
  </div>
}
