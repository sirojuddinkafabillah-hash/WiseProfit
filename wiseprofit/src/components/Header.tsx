import React, { useEffect, useState } from 'react';
import {
  ShoppingBag, TrendingUp, UploadCloud, CircleHelp, ShieldCheck,
  ArrowDownCircle, NotebookPen, LogIn, Plus, Printer, Download, Menu,
  Wallet, Package, FileSpreadsheet, X
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [appearance, setAppearance] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('cirrel_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch { return 'dark'; }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = appearance;
    try { localStorage.setItem('cirrel_theme', appearance); } catch { /* optional preference */ }
  }, [appearance]);

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
    { label: language === 'id' ? 'OPERASIONAL' : 'OPERATIONS', items: [
      { page: 'inventory', label: language === 'id' ? 'Kasir & Barang' : 'Cashier & Inventory', icon: ShoppingBag, count: itemsCount },
    ]},
    { label: language === 'id' ? 'KEUANGAN' : 'FINANCE', items: [
      { page: 'reports', label: t('header.businessReports', language), icon: TrendingUp },
      { page: 'withdrawals', label: t('header.withdrawals', language), icon: ArrowDownCircle, count: withdrawalsCount },
    ]},
    { label: language === 'id' ? 'RUANG KERJA' : 'WORKSPACE', items: [
      { page: 'notes', label: language === 'id' ? 'Catatan' : 'Notes', icon: NotebookPen },
      { page: 'import', label: t('header.importExport', language), icon: FileSpreadsheet },
    ]},
    { label: language === 'id' ? 'BANTUAN' : 'SUPPORT', items: [
      { page: 'faq', label: language === 'id' ? 'Pusat Bantuan' : 'Help center', icon: CircleHelp },
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
    inventory: language === 'id' ? 'Kasir & Barang' : 'Cashier & Inventory',
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
        className={'cirrel-sidebar no-print' + (mobileOpen ? ' is-open' : '')}>
        <div className="cirrel-brand">
          <span className="cirrel-brand-mark" aria-hidden="true">✳</span>
          <span className="cirrel-brand-copy">WiseProfit<small>BUSINESS WORKSPACE</small></span>
        </div>

        <nav className="cirrel-nav">
          {groups.map(group => (
            <section className="cirrel-nav-group" key={group.label}>
              <div className="cirrel-nav-label">{group.label}</div>
              {group.items.map(({ page, label, icon: Icon, count }) => (
                <button key={page} type="button" onClick={() => navigate(page)}
                  aria-current={isActive(page) ? 'page' : undefined}
                  className={'cirrel-nav-item' + (isActive(page) ? ' active' : '')}>
                  <Icon size={18} strokeWidth={1.8}/>
                  <span className="cirrel-nav-text">{label}</span>
                  {typeof count === 'number' && count > 0 && <span className="cirrel-nav-count">{count}</span>}
                </button>
              ))}
            </section>
          ))}
        </nav>

        <div className="cirrel-side-bottom">
          <button type="button" className="cirrel-topbar-btn" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 8 }}
            onClick={() => setAppearance(value => value === 'dark' ? 'light' : 'dark')}>
            <Wallet size={16}/>{language === 'id' ? 'Ganti tampilan' : 'Toggle appearance'}
          </button>
          {user ? (
            <button type="button" className="cirrel-profile" onClick={onOpenProfilePanel}
              title={language === 'id' ? 'Profil dan pengaturan' : 'Profile and settings'}>
              <span className="cirrel-avatar">
                {profilePhoto && !profilePhotoFailed ? (
                  <img src={profilePhoto} alt="" onLoad={() => setProfilePhotoFailed(false)}
                    onError={() => { if (user.photoURL && profilePhoto !== user.photoURL) { setProfilePhoto(user.photoURL); setProfilePhotoFailed(false); } else setProfilePhotoFailed(true); }}/>
                ) : <span>{(user.displayName || user.email || 'W').trim().charAt(0).toUpperCase() || 'W'}</span>}
                <i>on</i>
              </span>
              <span className="cirrel-profile-copy">
                <strong>{user.displayName || (language === 'id' ? 'Profil Saya' : 'My profile')}</strong>
                <small>{user.email || (language === 'id' ? 'Akun WiseProfit' : 'WiseProfit account')}</small>
              </span>
            </button>
          ) : (
            <button type="button" className="cirrel-profile" onClick={onOpenAuthModal}>
              <span className="cirrel-avatar">W</span>
              <span className="cirrel-profile-copy"><strong>{language === 'id' ? 'Masuk akun' : 'Sign in'}</strong><small>WiseProfit</small></span>
            </button>
          )}
          <button type="button" className="cirrel-admin" onClick={() => user ? navigate('support-admin') : onOpenAuthModal()}
            title={language === 'id' ? 'Login Admin' : 'Admin Login'}>
            <ShieldCheck size={16}/><span>Admin Login</span>
          </button>
        </div>
      </aside>

      {mobileOpen && <button type="button" className="cirrel-sidebar-backdrop no-print" aria-label={language === 'id' ? 'Tutup menu' : 'Close menu'} onClick={() => setMobileOpen(false)}/>}

      <header className="cirrel-topbar no-print">
        <button type="button" className="cirrel-topbar-btn cirrel-mobile-menu" onClick={() => setMobileOpen(true)}
          aria-label={language === 'id' ? 'Buka menu' : 'Open menu'}><Menu size={18}/></button>
        <div className="cirrel-topbar-title">
          {pageTitle[activePage] || 'WiseProfit'}
          <small>{language === 'id' ? 'Kelola usaha, pantau perkembangan, dan ambil keputusan.' : 'Manage your business, track progress, and make decisions.'}</small>
        </div>
        <div className="cirrel-topbar-spacer"/>
        <span className="cirrel-online"><i/>{isSyncingCloud ? (language === 'id' ? 'Menyinkronkan' : 'Syncing') : 'Online'}</span>
        <div className="cirrel-language" role="group" aria-label={t('header.chooseLanguage', language)}>
          <button type="button" onClick={() => onLanguageChange('id')} aria-pressed={language === 'id'} title="Bahasa Indonesia" className={language === 'id' ? 'active' : ''}><img src="https://flagcdn.com/w40/id.png" alt="ID"/></button>
          <button type="button" onClick={() => onLanguageChange('en')} aria-pressed={language === 'en'} title="English" className={language === 'en' ? 'active' : ''}><img src="https://flagcdn.com/w40/gb.png" alt="EN"/></button>
        </div>
        {user && <button type="button" className="cirrel-topbar-btn" onClick={onOpenGuide} title={language === 'id' ? 'Panduan kas' : 'Cash guide'}><CircleHelp size={16}/><span className="cirrel-action-label">{language === 'id' ? 'Panduan' : 'Guide'}</span></button>}
        {user && <button type="button" className="cirrel-topbar-btn" onClick={onOpenDownloadModal} title={language === 'id' ? 'Ekspor / impor data' : 'Export / import data'}><Download size={16}/><span className="cirrel-action-label">{language === 'id' ? 'Data' : 'Data'}</span></button>}
        {user && activePage === 'reports' && <button type="button" className="cirrel-topbar-btn" onClick={onPrintReport} title={language === 'id' ? 'Cetak laporan' : 'Print report'}><Printer size={16}/><span className="cirrel-action-label">{language === 'id' ? 'Cetak' : 'Print'}</span></button>}
        {user && <button type="button" className="cirrel-topbar-btn primary" onClick={activePage === 'withdrawals' ? (onOpenWithdrawalModal || (() => navigate('withdrawals'))) : onOpenAddModal}><Plus size={16}/><span className="cirrel-action-label">{activePage === 'withdrawals' ? (language === 'id' ? 'Tarik kas' : 'Withdraw') : (language === 'id' ? 'Tambah barang' : 'Add item')}</span></button>}
        {!user && <button type="button" className="cirrel-topbar-btn primary" onClick={onOpenAuthModal}><LogIn size={16}/><span>{t('header.signIn', language)}</span></button>}
      </header>
    </>
  );
};
