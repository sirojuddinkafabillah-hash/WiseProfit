import React, { useEffect, useState } from 'react';
import {
  Menu, X, Plus, Cloud, CheckCircle2, ShoppingBag, TrendingUp,
  UploadCloud, CircleHelp, ShieldCheck, ArrowDownCircle, UserRound,
  Wallet, ChevronRight, Settings, LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n/translations';

export type AppPage = 'home' | 'inventory' | 'reports' | 'withdrawals' | 'import' | 'faq' | 'complaints' | 'support-admin';

interface HeaderProps {
  activePage: AppPage;
  onChangePage: (page: AppPage) => void;
  itemsCount?: number;
  onOpenAddModal: () => void;
  onPrintReport: () => void;
  onOpenGuide: () => void;
  onOpenDownloadModal: () => void;
  onOpenAuthModal: () => void;
  onOpenWithdrawalModal?: () => void;
  withdrawalsCount?: number;
  isSyncingCloud?: boolean;
  language: 'id' | 'en';
  onLanguageChange: (language: 'id' | 'en') => void;
}

type NavigationItem = {
  page: AppPage;
  label: string;
  icon: React.ElementType;
  count?: number;
};

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onChangePage,
  itemsCount = 0,
  onOpenAddModal,
  onOpenAuthModal,
  withdrawalsCount = 0,
  isSyncingCloud = false,
  language,
  onLanguageChange,
}) => {
  const { user } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadProfilePhoto = () => {
      try {
        setProfilePhoto(user ? localStorage.getItem(`wp_profile_photo_${user.uid}`) : null);
      } catch {
        setProfilePhoto(null);
      }
    };
    loadProfilePhoto();
    window.addEventListener('storage', loadProfilePhoto);
    window.addEventListener('wiseprofit-profile-photo-updated', loadProfilePhoto);
    return () => {
      window.removeEventListener('storage', loadProfilePhoto);
      window.removeEventListener('wiseprofit-profile-photo-updated', loadProfilePhoto);
    };
  }, [user?.uid, user?.photoURL]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [activePage]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [sidebarOpen]);

  const navigationItems: NavigationItem[] = [
    { page: 'inventory', label: t('header.cashier', language), icon: ShoppingBag, count: itemsCount },
    { page: 'reports', label: t('header.businessReports', language), icon: TrendingUp },
    { page: 'withdrawals', label: t('header.withdrawals', language), icon: ArrowDownCircle, count: withdrawalsCount },
    { page: 'import', label: t('header.importExport', language), icon: UploadCloud },
    { page: 'faq', label: language === 'id' ? 'Bantuan' : 'Help', icon: CircleHelp },
    { page: 'home', label: language === 'id' ? 'Profil & Pengaturan' : 'Profile & Settings', icon: Settings },
  ];

  const navigate = (page: AppPage) => {
    onChangePage(page);
    setSidebarOpen(false);
  };

  const isActive = (page: AppPage) => page === 'faq'
    ? activePage === 'faq' || activePage === 'complaints'
    : activePage === page || (page === 'inventory' && activePage === 'home');

  return (
    <>
      <header className="wp-app-header no-print sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 text-slate-800 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-[4.25rem] max-w-[1600px] items-center gap-3 px-3 sm:px-5 lg:px-7">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            aria-label={sidebarOpen ? (language === 'id' ? 'Tutup menu' : 'Close menu') : (language === 'id' ? 'Buka menu' : 'Open menu')}
            aria-expanded={sidebarOpen}
            aria-controls="wp-main-sidebar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={() => navigate('inventory')}
            aria-label="WiseProfit - Kasir"
            className="flex shrink-0 items-center gap-2 rounded-lg text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-sm shadow-blue-600/20">
              <Wallet className="h-5 w-5" />
            </span>
            <span className="text-[19px] font-extrabold tracking-tight text-slate-900 sm:text-[21px]">
              Wise<span className="text-blue-600">Profit</span>
            </span>
          </button>

          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm" role="group" aria-label={t('header.chooseLanguage', language)}>
              <span className="hidden px-1 text-[11px] font-medium text-slate-500 sm:inline">{t('language.label', language)}</span>
              <div className="relative flex items-center rounded-full bg-slate-100 p-0.5">
                <span aria-hidden="true" className={`absolute inset-y-0.5 w-[32px] rounded-full bg-blue-600 shadow-sm transition-transform duration-200 ${language === 'en' ? 'translate-x-[32px]' : 'translate-x-0'}`} />
                <button type="button" onClick={() => onLanguageChange('id')} aria-pressed={language === 'id'} className={`relative z-10 w-8 rounded-full py-1 text-[10px] font-bold transition-colors ${language === 'id' ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}>ID</button>
                <button type="button" onClick={() => onLanguageChange('en')} aria-pressed={language === 'en'} className={`relative z-10 w-8 rounded-full py-1 text-[10px] font-bold transition-colors ${language === 'en' ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}>EN</button>
              </div>
            </div>

            {user ? (
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1.5 pr-2.5 sm:flex">
                <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                  {profilePhoto ? <img src={profilePhoto} alt={t('header.avatar', language)} className="h-full w-full object-cover" /> : user.photoURL ? <img src={user.photoURL} alt={t('header.avatar', language)} className="h-full w-full object-cover" /> : <UserRound className="h-4 w-4 text-slate-500" />}
                </span>
                <span className="hidden max-w-[130px] truncate text-[11px] font-medium text-slate-600 lg:inline">{user.email || user.displayName || t('header.account', language)}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${isSyncingCloud ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isSyncingCloud ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  {isSyncingCloud ? t('header.syncing', language) : t('header.online', language)}
                </span>
              </div>
            ) : (
              <button type="button" onClick={onOpenAuthModal} className="hidden items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 sm:inline-flex">
                <LogIn className="h-3.5 w-3.5" />
                {t('header.signIn', language)}
              </button>
            )}

            <button type="button" onClick={onOpenAddModal} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('header.add', language)}</span>
            </button>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <button
          type="button"
          aria-label={language === 'id' ? 'Tutup menu navigasi' : 'Close navigation menu'}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-slate-950/30 backdrop-blur-[1px]"
        />
      )}

      <aside
        id="wp-main-sidebar"
        aria-label={language === 'id' ? 'Navigasi utama' : 'Main navigation'}
        aria-hidden={!sidebarOpen}
        className={`no-print fixed bottom-0 left-0 top-[4.25rem] z-50 flex w-[min(84vw,270px)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="border-b border-slate-100 px-4 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{language === 'id' ? 'Menu utama' : 'Main menu'}</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{language === 'id' ? 'Kelola usaha Anda' : 'Manage your business'}</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {navigationItems.map(({ page, label, icon: Icon, count }) => (
            <button
              key={page}
              type="button"
              onClick={() => navigate(page)}
              aria-current={isActive(page) ? 'page' : undefined}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${isActive(page) ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive(page) ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
              <span className="flex-1">{label}</span>
              {typeof count === 'number' && count > 0 && <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isActive(page) ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>{count}</span>}
              {isActive(page) && <ChevronRight className="h-4 w-4 text-blue-500" />}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={() => { setSidebarOpen(false); user ? onChangePage('support-admin') : onOpenAuthModal(); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ShieldCheck className="h-[18px] w-[18px] text-slate-500" />
            <span className="flex-1">{language === 'id' ? 'Login Admin' : 'Admin Login'}</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
          <div className="px-3 pb-2 pt-1 text-[10px] text-slate-400">WiseProfit · {language === 'id' ? 'Pengelolaan Usaha' : 'Business Management'}</div>
        </div>
      </aside>
    </>
  );
};
