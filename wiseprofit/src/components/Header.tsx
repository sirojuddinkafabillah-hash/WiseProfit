import React, { useEffect, useState } from 'react';
import {
  ShoppingBag, TrendingUp, UploadCloud, CircleHelp, ShieldCheck, ArrowDownCircle,
  UserRound, Search, Bell, CalendarDays, Calculator, Settings, X, Plus, Minus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n/translations';

export type AppPage = 'home' | 'inventory' | 'reports' | 'withdrawals' | 'import' | 'faq' | 'complaints' | 'support-admin';
interface HeaderProps {
  activePage: AppPage; onChangePage: (page: AppPage) => void; itemsCount?: number;
  onOpenAddModal: () => void; onPrintReport: () => void; onOpenGuide: () => void;
  onOpenDownloadModal: () => void; onOpenAuthModal: () => void; onOpenProfilePanel: () => void;
  onOpenWithdrawalModal?: () => void; withdrawalsCount?: number; isSyncingCloud?: boolean;
  language: 'id' | 'en'; onLanguageChange: (language: 'id' | 'en') => void;
}
type ToolPanel = 'notifications' | 'calendar' | 'calculator' | null;

export const Header: React.FC<HeaderProps> = ({
  activePage, onChangePage, itemsCount = 0, onOpenAddModal, onOpenGuide,
  onOpenDownloadModal, onOpenAuthModal, onOpenProfilePanel, onOpenWithdrawalModal,
  withdrawalsCount = 0, isSyncingCloud = false, language, onLanguageChange,
}) => {
  const { user, isOnline } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [toolPanel, setToolPanel] = useState<ToolPanel>(null);
  const [leftValue, setLeftValue] = useState('0');
  const [rightValue, setRightValue] = useState('0');
  const [operator, setOperator] = useState('+');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const load = () => { try { setProfilePhoto(user ? localStorage.getItem(`wp_profile_photo_${user.uid}`) : null); } catch { setProfilePhoto(null); } };
    load(); window.addEventListener('storage', load); window.addEventListener('wiseprofit-profile-photo-updated', load);
    return () => { window.removeEventListener('storage', load); window.removeEventListener('wiseprofit-profile-photo-updated', load); };
  }, [user?.uid, user?.photoURL]);
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 30000); return () => window.clearInterval(timer); }, []);

  const navigationItems = [
    { page: 'inventory' as AppPage, label: t('header.cashier', language), icon: ShoppingBag },
    { page: 'reports' as AppPage, label: t('header.businessReports', language), icon: TrendingUp },
    { page: 'withdrawals' as AppPage, label: t('header.withdrawals', language), icon: ArrowDownCircle },
    { page: 'import' as AppPage, label: t('header.importExport', language), icon: UploadCloud },
    { page: 'faq' as AppPage, label: language === 'id' ? 'Bantuan' : 'Help', icon: CircleHelp },
  ];
  const isActive = (page: AppPage) => page === 'faq' ? activePage === 'faq' || activePage === 'complaints' : activePage === page;
  const dateText = new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(now);
  const result = (() => { const a=Number(leftValue)||0, b=Number(rightValue)||0; return operator==='+'?a+b:operator==='−'?a-b:operator==='×'?a*b:b===0?'—':a/b; })();

  const openSearch = () => {
    onChangePage('inventory');
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('wp-focus-inventory-search')), 80);
  };
  const toolButton = (label:string, icon:React.ElementType, action:()=>void, active=false, badge?:number) => {
    const Icon=icon;
    return <button type="button" onClick={action} title={label} aria-label={label} className={`wp-right-tool group relative flex w-full flex-col items-center justify-center gap-1 rounded-2xl px-1 py-3 text-[10px] font-semibold transition-all ${active?'bg-blue-50 text-blue-700 ring-1 ring-blue-100':'text-[#18345F] hover:bg-white hover:text-blue-700 hover:shadow-md'}`}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-sm ring-1 ring-blue-100 group-hover:bg-blue-50"><Icon className="h-5 w-5"/></span>
      <span>{label}</span>
      {badge && badge>0 ? <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] text-white">{badge}</span>:null}
    </button>;
  };

  return <>
    <header className="wp-reference-topbar no-print fixed left-[84px] right-[76px] top-0 z-40 flex h-[72px] items-center gap-4 border-b border-white/70 px-5 sm:px-7">
      <div className="flex min-w-0 flex-1 items-center">
        <div className="wp-global-search flex h-12 w-full max-w-[670px] items-center gap-3 rounded-full border border-blue-100/90 bg-white/75 px-5 shadow-[0_5px_18px_rgba(37,99,235,.08)] backdrop-blur-xl">
          <Search className="h-5 w-5 shrink-0 text-[#5473A6]"/>
          <input aria-label={language==='id'?'Cari barang, kode, atau nama':'Search item, code, or name'} onKeyDown={e=>{if(e.key==='Enter')openSearch();}} placeholder={language==='id'?'Cari barang, kode, atau nama...':'Search items, code, or name...'} className="w-full bg-transparent text-sm text-[#18345F] outline-none placeholder:text-[#6B82A8]" onFocus={()=>{}}/>
        </div>
      </div>
      <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/90 px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm sm:flex">
        <span className={`h-2.5 w-2.5 rounded-full ${isOnline?'bg-emerald-500':'bg-amber-500'}`}/>{isOnline?'Online':'Offline'}
      </div>
      <div className="flex items-center rounded-full border border-blue-100 bg-white/80 p-1 shadow-sm backdrop-blur">
        <button type="button" onClick={()=>onLanguageChange('id')} title="Bahasa Indonesia" aria-pressed={language==='id'} className={`rounded-full p-1.5 ${language==='id'?'bg-blue-50 ring-1 ring-blue-200':''}`}><img src="https://flagcdn.com/w40/id.png" alt="Indonesia" className="h-5 w-7 rounded-sm object-cover"/></button>
        <button type="button" onClick={()=>onLanguageChange('en')} title="English" aria-pressed={language==='en'} className={`rounded-full p-1.5 ${language==='en'?'bg-blue-50 ring-1 ring-blue-200':''}`}><img src="https://flagcdn.com/w40/gb.png" alt="English" className="h-5 w-7 rounded-sm object-cover"/></button>
      </div>
    </header>

    <aside className="wp-reference-sidebar no-print fixed bottom-0 left-0 top-0 z-50 flex w-[84px] flex-col items-center border-r border-white/80 px-2 pb-4 pt-4">
      <button type="button" onClick={()=>onChangePage('inventory')} title="WiseProfit" aria-label="WiseProfit - Kasir" className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_7px_20px_rgba(37,99,235,.28)]">
        <svg viewBox="0 0 64 64" className="h-9 w-9" fill="none" aria-hidden="true"><path d="M32 5 54 17.5 32 30 10 17.5 32 5Z" fill="#60A5FA" stroke="white" strokeWidth="2"/><path d="M10 17.5 32 30v27L10 44.5v-27Z" fill="#3B82F6" stroke="white" strokeWidth="2"/><path d="M54 17.5 32 30v27l22-12.5v-27Z" fill="#1D4ED8" stroke="white" strokeWidth="2"/><path d="m18 21.5 14 8 14-8M18 28l8 4.5v8l-8-4.5v-8Z" stroke="white" strokeWidth="2.4"/><path d="m32 34 14-8v8l-14 8v-8Z" fill="#DBEAFE" stroke="white" strokeWidth="2"/></svg>
      </button>
      {user && <button type="button" onClick={onOpenProfilePanel} title={user.displayName || 'Profil'} aria-label="Profil" className="relative mb-6 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-md ring-2 ring-blue-100">{profilePhoto?<img src={profilePhoto} alt="" className="h-full w-full object-cover"/>:user.photoURL?<img src={user.photoURL} alt="" className="h-full w-full object-cover"/>:<UserRound className="h-5 w-5 text-blue-700"/>}<span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"/></button>}
      <nav className="flex w-full flex-1 flex-col items-center gap-3">
        {navigationItems.map(({page,label,icon:Icon})=><button key={page} type="button" onClick={()=>onChangePage(page)} title={label} aria-label={label} aria-current={isActive(page)?'page':undefined} className={`group flex h-12 w-12 items-center justify-center rounded-2xl transition-all ${isActive(page)?'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_7px_18px_rgba(37,99,235,.28)]':'text-[#31527F] hover:bg-white/90 hover:text-blue-700 hover:shadow-sm'}`}><Icon className="h-5 w-5"/></button>)}
      </nav>
      <button type="button" onClick={()=>user?onChangePage('support-admin'):onOpenAuthModal()} title={language==='id'?'Login Admin':'Admin Login'} aria-label="Login Admin" className="mt-3 flex h-11 w-11 items-center justify-center rounded-2xl text-[#31527F] transition hover:bg-white hover:text-blue-700"><ShieldCheck className="h-5 w-5"/></button>
    </aside>

    <aside className="wp-reference-tools no-print fixed bottom-4 right-2 top-[88px] z-40 flex w-[68px] flex-col items-center gap-2 rounded-[24px] border border-white/80 p-2 shadow-[0_12px_34px_rgba(37,99,235,.12)]">
      {toolButton(language==='id'?'Cari':'Search',Search,openSearch)}
      {toolButton(language==='id'?'Notifikasi':'Notifications',Bell,()=>setToolPanel(toolPanel==='notifications'?null:'notifications'),toolPanel==='notifications',withdrawalsCount)}
      {toolButton(language==='id'?'Kalender':'Calendar',CalendarDays,()=>setToolPanel(toolPanel==='calendar'?null:'calendar'),toolPanel==='calendar')}
      {toolButton(language==='id'?'Kalkulator':'Calculator',Calculator,()=>setToolPanel(toolPanel==='calculator'?null:'calculator'),toolPanel==='calculator')}
      {toolButton(language==='id'?'Pengaturan':'Settings',Settings,onOpenProfilePanel)}
      {toolPanel && <div className="absolute right-[76px] top-16 w-64 rounded-2xl border border-blue-100 bg-white/95 p-4 text-[#18345F] shadow-[0_18px_50px_rgba(22,50,100,.18)] backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between"><strong className="text-sm">{toolPanel==='notifications'?(language==='id'?'Notifikasi':'Notifications'):toolPanel==='calendar'?(language==='id'?'Kalender':'Calendar'):(language==='id'?'Kalkulator':'Calculator')}</strong><button type="button" onClick={()=>setToolPanel(null)} aria-label="Tutup" className="rounded-lg p-1 hover:bg-blue-50"><X className="h-4 w-4"/></button></div>
        {toolPanel==='notifications' && <div className="space-y-2 text-xs"><p className="rounded-xl bg-blue-50 p-3">{isSyncingCloud?(language==='id'?'Data sedang disinkronkan.':'Data is syncing.'):isOnline?(language==='id'?'Koneksi penyimpanan online aktif.':'Cloud connection is online.'): (language==='id'?'Koneksi sedang offline.':'Connection is offline.')}</p><p className="text-slate-500">{language==='id'?'Jumlah riwayat penarikan':'Withdrawal records'}: {withdrawalsCount}</p><button type="button" onClick={()=>{setToolPanel(null);onOpenGuide();}} className="font-semibold text-blue-700">{language==='id'?'Buka panduan bantuan':'Open help guide'} →</button></div>}
        {toolPanel==='calendar' && <div className="rounded-xl bg-blue-50 p-3"><p className="text-xs text-slate-500">{language==='id'?'Hari ini':'Today'}</p><p className="mt-1 text-lg font-bold">{dateText}</p><p className="text-sm tabular-nums">{now.toLocaleTimeString(language==='id'?'id-ID':'en-GB',{hour:'2-digit',minute:'2-digit'})}</p></div>}
        {toolPanel==='calculator' && <div className="space-y-2"><input type="number" value={leftValue} onChange={e=>setLeftValue(e.target.value)} className="w-full rounded-lg border border-blue-100 px-3 py-2 text-sm"/><div className="grid grid-cols-4 gap-1">{['+','−','×','÷'].map(op=><button type="button" key={op} onClick={()=>setOperator(op)} className={`rounded-lg py-2 text-sm font-bold ${operator===op?'bg-blue-600 text-white':'bg-blue-50 text-blue-700'}`}>{op}</button>)}</div><input type="number" value={rightValue} onChange={e=>setRightValue(e.target.value)} className="w-full rounded-lg border border-blue-100 px-3 py-2 text-sm"/><div className="rounded-lg bg-blue-50 p-3 text-right text-lg font-bold">{result}</div></div>}
      </div>}
    </aside>
  </>;
};
