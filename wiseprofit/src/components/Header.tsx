import React, { useEffect, useState } from 'react';
import {
  ShoppingBag, TrendingUp, UploadCloud, CircleHelp, ShieldCheck,
  ArrowDownCircle, NotebookPen, LogIn, ChevronLeft, ChevronRight,
  Plus, Printer, Download, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n/translations';
import { getProfilePhotoUrl } from '../services/supabaseSync';

export type AppPage = 'home' | 'inventory' | 'reports' | 'withdrawals' | 'import' | 'notes' | 'faq' | 'complaints' | 'support-admin';

interface HeaderProps {
  activePage: AppPage;
  onChangePage: (page: AppPage) => void;
  itemsCount?: number;
  onOpenAddModal: () => void;
  onPrintReport: () => void;
  onOpenGuide: () => void;
  onOpenDownloadModal: () => void;
  onOpenAuthModal: () => void;
  onOpenProfilePanel: () => void;
  onOpenWithdrawalModal?: () => void;
  withdrawalsCount?: number;
  isSyncingCloud?: boolean;
  language: 'id' | 'en';
  onLanguageChange: (language: 'id' | 'en') => void;
}

type NavItem = { page: AppPage; label: string; icon: React.ElementType; count?: number };

export const Header: React.FC<HeaderProps> = ({
  activePage, onChangePage, itemsCount = 0, onOpenAddModal,
  onPrintReport, onOpenGuide, onOpenDownloadModal, onOpenAuthModal,
  onOpenProfilePanel, onOpenWithdrawalModal, withdrawalsCount = 0,
  isSyncingCloud = false, language, onLanguageChange,
}) => {
  const { user } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhotoFailed, setProfilePhotoFailed] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(() => {
    try { return localStorage.getItem('wp_sidebar_collapsed') !== 'true'; } catch { return true; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('wp-sidebar-collapsed', !sidebarExpanded);
    try { localStorage.setItem('wp_sidebar_collapsed', sidebarExpanded ? 'false' : 'true'); } catch { /* optional preference */ }
    return () => document.documentElement.classList.remove('wp-sidebar-collapsed');
  }, [sidebarExpanded]);

  useEffect(() => {
    let active = true;
    const loadProfilePhoto = async () => {
      try {
        const cloudPhoto = user ? await getProfilePhotoUrl(user.uid) : null;
        if (!active) return;
        const savedPhoto = user ? localStorage.getItem('wp_profile_photo_' + user.uid) : null;
        setProfilePhoto(cloudPhoto || savedPhoto || user?.photoURL || null);
        setProfilePhotoFailed(false);
      } catch {
        if (active) setProfilePhoto(user?.photoURL || null);
      }
    };
    loadProfilePhoto();
    const refresh = (event?: Event) => {
      const isPhotoUpdate = event?.type === 'wiseprofit-profile-photo-updated';
      const detail = (event as CustomEvent<{ url?: string | null }> | undefined)?.detail;
      if (isPhotoUpdate && detail && Object.prototype.hasOwnProperty.call(detail, 'url')) {
        setProfilePhoto(detail.url || user?.photoURL || null);
        setProfilePhotoFailed(false);
        return;
      }
      void loadProfilePhoto();
    };
    window.addEventListener('storage', refresh);
    window.addEventListener('wiseprofit-profile-photo-updated', refresh);
    return () => {
      active = false;
      window.removeEventListener('storage', refresh);
      window.removeEventListener('wiseprofit-profile-photo-updated', refresh);
    };
  }, [user?.uid, user?.photoURL]);

  useEffect(() => {
    if (!mobileOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [mobileOpen]);

  const groups: { label: string; items: NavItem[] }[] = [
    { label: language === 'id' ? 'RUANG KERJA' : 'WORKSPACE', items: [
      { page: 'inventory', label: t('header.cashier', language), icon: ShoppingBag, count: itemsCount },
    ]},
    { label: language === 'id' ? 'KEUANGAN' : 'FINANCE', items: [
      { page: 'reports', label: t('header.businessReports', language), icon: TrendingUp },
      { page: 'withdrawals', label: t('header.withdrawals', language), icon: ArrowDownCircle, count: withdrawalsCount },
    ]},
    { label: language === 'id' ? 'CATATAN' : 'NOTES', items: [
      { page: 'notes', label: language === 'id' ? 'Catatan' : 'Notes', icon: NotebookPen },
    ]},
    { label: language === 'id' ? 'LAINNYA' : 'MORE', items: [
      { page: 'import', label: t('header.importExport', language), icon: UploadCloud },
      { page: 'faq', label: language === 'id' ? 'Bantuan' : 'Help center', icon: CircleHelp },
    ]},
  ];

  const navigate = (page: AppPage) => {
    onChangePage(page);
    setMobileOpen(false);
  };
  const isActive = (page: AppPage) => page === 'faq'
    ? activePage === 'faq' || activePage === 'complaints'
    : activePage === page;
  const pageTitle: Record<string, string> = {
    inventory: t('header.cashier', language),
    reports: t('header.businessReports', language),
    withdrawals: t('header.withdrawals', language),
    notes: language === 'id' ? 'Catatan' : 'Notes',
    import: t('header.importExport', language),
    faq: language === 'id' ? 'Pusat Bantuan' : 'Help center',
    'support-admin': language === 'id' ? 'Admin Support' : 'Admin support',
  };

  return (
    <>
      <aside id="wp-main-sidebar" aria-label={language === 'id' ? 'Navigasi utama' : 'Main navigation'}
        className={'wp-main-sidebar no-print' + (sidebarExpanded ? '' : ' is-collapsed') + (mobileOpen ? ' is-mobile-open' : '')}>
        <div className="wp-sidebar-brand">
          <button type="button" onClick={() => navigate('inventory')} className="wp-brand-link" aria-label="WiseProfit - Kasir">
            <span className="wp-brand-mark" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="wp-cube-top" x1="13" y1="8" x2="48" y2="30" gradientUnits="userSpaceOnUse"><stop stopColor="#60A5FA"/><stop offset="1" stopColor="#2563EB"/></linearGradient>
                  <linearGradient id="wp-cube-side" x1="33" y1="23" x2="53" y2="48" gradientUnits="userSpaceOnUse"><stop stopColor="#2563EB"/><stop offset="1" stopColor="#1D4ED8"/></linearGradient>
                </defs>
                <path d="M32 5 54 17.5 32 30 10 17.5 32 5Z" fill="url(#wp-cube-top)" stroke="#1D4ED8" strokeWidth="2"/>
                <path d="M10 17.5 32 30v27L10 44.5v-27Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M54 17.5 32 30v27l22-12.5v-27Z" fill="url(#wp-cube-side)" stroke="#1D4ED8" strokeWidth="2" strokeLinejoin="round"/>
                <path d="m18 21.5 14 8 14-8M18 28l8 4.5v8l-8-4.5v-8Z" stroke="white" strokeWidth="2.4" strokeLinejoin="round"/>
                <path d="m32 34 14-8v8l-14 8v-8Z" fill="#DBEAFE" stroke="white" strokeWidth="2"/>
                <path d="m27 43 5 3 5-3v7l-5 3-5-3v-7Z" fill="#BFDBFE" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="wp-brand-copy"><strong><span>Wise</span><em>Profit</em></strong><small>BUSINESS MANAGEMENT</small></span>
          </button>
          <button type="button" className="wp-sidebar-collapse" onClick={() => setSidebarExpanded(v => !v)}
            aria-label={sidebarExpanded ? (language === 'id' ? 'Ciutkan menu' : 'Collapse menu') : (language === 'id' ? 'Perluas menu' : 'Expand menu')}
            title={sidebarExpanded ? (language === 'id' ? 'Ciutkan menu' : 'Collapse menu') : (language === 'id' ? 'Perluas menu' : 'Expand menu')}>
            {sidebarExpanded ? <ChevronLeft size={17}/> : <ChevronRight size={17}/>}
          </button>
        </div>

        <nav className="wp-sidebar-nav">
          {groups.map(group => (
            <section className="wp-nav-group" key={group.label}>
              <div className="wp-nav-label">{group.label}</div>
              {group.items.map(({ page, label, icon: Icon, count }) => (
                <button key={page} type="button" onClick={() => navigate(page)} aria-current={isActive(page) ? 'page' : undefined}
                  title={!sidebarExpanded ? label : undefined}
                  className={'wp-nav-item' + (isActive(page) ? ' active' : '')}>
                  <Icon size={18} strokeWidth={1.8}/>
                  <span className="wp-nav-text">{label}</span>
                  {typeof count === 'number' && count > 0 && <span className="wp-nav-count">{count}</span>}
                </button>
              ))}
            </section>
          ))}
        </nav>

        <div className="wp-sidebar-bottom">
          {user ? (
            <button type="button" className="wp-profile-button" onClick={onOpenProfilePanel}
              title={language === 'id' ? 'Profil dan pengaturan' : 'Profile and settings'}>
              <span className="wp-profile-avatar">
                {profilePhoto && !profilePhotoFailed ? (
                  <img src={profilePhoto} alt="" onLoad={() => setProfilePhotoFailed(false)}
                    onError={() => { if (user.photoURL && profilePhoto !== user.photoURL) { setProfilePhoto(user.photoURL); setProfilePhotoFailed(false); } else setProfilePhotoFailed(true); }}/>
                ) : <span>{(user.displayName || user.email || 'W').trim().charAt(0).toUpperCase() || 'W'}</span>}
                <i>on</i>
              </span>
              <span className="wp-profile-copy"><strong>{user.displayName || (language === 'id' ? 'Profil Saya' : 'My profile')}</strong><small>{user.email || (language === 'id' ? 'Akun WiseProfit' : 'WiseProfit account')}</small></span>
            </button>
          ) : (
            <button type="button" className="wp-profile-button" onClick={onOpenAuthModal}>
              <span className="wp-profile-avatar"><span>W</span></span>
              <span className="wp-profile-copy"><strong>{language === 'id' ? 'Masuk akun' : 'Sign in'}</strong><small>WiseProfit</small></span>
            </button>
          )}
          <button type="button" className="wp-admin-button" onClick={() => user ? navigate('support-admin') : onOpenAuthModal()}
            title={language === 'id' ? 'Login Admin' : 'Admin Login'}>
            <ShieldCheck size={17}/><span>{language === 'id' ? 'Admin Login' : 'Admin Login'}</span>
          </button>
        </div>
      </aside>

      {mobileOpen && <button type="button" className="wp-sidebar-backdrop no-print" aria-label={language === 'id' ? 'Tutup menu' : 'Close menu'} onClick={() => setMobileOpen(false)}/>}

      <header className="wp-app-header no-print">
        <div className="wp-topbar-left">
          <button type="button" className="wp-mobile-menu" onClick={() => setMobileOpen(true)} aria-label={language === 'id' ? 'Buka menu' : 'Open menu'}><Menu size={19}/></button>
          <div><strong>{pageTitle[activePage] || 'WiseProfit'}</strong><small>{language === 'id' ? 'Kelola usaha, pantau perkembangan, dan ambil keputusan.' : 'Manage your business, track progress, and make decisions.'}</small></div>
        </div>
        <div className="wp-topbar-actions">
          <span className={'wp-sync-status' + (isSyncingCloud ? ' syncing' : '')}><i/>{isSyncingCloud ? (language === 'id' ? 'Menyinkronkan' : 'Syncing') : (language === 'id' ? 'Online' : 'Online')}</span>
          <div className="wp-language-switch" role="group" aria-label={t('header.chooseLanguage', language)}>
            <button type="button" onClick={() => onLanguageChange('id')} aria-pressed={language === 'id'} title="Bahasa Indonesia" className={language === 'id' ? 'active' : ''}><img src="https://flagcdn.com/w40/id.png" alt="ID"/></button>
            <button type="button" onClick={() => onLanguageChange('en')} aria-pressed={language === 'en'} title="English" className={language === 'en' ? 'active' : ''}><img src="https://flagcdn.com/w40/gb.png" alt="EN"/></button>
          </div>
          {user && <button type="button" className="wp-topbar-icon" onClick={onOpenGuide} title={language === 'id' ? 'Panduan kas' : 'Cash guide'}><CircleHelp size={17}/></button>}
          {user && <button type="button" className="wp-topbar-icon" onClick={onOpenDownloadModal} title={language === 'id' ? 'Ekspor / impor data' : 'Export / import data'}><Download size={17}/></button>}
          {user && activePage === 'reports' && <button type="button" className="wp-topbar-icon" onClick={onPrintReport} title={language === 'id' ? 'Cetak laporan' : 'Print report'}><Printer size={17}/></button>}
          {user && <button type="button" className="wp-topbar-primary" onClick={activePage === 'withdrawals' ? (onOpenWithdrawalModal || (() => navigate('withdrawals'))) : onOpenAddModal}><Plus size={17}/><span>{activePage === 'withdrawals' ? (language === 'id' ? 'Tarik kas' : 'Withdraw') : (language === 'id' ? 'Tambah barang' : 'Add item')}</span></button>}
          {!user && <button type="button" className="wp-topbar-primary" onClick={onOpenAuthModal}><LogIn size={16}/><span>{t('header.signIn', language)}</span></button>}
        </div>
      </header>
    </>
  );
};
