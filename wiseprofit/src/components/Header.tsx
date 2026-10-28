import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Download, 
  Cloud, 
  CheckCircle2, 
  BookOpen, 
  Printer, 
  ShoppingBag, 
  TrendingUp, 
  UploadCloud,
  CircleHelp,
  MessageSquareWarning,
  ArrowDownCircle,
  Home,
  UserRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n/translations';

export type AppPage = 'home' | 'inventory' | 'reports' | 'withdrawals' | 'import' | 'faq' | 'complaints';

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

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onChangePage,
  itemsCount = 0,
  onOpenAddModal,
  onPrintReport,
  onOpenGuide,
  onOpenDownloadModal,
  onOpenAuthModal,
  onOpenWithdrawalModal,
  withdrawalsCount = 0,
  isSyncingCloud = false,
  language,
  onLanguageChange,
}) => {
  const { user } = useAuth();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

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

  return (
    <header className="wp-app-header no-print sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between gap-3 min-h-[4.5rem] py-2">
          {/* Brand & Logo */}
          <div className="flex items-center gap-4 lg:gap-6">
            <button
              type="button"
              onClick={() => onChangePage('home')}
              aria-label={t("header.openProfileHome", language)}
              title={t("header.profile", language)}
              className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition-all cursor-pointer ${activePage === 'home' ? 'border-emerald-300 ring-2 ring-emerald-400/20' : 'border-slate-700 hover:border-emerald-300'}`}
            >
              {profilePhoto ? <img src={profilePhoto} alt={t("header.profile", language)} className="h-full w-full object-cover" /> : user?.photoURL ? <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center bg-slate-800 text-emerald-300"><UserRound className="h-5 w-5" /></span>}
            </button>

            {/* Desktop Navigation Tabs */}
            <nav className="wp-main-navigation hidden md:flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl font-sans text-sm">
              <button
                type="button"
                onClick={() => onChangePage('inventory')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                  activePage === 'inventory'
                    ? 'bg-emerald-400/12 text-emerald-300 border border-emerald-400/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t('header.cashierStock', language)}</span>
                {itemsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activePage === 'inventory' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {itemsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onChangePage('reports')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activePage === 'reports'
                    ? 'bg-emerald-400/12 text-emerald-300 border border-emerald-400/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{t('header.businessReports', language)}</span>
              </button>

              <button
                type="button"
                onClick={() => onChangePage('withdrawals')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activePage === 'withdrawals'
                    ? 'bg-rose-400/10 text-rose-300 border border-rose-400/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <ArrowDownCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>{t('header.withdrawals', language)}</span>
                {withdrawalsCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activePage === 'withdrawals' ? 'bg-slate-950/30 text-white' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {withdrawalsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onChangePage('import')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activePage === 'import'
                    ? 'bg-emerald-400/12 text-emerald-300 border border-emerald-400/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{t('header.importExport', language)}</span>
              </button>
              <button type="button" onClick={() => onChangePage('faq')} className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${activePage === 'faq' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'}`}>
                <CircleHelp className="w-3.5 h-3.5" /><span>FAQ</span>
              </button>
              <button type="button" onClick={() => onChangePage('complaints')} className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer ${activePage === 'complaints' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'}`}>
                <MessageSquareWarning className="w-3.5 h-3.5" /><span>{t('header.otherFeedback', language)}</span>
              </button>
            </nav>
          </div>

          {/* Quick Tools & Cloud Auth */}
          <div className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-white p-1 shadow-sm" role="group" aria-label={t("header.chooseLanguage", language)}>
            <span className="hidden sm:inline px-1 text-[10px] font-semibold text-slate-500">{t('language.label', language)}</span>
            <div className="relative flex items-center rounded-full bg-slate-100 p-0.5" aria-label={t("header.chooseLanguage", language)}>
              <span aria-hidden="true" className={`absolute inset-y-0.5 w-[34px] rounded-full bg-blue-600 shadow-sm transition-transform duration-200 ${language === 'en' ? 'translate-x-[34px]' : 'translate-x-0'}`} />
              <button type="button" onClick={() => onLanguageChange('id')} aria-pressed={language === 'id'} className={`relative z-10 w-[34px] rounded-full py-1 text-[10px] font-bold transition-colors ${language === 'id' ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}>ID</button>
              <button type="button" onClick={() => onLanguageChange('en')} aria-pressed={language === 'en'} className={`relative z-10 w-[34px] rounded-full py-1 text-[10px] font-bold transition-colors ${language === 'en' ? 'text-white' : 'text-slate-600 hover:text-slate-900'}`}>EN</button>
            </div>
          </div>
          <div className="wp-header-quick-tools flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Helper Tools */}
            <nav className="hidden 2xl:flex items-center gap-1.5 text-xs font-sans font-medium text-slate-300">
              <button
                type="button"
                onClick={onOpenGuide}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('header.financeGuide', language)}</span>
              </button>
              {onOpenWithdrawalModal && (
                <button
                  type="button"
                  onClick={onOpenWithdrawalModal}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 hover:text-white text-rose-300 transition-colors cursor-pointer font-semibold text-[11px]"
                  title={t("header.cashWithdrawalTitle", language)}
                >
                  <ArrowDownCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t('header.withdrawCash', language)}</span>
                  {withdrawalsCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded-full text-[10px]">
                      {withdrawalsCount}
                    </span>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={onPrintReport}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('header.printReport', language)}</span>
              </button>
              <button
                type="button"
                onClick={onOpenDownloadModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 hover:text-white text-slate-200 transition-colors cursor-pointer font-semibold text-[11px]"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('header.backupRestore', language)}</span>
              </button>
            </nav>

            {/* Cloud Auth */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 py-1 px-2.5 rounded-xl text-xs font-sans">
                <div className="flex items-center gap-2 text-slate-200 font-medium">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={t("header.avatar", language)}
                      className="w-5 h-5 rounded-full ring-1 ring-emerald-500"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-[10px] font-bold">
                      {(user.email?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:inline-block max-w-[120px] truncate text-[11px] text-slate-200">
                    {user.email || user.displayName || t('header.account', language)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isSyncingCloud
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isSyncingCloud ? (
                      t("header.syncing", language)
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="hidden sm:inline">{t("header.online", language)}</span>
                      </>
                    )}
                  </span>
                </div>

              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                title={t("header.signInEmail", language)}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('header.signIn', language)}</span>
              </button>
            )}

            {/* Quick Add Trigger Button */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-sans text-xs font-semibold border border-slate-700 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{t('header.add', language)}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar (visible on smaller screens) */}
        <div className="flex md:hidden items-center justify-between gap-1 py-2.5 border-t border-slate-800/80 font-sans text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => onChangePage('home')}
            aria-label="Open profile and home"
            title="Profile"
            className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition-all ${activePage === 'home' ? 'border-emerald-300 ring-2 ring-emerald-400/20' : 'border-slate-700'}`}
          >
            {profilePhoto ? <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" /> : user?.photoURL ? <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center bg-slate-800 text-emerald-300"><UserRound className="h-4 w-4" /></span>}
          </button>
          <button
            type="button"
            onClick={() => onChangePage('inventory')}
            className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 px-2 rounded-xl font-bold transition-all shrink-0 ${
              activePage === 'inventory'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t('header.cashier', language)}</span>
            {itemsCount > 0 && (
              <span className="text-[10px] opacity-80">({itemsCount})</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangePage('reports')}
            className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 px-2 rounded-xl font-bold transition-all shrink-0 ${
              activePage === 'reports'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('header.reports', language)}</span>
          </button>

          <button
            type="button"
            onClick={() => onChangePage('withdrawals')}
            className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 px-2 rounded-xl font-bold transition-all shrink-0 ${
              activePage === 'withdrawals'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('header.withdrawCash', language)}</span>
            {withdrawalsCount > 0 && (
              <span className="text-[10px] opacity-80">({withdrawalsCount})</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangePage('import')}
            className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 px-2 rounded-xl font-bold transition-all shrink-0 ${
              activePage === 'import'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{t('header.importExportShort', language)}</span>
          </button>
          <button type="button" onClick={() => onChangePage('faq')} className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 px-2 rounded-xl font-bold shrink-0 ${activePage === 'faq' ? 'bg-blue-700 text-white' : 'text-slate-600 bg-white'}`}><CircleHelp className="w-3.5 h-3.5" /><span>FAQ</span></button>
          <button type="button" onClick={() => onChangePage('complaints')} className={`flex items-center justify-center gap-1.5 flex-1 py-1.5 px-2 rounded-xl font-bold shrink-0 ${activePage === 'complaints' ? 'bg-blue-700 text-white' : 'text-slate-600 bg-white'}`}><MessageSquareWarning className="w-3.5 h-3.5" /><span>{t("header.otherFeedback", language)}</span></button>
        </div>
      </div>
    </header>
  );
};
