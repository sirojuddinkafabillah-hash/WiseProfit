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
  ArrowDownCircle,
  Home,
  UserRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type AppPage = 'home' | 'inventory' | 'reports' | 'withdrawals' | 'import';

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
              aria-label="Buka profil dan beranda"
              title="Profil"
              className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition-all cursor-pointer ${activePage === 'home' ? 'border-emerald-300 ring-2 ring-emerald-400/20' : 'border-slate-700 hover:border-emerald-300'}`}
            >
              {profilePhoto ? <img src={profilePhoto} alt="Profil" className="h-full w-full object-cover" /> : user?.photoURL ? <img src={user.photoURL} alt="Profil" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center bg-slate-800 text-emerald-300"><UserRound className="h-5 w-5" /></span>}
            </button>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl font-sans text-sm">
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
                <span>Kasir & Stok</span>
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
                <span>Laporan Usaha</span>
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
                <span>Penarikan Uang</span>
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
                <span>Impor Data</span>
              </button>
            </nav>
          </div>

          {/* Quick Tools & Cloud Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Helper Tools */}
            <nav className="hidden xl:flex items-center gap-1.5 text-xs font-sans font-medium text-slate-300">
              <button
                type="button"
                onClick={onOpenGuide}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Panduan Keuangan</span>
              </button>
              {onOpenWithdrawalModal && (
                <button
                  type="button"
                  onClick={onOpenWithdrawalModal}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 hover:text-white text-rose-300 transition-colors cursor-pointer font-semibold text-[11px]"
                  title="Catat penarikan kas (ambil tunai dari kasir)"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Tarik Uang</span>
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
                <span>Cetak Laporan</span>
              </button>
              <button
                type="button"
                onClick={onOpenDownloadModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 hover:text-white text-slate-200 transition-colors cursor-pointer font-semibold text-[11px]"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Simpan & Pulihkan</span>
              </button>
            </nav>

            {/* Cloud Auth */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 py-1 px-2.5 rounded-xl text-xs font-sans">
                <div className="flex items-center gap-2 text-slate-200 font-medium">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Avatar"
                      className="w-5 h-5 rounded-full ring-1 ring-emerald-500"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-[10px] font-bold">
                      {(user.email?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                  <span className="hidden lg:inline-block max-w-[120px] truncate text-[11px] text-slate-200">
                    {user.email || user.displayName || 'Akun'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isSyncingCloud
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isSyncingCloud ? (
                      'Sync...'
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="hidden sm:inline">Online</span>
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
                title="Masuk dengan email"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Masuk</span>
              </button>
            )}

            {/* Quick Add Trigger Button */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-sans text-xs font-semibold border border-slate-700 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Tambah</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar (visible on smaller screens) */}
        <div className="flex md:hidden items-center justify-between gap-1 py-2.5 border-t border-slate-800/80 font-sans text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => onChangePage('home')}
            aria-label="Buka profil dan beranda"
            title="Profil"
            className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 transition-all ${activePage === 'home' ? 'border-emerald-300 ring-2 ring-emerald-400/20' : 'border-slate-700'}`}
          >
            {profilePhoto ? <img src={profilePhoto} alt="Profil" className="h-full w-full object-cover" /> : user?.photoURL ? <img src={user.photoURL} alt="Profil" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center bg-slate-800 text-emerald-300"><UserRound className="h-4 w-4" /></span>}
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
            <span>Kasir</span>
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
            <span>Laporan</span>
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
            <span>Tarik Uang</span>
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
            <span>Impor</span>
          </button>
        </div>
      </div>
    </header>
  );
};
