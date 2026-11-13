import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownLeft, ArrowUpRight, Bell, Box, ChevronDown, ChevronLeft, CircleHelp, Command, CreditCard, Download, LayoutDashboard, Menu, Moon, Package, Plus, Search, Settings2, ShieldCheck, ShoppingBag, Sparkles, Sun, Wallet, ChartNoAxesCombined, NotebookPen, LogOut, LockKeyhole, Mail, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import type { InventoryItem, Withdrawal } from './types/inventory'
import { calculateSummary, formatRupiah } from './utils/calculator'
import { fetchUserItemsOnce, fetchUserWithdrawalsOnce, getUserProfile, subscribeUserItems, subscribeUserWithdrawals } from './services/supabaseSync'
import InventoryModule from './components/InventoryModule'
import WithdrawalModule from './components/WithdrawalModule'
import CashierModule from './components/CashierModule'
import ReportsModule from './components/ReportsModule'
import NotesModule from './components/NotesModule'
import PurchasesModule from './components/PurchasesModule'

const navigation = [
  { section: 'WORKSPACE', items: [{ label: 'Dashboard', icon: LayoutDashboard }, { label: 'Kasir', icon: ShoppingBag }, { label: 'Barang', icon: Package }, { label: 'Pembelian', icon: Box }] },
  { section: 'KEUANGAN', items: [{ label: 'Laporan', icon: ChartNoAxesCombined }, { label: 'Penarikan', icon: Wallet }, { label: 'Catatan', icon: NotebookPen }] },
  { section: 'LAINNYA', items: [{ label: 'Ekspor & Impor', icon: Download }, { label: 'Bantuan & Keluhan', icon: CircleHelp }] },
]
const periods = ['7 hari', '30 hari', '6 bulan', '12 bulan']

