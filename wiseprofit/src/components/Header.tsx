import React, { useEffect, useState } from 'react';
import {
  Menu, X, ShoppingBag, TrendingUp,
  UploadCloud, CircleHelp, ShieldCheck, ArrowDownCircle, UserRound,
  ChevronRight, Settings, LogIn
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
  onOpenProfilePanel: () => void;
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
  onOpenAuthModal,
  onOpenProfilePanel,
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
    : activePage === page;

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
            className="flex shrink-0 items-center gap-2.5 rounded-lg text-left"
          >
            <span className="relative flex h-12 w-12 items-center justify-center rounded-[15px] border-[3px] border-blue-100 bg-blue-50 shadow-[0_5px_16px_rgba(37,99,235,0.16)] sm:h-14 sm:w-14">
              <svg viewBox="0 0 64 64" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="wp-cube-top" x1="13" y1="8" x2="48" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60A5FA"/><stop offset="1" stopColor="#2563EB"/>
                  </linearGradient>
                  <linearGradient id="wp-cube-side" x1="33" y1="23" x2="53" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563EB"/><stop offset="1" stopColor="#1D4ED8"/>
                  </linearGradient>
                </defs>
                <path d="M32 5 54 17.5 32 30 10 17.5 32 5Z" fill="url(#wp-cube-top)" stroke="#1D4ED8" strokeWidth="2"/>
                <path d="M10 17.5 32 30v27L10 44.5v-27Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M54 17.5 32 30v27l22-12.5v-27Z" fill="url(#wp-cube-side)" stroke="#1D4ED8" strokeWidth="2" strokeLinejoin="round"/>
                <path d="m18 21.5 14 8 14-8M18 28l8 4.5v8l-8-4.5v-8Z" stroke="white" strokeWidth="2.4" strokeLinejoin="round"/>
                <path d="m32 34 14-8v8l-14 8v-8Z" fill="#DBEAFE" stroke="white" strokeWidth="2"/>
                <path d="m27 43 5 3 5-3v7l-5 3-5-3v-7Z" fill="#BFDBFE" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="flex flex-col">
              <span className="font-serif text-[18px] font-bold leading-tight tracking-tight sm:text-[19px]">
                <span className="text-[#10264B]">Wise</span><span className="text-[#1769E8]">Profit</span>
              </span>
              <span className="mt-1 font-serif text-[10px] leading-none tracking-[0.01em] text-[#334766] sm:text-[11px]">
                Business Management
              </span>
            </span>
          </button>

          <div className="ml-auto flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex shrink-0 items-center rounded-full border border-slate-200 bg-slate-50 p-1 shadow-sm" role="group" aria-label={t('header.chooseLanguage', language)}>
              <button
                type="button"
                onClick={() => onLanguageChange('id')}
                aria-label="Bahasa Indonesia"
                aria-pressed={language === 'id'}
                title="Bahasa Indonesia"
                className={`flex h-8 w-10 items-center justify-center rounded-full transition ${language === 'id' ? 'bg-blue-600 shadow-sm ring-1 ring-blue-700' : 'text-slate-600 hover:bg-white'}`}
              >
                <img
                  src="https://flagcdn.com/w40/id.png"
                  srcSet="https://flagcdn.com/w80/id.png 2x"
                  alt=""
                  aria-hidden="true"
                  className="h-5 w-7 rounded-[3px] object-cover shadow-sm"
                  loading="eager"
                />
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                aria-label="English"
                aria-pressed={language === 'en'}
                title="English"
                className={`flex h-8 w-10 items-center justify-center rounded-full transition ${language === 'en' ? 'bg-blue-600 shadow-sm ring-1 ring-blue-700' : 'text-slate-600 hover:bg-white'}`}
              >
                <img
                  src="https://flagcdn.com/w40/gb.png"
                  srcSet="https://flagcdn.com/w80/gb.png 2x"
                  alt=""
                  aria-hidden="true"
                  className="h-5 w-7 rounded-[3px] object-cover shadow-sm"
                  loading="eager"
                />
              </button>
            </div>

            {user ? (
              <button
                type="button"
                onClick={onOpenProfilePanel}
                aria-label={language === 'id' ? 'Buka profil dan pengaturan' : 'Open profile and settings'}
                aria-haspopup="dialog"
                title={isSyncingCloud ? (language === 'id' ? 'Sinkronisasi sedang berlangsung' : 'Sync in progress') : (language === 'id' ? 'Profil dan pengaturan' : 'Profile and settings')}
                className="flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-0.5 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm">
                  {profilePhoto ? <img src={profilePhoto} alt="" className="h-full w-full object-cover" /> : user.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-6 w-6 text-slate-500" />}
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold leading-none text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  ON
                </span>
              </button>
            ) : (
              <button type="button" onClick={onOpenAuthModal} className="flex shrink-0 items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">
                <LogIn className="h-3.5 w-3.5" />
                {t('header.signIn', language)}
              </button>
            )}
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
        inert={!sidebarOpen}
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