export default function App() {
  const [active, setActive] = useState('Dashboard')
  const [expanded, setExpanded] = useState(true)
  const [dark, setDark] = useState(true)
  const [period, setPeriod] = useState('30 hari')
  const [searchOpen, setSearchOpen] = useState(false)
  const [user, setUser] = useState<{id:string;email:string|null;name:string} | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState<'login'|'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [modalAwal, setModalAwal] = useState(50000)
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState('')

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return }
    let mounted = true
    supabase.auth.getSession().then(({data,error}) => {
      if (!mounted) return
      if (error) setAuthError(error.message)
      const u = data.session?.user
      setUser(u ? {id:u.id,email:u.email || null,name:String(u.user_metadata?.full_name || u.user_metadata?.name || u.email || 'Pengguna')} : null)
      setAuthLoading(false)
    }).catch((e:unknown) => { if(mounted){setAuthError(e instanceof Error?e.message:'Gagal memeriksa sesi.');setAuthLoading(false)} })
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,session) => {
      if (!mounted) return
      const u=session?.user
      setUser(u?{id:u.id,email:u.email||null,name:String(u.user_metadata?.full_name||u.user_metadata?.name||u.email||'Pengguna')}:null)
      setAuthLoading(false)
    })
    return ()=>{mounted=false;subscription.unsubscribe()}
  }, [])

  useEffect(() => {
    if (!user || !supabase) { setItems([]); setWithdrawals([]); setModalAwal(50000); return }
    let alive=true
    setDataLoading(true); setDataError('')
    Promise.all([fetchUserItemsOnce(user.id),fetchUserWithdrawalsOnce(user.id),getUserProfile(user.id)])
      .then(([nextItems,nextWithdrawals,profile])=>{
        if(!alive)return
        setItems(nextItems);setWithdrawals(nextWithdrawals)
        setModalAwal(Number(profile?.modal_awal ?? 50000))
        setDataLoading(false)
      })
      .catch((e:unknown)=>{if(alive){setDataError(e instanceof Error?e.message:'Data usaha gagal dimuat. Periksa tabel dan kebijakan akses Supabase.');setDataLoading(false)}})
    const stopItems=subscribeUserItems(user.id,next=>{if(alive)setItems(next)})
    const stopWithdrawals=subscribeUserWithdrawals(user.id,next=>{if(alive)setWithdrawals(next)})
    return ()=>{alive=false;stopItems();stopWithdrawals()}
  },[user?.id])

  const summary = useMemo(()=>calculateSummary(items,modalAwal,withdrawals),[items,modalAwal,withdrawals])
  const money = (value:number)=>formatRupiah(value)
  const doAuth = async () => {
    if(!supabase)return
    setAuthError('')
    if(!email.trim() || !password){setAuthError('Isi email dan kata sandi terlebih dahulu.');return}
    setAuthBusy(true)
    try {
      if(authMode==='login'){
        const {error}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password})
        if(error)throw error
      } else {
        const {data,error}=await supabase.auth.signUp({email:email.trim().toLowerCase(),password,options:{emailRedirectTo:window.location.origin}})
        if(error)throw error
        if(!data.session)setAuthError('Akun dibuat. Periksa email untuk konfirmasi, lalu masuk.')
      }
    } catch(e:unknown) {setAuthError(e instanceof Error?e.message:'Autentikasi gagal. Coba lagi.')}
    finally {setAuthBusy(false)}
  }
  const googleAuth=async()=>{
    if(!supabase)return
    setAuthError('');setAuthBusy(true)
    const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}})
    if(error){setAuthError(error.message);setAuthBusy(false)}
  }
  const logout=async()=>{if(!supabase)return;const {error}=await supabase.auth.signOut();if(error)setDataError(error.message);setItems([]);setWithdrawals([]);setActive('Dashboard')}

  if(!isSupabaseConfigured) return <div className="auth-screen"><div className="auth-card"><div className="brand-mark">W</div><h1>WiseProfit Next</h1><p>Hubungkan aplikasi ke proyek Supabase untuk mengaktifkan login dan data usaha.</p><div className="auth-help"><b>Konfigurasi Vercel</b><span>Tambahkan <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> pada Environment Variables, lalu deploy ulang.</span><small>Gunakan publishable/anon key. Jangan pernah memasukkan service-role key ke frontend.</small></div></div></div>
  if(authLoading) return <div className="auth-screen"><div className="auth-card"><LoaderCircle className="spin" size={28}/><p>Memeriksa sesi akun...</p></div></div>
  if(!user) return <div className={dark?'auth-screen dark':'auth-screen'}><div className="ambient ambient-one"/><div className="ambient ambient-two"/><div className="auth-card"><div className="brand-mark">W</div><div className="eyebrow"><ShieldCheck size={14}/> PRIVATE BUSINESS WORKSPACE</div><h1>Selamat datang di WiseProfit</h1><p>Masuk untuk melihat data usaha yang tersimpan di akunmu.</p><label>Email</label><div className="auth-input"><Mail size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.com"/></div><label>Kata sandi</label><div className="auth-input"><LockKeyhole size={17}/><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimal 6 karakter" onKeyDown={e=>{if(e.key==='Enter')void doAuth()}}/><button onClick={()=>setShowPassword(!showPassword)} aria-label="Tampilkan kata sandi">{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></div>{authError&&<div className="auth-error">{authError}</div>}<button className="primary-button auth-submit" onClick={()=>void doAuth()} disabled={authBusy}>{authBusy?<LoaderCircle className="spin" size={17}/>:null}{authMode==='login'?'Masuk':'Buat akun'}</button><div className="auth-divider"><span>atau</span></div><button className="google-button" onClick={()=>void googleAuth()} disabled={authBusy}>Lanjutkan dengan Google</button><p className="auth-switch">{authMode==='login'?'Belum punya akun?':'Sudah punya akun?'} <button onClick={()=>{setAuthMode(authMode==='login'?'signup':'login');setAuthError('')}}>{authMode==='login'?'Daftar sekarang':'Masuk'}</button></p><small className="auth-security">Autentikasi dikelola langsung oleh Supabase Auth.</small></div></div>

  return <div className={dark ? 'app dark' : 'app light'}>
    <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="ambient ambient-three" />
    <aside className={expanded ? 'sidebar expanded' : 'sidebar collapsed'}>
      <div className="brand"><div className="brand-mark">W</div>{expanded && <div className="brand-copy"><strong>WiseProfit</strong><span>BUSINESS DESK</span></div>}</div>
      <button className="collapse-button" onClick={() => setExpanded(!expanded)} aria-label="Ciutkan sidebar"><ChevronLeft size={16} /></button>
      <div className="workspace-switch"><div className="store-avatar">W</div>{expanded && <><div><b>Usaha Saya</b><small>Workspace utama</small></div><ChevronDown size={15} /></>}</div>
      <nav>{navigation.map(group => <div className="nav-group" key={group.section}>{expanded && <p className="nav-label">{group.section}</p>}{group.items.map(item => { const Icon = item.icon; return <button key={item.label} title={!expanded ? item.label : undefined} onClick={() => setActive(item.label)} className={active === item.label ? 'nav-item active' : 'nav-item'}><Icon size={18} /><span>{item.label}</span>{active === item.label && <i />}</button>})}</div>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item" onClick={() => setActive('Pengaturan')}><Settings2 size={18}/><span>Pengaturan</span></button><div className="profile-mini"><div className="avatar">{user.name.slice(0,2).toUpperCase()}</div>{expanded && <div className="profile-copy"><b>{user.name}</b><small><i className="online-dot"/> Terhubung</small></div>}</div></div>
    </aside>
    <main className={expanded ? 'main' : 'main shifted'}>
      <header className="topbar"><div className="crumb"><button className="mobile-menu" onClick={() => setExpanded(!expanded)}><Menu size={19}/></button><span>Workspace</span><b>/</b><strong>{active}</strong></div><div className="top-actions"><button className="search-trigger" onClick={() => setSearchOpen(!searchOpen)}><Search size={16}/><span>Cari menu...</span><kbd>⌘ K</kbd></button><button className="icon-button" onClick={() => setDark(!dark)} aria-label="Ganti tema">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button><button className="icon-button notification" aria-label="Notifikasi"><Bell size={18}/><i/></button><div className="avatar top-avatar">{user.name.slice(0,2).toUpperCase()}</div><button className="icon-button" onClick={()=>void logout()} title="Keluar"><LogOut size={17}/></button></div></header>
      {searchOpen && <div className="search-panel"><Search size={17}/><input autoFocus placeholder="Cari fitur WiseProfit..." onKeyDown={e => { if(e.key === 'Escape') setSearchOpen(false) }}/><kbd>ESC</kbd></div>}
      <div className="content">
        <div className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> BUSINESS OVERVIEW</div><h1>{active}</h1><p>Selamat datang kembali, {user.name}. Ini ringkasan data dari akunmu.</p></div><button className="primary-button" onClick={() => setActive('Kasir')}><Plus size={17}/> Catat transaksi</button></div>
        {dataLoading&&<div className="notice"><LoaderCircle className="spin" size={18}/><div><b>Menyinkronkan data usaha</b><p>Mengambil inventaris dan penarikan milik akunmu dari Supabase.</p></div></div>}
        {dataError&&<div className="notice warning"><ShieldCheck size={18}/><div><b>Data belum berhasil dimuat</b><p>{dataError}</p></div></div>}
        {active !== 'Dashboard' && active !== 'Barang' && active !== 'Penarikan' && active !== 'Kasir' && active !== 'Laporan' && active !== 'Catatan' && active !== 'Pembelian' && <div className="notice"><ShieldCheck size={18}/><div><b>Modul {active} dalam tahap integrasi</b><p>Kerangka navigasi sudah tersedia. Modul transaksi akan dipindahkan berikutnya dengan mempertahankan perhitungan dan data WiseProfit lama.</p></div></div>}
        {active === 'Dashboard' && <>
        <section className="stat-grid">
          {[{label:'Total omzet',value:money(summary.totalPemasukanJual),note:'Pendapatan dari unit terjual',icon:ArrowUpRight,tone:'blue'},{label:'Keuntungan bersih',value:money(summary.totalGainTerjual),note:'Laba terealisasi',icon:Activity,tone:'green'},{label:'Saldo kas',value:money(summary.saldoKasSaatIni),note:'Setelah pembelian dan penarikan',icon:Wallet,tone:'violet'},{label:'Total barang',value:String(summary.totalItems),note:'Barang tersimpan di inventaris',icon:Package,tone:'amber'}].map(s=>{const Icon=s.icon;return <article className="glass stat-card" key={s.label}><div className="stat-top"><span>{s.label}</span><div className={'stat-icon '+s.tone}><Icon size={17}/></div></div><strong className="stat-value">{s.value}</strong><div className="stat-note">{s.note}</div></article>})}
        </section>
        <section className="dashboard-grid">
          <article className="glass chart-card"><div className="card-heading"><div><span className="eyebrow">PERFORMA USAHA</span><h2>Arus pendapatan</h2><p>Grafik historis akan diaktifkan setelah riwayat transaksi terperinci terintegrasi.</p></div><select value={period} onChange={e => setPeriod(e.target.value)}>{periods.map(p=><option key={p}>{p}</option>)}</select></div><div className="chart-empty"><div className="chart-placeholder"><ResponsiveContainer width="100%" height="100%"><AreaChart data={[]}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4c9cff" stopOpacity={0.28}/><stop offset="95%" stopColor="#4c9cff" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 6" vertical={false} stroke="var(--line)"/><XAxis dataKey="name" hide/><YAxis hide/><Tooltip/><Area dataKey="value" stroke="#4c9cff" fill="url(#revenueFill)" /></AreaChart></ResponsiveContainer></div><div className="empty-overlay"><div className="empty-icon"><ChartNoAxesCombined size={22}/></div><b>Grafik historis belum tersedia</b><span>Angka ringkasan di atas sudah dihitung dari data akun, bukan data contoh.</span></div></div></article>
          <article className="glass quick-card"><div className="card-heading"><div><span className="eyebrow">AKSES CEPAT</span><h2>Mulai aktivitas</h2></div><Command size={17} className="muted"/></div><div className="quick-list">{[{label:'Penjualan baru',desc:'Catat transaksi pelanggan',icon:ShoppingBag,action:'Kasir'},{label:'Tambah barang',desc:'Kelola produk dan stok',icon:Package,action:'Barang'},{label:'Catat pembelian',desc:'Barang masuk dan modal',icon:CreditCard,action:'Pembelian'},{label:'Lihat laporan',desc:'Pantau laba dan arus kas',icon:ChartNoAxesCombined,action:'Laporan'}].map(q=>{const Icon=q.icon;return <button className="quick-item" key={q.label} onClick={()=>setActive(q.action)}><div className="quick-icon"><Icon size={18}/></div><div><b>{q.label}</b><span>{q.desc}</span></div><ArrowUpRight size={16}/></button>})}</div></article>
        </section>
        <section className="bottom-grid"><article className="glass bottom-card"><div className="card-heading"><div><span className="eyebrow">RINGKASAN INVENTARIS</span><h2>Barang terbaru</h2></div><button className="text-button" onClick={()=>setActive('Barang')}>Lihat barang <ArrowUpRight size={14}/></button></div>{items.slice(0,4).length?items.slice(0,4).map(item=><div className="empty-row" key={item.id}><div className="empty-icon"><Package size={19}/></div><div><b>{item.namaBarang}</b><span>{item.jumlahBarangDijualSatuan} terjual dari {item.jumlahBarangWadah} {item.satuanUnit}</span></div><strong>{money(item.hargaJualSatuan*item.jumlahBarangDijualSatuan)}</strong></div>):<div className="empty-row"><div className="empty-icon"><ArrowDownLeft size={19}/></div><div><b>Belum ada barang</b><span>Barang yang sudah tersimpan akan tampil di sini.</span></div></div>}</article><article className="glass bottom-card balance-card"><div className="card-heading"><div><span className="eyebrow">RINGKASAN KAS</span><h2>Posisi keuangan</h2></div><Wallet size={18} className="muted"/></div><div className="balance-total">{money(summary.saldoKasSaatIni)}</div><span className="balance-caption">Saldo kas tercatat</span><div className="balance-line"><span><i className="dot in"/> Pemasukan</span><b>{money(summary.totalPemasukanJual)}</b></div><div className="balance-line"><span><i className="dot out"/> Pembelian + penarikan</span><b>{money(summary.totalPengeluaranBeli+summary.totalPenarikanKas)}</b></div><div className="balance-line"><span>Nilai stok tersisa</span><b>{money(summary.totalNilaiSisaStok)}</b></div></article></section>
        </>}
        {active === 'Kasir' && <CashierModule userId={user.id} items={items} onChanged={setItems} />}
        {active === 'Barang' && <InventoryModule userId={user.id} items={items} onChanged={setItems} />}
        {active === 'Laporan' && <ReportsModule summary={summary} items={items} withdrawals={withdrawals} />}
        {active === 'Penarikan' && <WithdrawalModule userId={user.id} withdrawals={withdrawals} balance={summary.saldoKasSaatIni} onChanged={setWithdrawals} />}
        {active === 'Catatan' && <NotesModule userId={user.id} />}
        {active === 'Pembelian' && <PurchasesModule items={items} onAddPurchase={() => setActive('Barang')} />}
        <footer>WiseProfit Next <span>•</span> Data tersinkron untuk {user.email}</footer>
      </div>
    </main>
  </div>
}
