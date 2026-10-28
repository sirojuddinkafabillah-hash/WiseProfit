import React, { useState, useEffect, useMemo } from 'react';
import { InventoryItem, Withdrawal } from './types/inventory';
import { calculateSummary } from './utils/calculator';
import { Header, AppPage } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { QuickAddBar } from './components/QuickAddBar';
import { InventoryTable } from './components/InventoryTable';
import { ItemModal } from './components/ItemModal';
import { CashFlowGuideModal } from './components/CashFlowGuideModal';
import { DownloadModal } from './components/DownloadModal';
import { PrintReportView } from './components/PrintReportView';
import { AuthModal } from './components/AuthModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ReportsEquityPage } from './components/ReportsEquityPage';
import { ImportDataPage } from './components/ImportDataPage';
import { WithdrawalPage } from './components/WithdrawalPage';
import { WithdrawalModal } from './components/WithdrawalModal';
import { HomePage } from './components/HomePage';
import { SupportPage } from './components/SupportPage';
import { supabase } from './lib/supabase';
import { CosmicInteractiveBackground, BackgroundTheme } from './components/CosmicInteractiveBackground';
import { useAuth } from './context/AuthContext';
import { 
  Cloud, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw,
  Database,
  AlertCircle,
  Lock,
  LogIn
} from 'lucide-react';
import {
  saveInventoryItemToCloud,
  deleteInventoryItemFromCloud,
  clearAllUserItemsFromCloud,
  saveUserProfile,
  getUserProfile,
  fetchUserItemsOnce,
  subscribeUserItems,
  batchUploadToCloud,
  saveWithdrawalToCloud,
  deleteWithdrawalFromCloud,
  subscribeUserWithdrawals,
  fetchUserWithdrawalsOnce,
  sanitizeId,
} from './services/supabaseSync';

export default function App() {
  const { user, loading: isAuthLoading, isOnline, tokenServiceStatus, checkConnection, logout } = useAuth();
  const [language, setLanguage] = useState<'id' | 'en'>(() => {
    try { return localStorage.getItem('wp_language') === 'en' ? 'en' : 'id'; } catch { return 'id'; }
  });
  useEffect(() => {
    document.documentElement.lang = language;
    try { localStorage.setItem('wp_language', language); } catch (e) { console.error('Language preference could not be saved:', e); }
  }, [language]);

  // App Core State (Tied to authenticated user)
  const [modalAwal, setModalAwal] = useState<number>(50000);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [globalSavePercentMonthly, setGlobalSavePercentMonthly] = useState<number>(50);

  // Database & Sync status
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isSavingCloud, setIsSavingCloud] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Real-time ticking clock
  const [currentRealTime, setCurrentRealTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentRealTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // UI Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Tampilkan formulir masuk setelah status sesi selesai diperiksa.
  useEffect(() => {
    if (!isAuthLoading && !user) setIsAuthModalOpen(true);
    if (user) setIsAuthModalOpen(false);
  }, [isAuthLoading, user]);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Active Navigation Page (Kasir & Inventori, Laporan & Ekuitas, Impor Data)
  const [activePage, setActivePage] = useState<AppPage>('inventory');
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false);
  const [profilePanelWidth, setProfilePanelWidth] = useState(() => Math.max(320, Math.round(window.innerWidth / 3)));
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Setiap pergantian menu menampilkan halaman dari bagian paling atas.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activePage]);

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isConfirmClearAllOpen, setIsConfirmClearAllOpen] = useState<boolean>(false);

  // Background Theme
  const [backgroundTheme, setBackgroundTheme] = useState<BackgroundTheme>(() => {
    try {
      const stored = localStorage.getItem('niaganova_bg_theme');
      if (stored && ['cosmic-nebula', 'aurora-emerald', 'cyber-sapphire', 'light-crystal'].includes(stored)) {
        return stored as BackgroundTheme;
      }
    } catch (e) {
      console.error(e);
    }
    return 'cosmic-nebula';
  });

  type AccentChoice = 'emerald' | 'blue' | 'violet' | 'rose' | 'amber' | 'cyan';
  type TableChoice = 'slate' | 'light' | 'blue' | 'green';
  type TextChoice = 'default' | 'bright' | 'soft' | 'warm';
  const [accentChoice, setAccentChoice] = useState<AccentChoice>(() => {
    try { const saved = localStorage.getItem('wp_accent_color'); return saved && ['emerald', 'blue', 'violet', 'rose', 'amber', 'cyan'].includes(saved) ? saved as AccentChoice : 'emerald'; } catch { return 'emerald'; }
  });
  const [tableChoice, setTableChoice] = useState<TableChoice>(() => {
    try { const saved = localStorage.getItem('wp_table_color'); return saved && ['slate', 'light', 'blue', 'green'].includes(saved) ? saved as TableChoice : 'slate'; } catch { return 'slate'; }
  });
  const [textChoice, setTextChoice] = useState<TextChoice>(() => {
    try { const saved = localStorage.getItem('wp_text_color'); return saved && ['default', 'bright', 'soft', 'warm'].includes(saved) ? saved as TextChoice : 'default'; } catch { return 'default'; }
  });
  useEffect(() => {
    document.documentElement.dataset.wpAccent = accentChoice;
    document.documentElement.dataset.wpTable = tableChoice;
    document.documentElement.dataset.wpText = textChoice;
    try { localStorage.setItem('wp_accent_color', accentChoice); localStorage.setItem('wp_table_color', tableChoice); localStorage.setItem('wp_text_color', textChoice); } catch (e) { console.error(e); }
  }, [accentChoice, tableChoice, textChoice]);

  const [fontChoice, setFontChoice] = useState<string>(() => {
    try { return localStorage.getItem('wp_font_choice') || 'Inter'; } catch { return 'Inter'; }
  });
  const [wallpaper, setWallpaper] = useState<string | null>(() => {
    try { return localStorage.getItem('wp_dashboard_wallpaper'); } catch { return null; }
  });
  useEffect(() => {
    document.documentElement.style.setProperty('--wp-font-family', fontChoice);
    try { localStorage.setItem('wp_font_choice', fontChoice); } catch (e) { console.error(e); }
  }, [fontChoice]);
  useEffect(() => {
    try {
      if (wallpaper) localStorage.setItem('wp_dashboard_wallpaper', wallpaper);
      else localStorage.removeItem('wp_dashboard_wallpaper');
    } catch (e) { console.error('Wallpaper could not be saved locally:', e); }
  }, [wallpaper]);

  const handleThemeChange = (theme: BackgroundTheme) => {
    setBackgroundTheme(theme);
    try {
      localStorage.setItem('niaganova_bg_theme', theme);
    } catch (e) {
      console.error(e);
    }
  };

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // REAL-TIME SUPABASE SYNCHRONIZATION TIED TO AUTHENTICATED USER
  // If user is null (logged out): strictly empty and hide all data
  // If user logs in: subscribe in real-time to user's private items, withdrawals & profile
  useEffect(() => {
    if (!user) {
      // Hide all store data when logged out
      setItems([]);
      setWithdrawals([]);
      setModalAwal(50000);
      return;
    }

    setIsLoadingData(true);
    let isSubscribed = true;

    // 1. Fetch user's profile from Supabase to restore modalAwal
    getUserProfile(user.uid).then((prof) => {
      if (isSubscribed && prof && typeof prof.modalAwal === 'number') {
        setModalAwal(prof.modalAwal);
      }
    }).catch((e) => console.warn('User profile fetch warning:', e));

    // 2. Real-time listener for user's private items collection
    const unsubscribeItems = subscribeUserItems(
      user.uid,
      (cloudItems) => {
        if (!isSubscribed) return;
        setItems(cloudItems);
        setIsLoadingData(false);
        if (cloudItems.length > 0) {
          setNotification(`Data toko akun (${cloudItems.length} barang) aktif & tersinkronisasi di Cloud.`);
        }
      },
      async (err) => {
        console.error('Supabase items subscription warning:', err);
        // Fallback: fetch user items once
        if (isSubscribed) {
          const onceItems = await fetchUserItemsOnce(user.uid);
          setItems(onceItems);
          setIsLoadingData(false);
        }
      }
    );

    // 3. Real-time listener for user's private withdrawals collection
    const unsubscribeWithdrawals = subscribeUserWithdrawals(
      user.uid,
      (cloudWithdrawals) => {
        if (!isSubscribed) return;
        setWithdrawals(cloudWithdrawals);
      },
      async (err) => {
        console.error('Supabase withdrawals subscription warning:', err);
        if (isSubscribed) {
          const onceWithdrawals = await fetchUserWithdrawalsOnce(user.uid);
          setWithdrawals(onceWithdrawals);
        }
      }
    );

    return () => {
      isSubscribed = false;
      unsubscribeItems();
      unsubscribeWithdrawals();
    };
  }, [user?.uid]);

  // Filtered items by selected month
  const filteredMonthlyItems = useMemo(() => {
    if (selectedMonth === 'all') return items;
    return items.filter((item) => {
      const itemMonth = (item.tanggalInput || new Date(item.createdAt).toISOString().slice(0, 7)).slice(0, 7);
      return itemMonth === selectedMonth;
    });
  }, [items, selectedMonth]);

  // Overall financial summary
  const summary = useMemo(() => {
    return calculateSummary(filteredMonthlyItems, modalAwal, withdrawals);
  }, [filteredMonthlyItems, modalAwal, withdrawals]);

  // Handlers for Items with Cloud persistence
  const handleAddItem = async (newItemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const now = Date.now();
    const nextNoUrut = (newItemData as any).noUrut ?? (
      items.length > 0 ? Math.max(0, ...items.map((i) => i.noUrut || 0)) + 1 : 1
    );
    const item: InventoryItem = {
      ...newItemData,
      id: sanitizeId(`item_${now}_${Math.random().toString(36).substring(2, 7)}`),
      noUrut: nextNoUrut,
      createdAt: now,
      updatedAt: now,
      persentaseLabaDisimpanBulanan: newItemData.persentaseLabaDisimpanBulanan ?? globalSavePercentMonthly,
    };

    // Optimistic local update
    setItems((prev) => [item, ...prev.filter((i) => i.id !== item.id)]);

    setIsSavingCloud(true);
    try {
      await saveInventoryItemToCloud(user.uid, item);
      setNotification(`Barang "${item.namaBarang}" berhasil disimpan.`);
    } catch (err) {
      console.error('Failed to save item:', err);
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleSaveItem = async (
    itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const now = Date.now();
    if (editId) {
      const existing = items.find((i) => i.id === editId);
      const updated: InventoryItem = {
        ...(existing || {}),
        ...itemData,
        id: editId,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
      };

      // Optimistic local update
      setItems((prev) => prev.map((i) => (i.id === editId ? updated : i)));

      setIsSavingCloud(true);
      try {
        await saveInventoryItemToCloud(user.uid, updated);
        setNotification(`Perubahan "${itemData.namaBarang}" berhasil disimpan.`);
      } catch (e) {
        console.error('Failed to update item:', e);
      } finally {
        setIsSavingCloud(false);
      }
    } else {
      await handleAddItem(itemData);
    }

    setIsItemModalOpen(false);
    setEditingItem(null);
  };

  // Triggered by row delete icon
  const handleRequestDeleteItem = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (target) {
      setItemToDelete(target);
    }
  };

  // Confirmed Delete execution
  const handleConfirmDeleteItem = async () => {
    if (!itemToDelete || !user) return;
    const { id, namaBarang } = itemToDelete;
    setItemToDelete(null);

    // Optimistic local update
    setItems((prev) => prev.filter((i) => i.id !== id));

    setIsSavingCloud(true);
    try {
      await deleteInventoryItemFromCloud(user.uid, id);
      setNotification(`Barang "${namaBarang}" berhasil dihapus.`);
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setIsSavingCloud(false);
    }
  };

  // Triggered by "Hapus Semua" toolbar button
  const handleRequestClearAll = () => {
    setIsConfirmClearAllOpen(true);
  };

  // Confirmed Clear All execution (Kosongkan Seluruh Tabel)
  const handleConfirmClearAll = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsConfirmClearAllOpen(false);

    setIsSavingCloud(true);
    setItems([]);
    try {
      const ok = await clearAllUserItemsFromCloud(user.uid);
      if (ok) {
        setNotification('Seluruh data barang Anda berhasil dikosongkan.');
      } else {
        setNotification('Gagal mengosongkan seluruh data di Cloud. Silakan coba kembali.');
      }
    } catch (err) {
      console.error('Failed to clear items:', err);
      setNotification('Gagal mengosongkan data di Cloud.');
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleUpdateSoldQty = async (id: string, delta: number) => {
    if (!user) return;
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newQty = Math.min(
      item.jumlahBarangWadah,
      Math.max(0, item.jumlahBarangDijualSatuan + delta)
    );
    const updated = { ...item, jumlahBarangDijualSatuan: newQty, updatedAt: Date.now() };

    // Optimistic local update
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));

    try {
      await saveInventoryItemToCloud(user.uid, updated);
    } catch (e) {
      console.error('Failed to update sold qty:', e);
    }
  };

  const handleSetSoldQty = async (id: string, qty: number) => {
    if (!user) return;
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const clamped = Math.min(item.jumlahBarangWadah, Math.max(0, qty));
    const updated = { ...item, jumlahBarangDijualSatuan: clamped, updatedAt: Date.now() };

    // Optimistic local update
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));

    try {
      await saveInventoryItemToCloud(user.uid, updated);
    } catch (e) {
      console.error('Failed to set sold qty:', e);
    }
  };

  const handleSaveDisplayName = async (name: string): Promise<boolean> => {
    if (!user) return false;
    const cleanName = name.trim().slice(0, 60);
    if (!cleanName) return false;
    try {
      const { error } = await supabase.auth.updateUser({ data: { display_name: cleanName, full_name: cleanName, name: cleanName } });
      if (error) throw error;
      const saved = await saveUserProfile(user.uid, { email: user.email || undefined, displayName: cleanName, modalAwal, globalSavePercentMonthly });
      if (!saved) throw new Error('Nama belum berhasil disimpan ke profil online.');
      setNotification('Nama profil berhasil diperbarui.');
      return true;
    } catch (error) {
      console.error('Failed to update display name:', error);
      setNotification('Nama belum berhasil disimpan. Periksa koneksi lalu coba lagi.');
      return false;
    }
  };

  const handleUpdateModalAwal = async (newModal: number) => {
    setModalAwal(newModal);
    if (!user) return;
    try {
      await saveUserProfile(user.uid, { email: user.email || undefined, displayName: user.displayName || undefined, modalAwal: newModal });
      setNotification(`Modal awal usaha Rp ${newModal.toLocaleString('id-ID')} tersimpan di Cloud.`);
    } catch (e) {
      console.error('Failed to update modalAwal:', e);
    }
  };

  const handleAddWithdrawal = async (nominal: number, tanggal: string, catatan?: string): Promise<boolean> => {
    if (!user) {
      setIsAuthModalOpen(true);
      return false;
    }

    const now = Date.now();
    const newWithdrawal: Withdrawal = {
      id: sanitizeId(`wd_${now}_${Math.random().toString(36).substring(2, 7)}`),
      userId: user.uid,
      nominal: Math.max(1, Math.round(nominal)),
      tanggal,
      catatan: catatan ? catatan.slice(0, 500) : undefined,
      createdAt: now,
      updatedAt: now,
    };

    setIsSavingCloud(true);
    try {
      const ok = await saveWithdrawalToCloud(user.uid, newWithdrawal);
      if (ok) {
        setWithdrawals((prev) => [newWithdrawal, ...prev.filter((w) => w.id !== newWithdrawal.id)]);
        setNotification(`Penarikan kas Rp ${nominal.toLocaleString('id-ID')} berhasil disimpan ke Cloud.`);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to save withdrawal:', err);
      return false;
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleDeleteWithdrawal = async (id: string): Promise<boolean> => {
    if (!user) return false;

    setIsSavingCloud(true);
    try {
      const ok = await deleteWithdrawalFromCloud(user.uid, id);
      if (ok) {
        setWithdrawals((prev) => prev.filter((w) => w.id !== id));
        setNotification('Riwayat penarikan berhasil dihapus.');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete withdrawal:', err);
      return false;
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleRestoreData = async (restoredItems: InventoryItem[], restoredModalAwal?: number) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const finalModal = restoredModalAwal !== undefined && restoredModalAwal >= 0 ? restoredModalAwal : modalAwal;
    if (restoredModalAwal !== undefined && restoredModalAwal >= 0) {
      setModalAwal(restoredModalAwal);
    }

    setIsSavingCloud(true);
    try {
      await batchUploadToCloud(user.uid, user.email || '', finalModal, restoredItems);
      setNotification(`Data toko (${restoredItems.length} barang) berhasil dipulihkan ke Cloud akun Anda!`);
    } catch (e) {
      console.error('Failed to restore data:', e);
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handlePrint = () => {
    setActivePage('reports');
    setIsPrintReportOpen(true);
  };

  const handleImportSuccess = async (
    importedItems: InventoryItem[], 
    newModal?: number, 
    mode: 'append' | 'replace' = 'append'
  ) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const finalModal = typeof newModal === 'number' && newModal >= 0 ? newModal : modalAwal;
    if (typeof newModal === 'number' && newModal >= 0) {
      setModalAwal(newModal);
    }

    let updatedList: InventoryItem[] = [];
    if (mode === 'replace') {
      updatedList = importedItems;
    } else {
      const incomingIds = new Set(importedItems.map((i) => i.id));
      const existingRemaining = items.filter((p) => !incomingIds.has(p.id));
      updatedList = [...existingRemaining, ...importedItems];
    }

    // Sort by noUrut ascending to strictly preserve imported file sequence (1, 2, 3...)
    updatedList.sort((a, b) => {
      if (typeof a.noUrut === 'number' && typeof b.noUrut === 'number') {
        return a.noUrut - b.noUrut;
      }
      if (typeof a.noUrut === 'number') return -1;
      if (typeof b.noUrut === 'number') return 1;
      return (a.createdAt || 0) - (b.createdAt || 0);
    });

    setItems(updatedList);

    setIsSavingCloud(true);
    try {
      await batchUploadToCloud(user.uid, user.email || '', finalModal, updatedList);
      setNotification(`Berhasil mengimpor ${importedItems.length} barang! Tersimpan permanen di Supabase akun Anda.`);
    } catch (err) {
      console.error('Cloud import save error:', err);
    } finally {
      setIsSavingCloud(false);
    }

    setActivePage('inventory');
  };

  return (
    <div className="relative min-h-screen flex flex-col text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200 font-sans" style={wallpaper ? { backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.78), rgba(2, 6, 23, 0.88)), url("${wallpaper}")`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : undefined}>
      {/* Dynamic Cursor-Interactive Background */}
      {!wallpaper && <CosmicInteractiveBackground
        currentTheme={backgroundTheme}
        onThemeChange={handleThemeChange}
      />}

      {/* Main Foreground Content */}
      <div className="relative z-10 flex min-h-screen min-w-0 flex-col overflow-x-hidden transition-[padding] duration-300" style={{ paddingLeft: isProfilePanelOpen && window.innerWidth >= 640 ? `${Math.min(profilePanelWidth, window.innerWidth * 0.92)}px` : 0 }}>
        {/* Top Header with Navigation */}
        <Header
          activePage={isProfilePanelOpen ? 'home' : activePage}
          language={language}
          onLanguageChange={setLanguage}
          onChangePage={(page) => {
            if (page === 'home') {
              if (!user) { setIsAuthModalOpen(true); return; }
              setIsProfilePanelOpen((open) => !open);
            } else {
              setActivePage(page);
              setIsProfilePanelOpen(false);
            }
          }}
          itemsCount={items.length}
          onOpenAddModal={() => {
            if (!user) {
              setIsAuthModalOpen(true);
              return;
            }
            setEditingItem(null);
            setIsItemModalOpen(true);
          }}
          onPrintReport={handlePrint}
          onOpenGuide={() => setIsGuideModalOpen(true)}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenWithdrawalModal={() => setActivePage('withdrawals')}
          withdrawalsCount={withdrawals.length}
          isSyncingCloud={isSavingCloud || isLoadingData}
        />

        {/* Dynamic Notification Toast */}
        {notification && (
          <div className="no-print bg-slate-900/90 backdrop-blur-md border-b border-emerald-500/30 px-4 py-2.5 text-xs text-emerald-200 animate-in fade-in">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{notification}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="text-emerald-400 hover:text-emerald-100 font-bold cursor-pointer ml-4 p-1"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Supabase API offline status banner */}
        {user && (tokenServiceStatus === 'pending_activation' || !isOnline) && (
          <div className="no-print bg-amber-950/90 backdrop-blur-md border-b border-amber-500/40 px-4 py-2.5 text-xs text-amber-200 animate-in fade-in">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono">
              <div className="flex items-start md:items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 md:mt-0" />
                <div className="text-left leading-relaxed">
                  <span className="font-bold text-amber-300">Penyimpanan online belum tersambung:</span>{' '}
                  WiseProfit belum bisa terhubung ke layanan penyimpanan. Data baru mungkin belum tersimpan secara online.
                  <span className="text-emerald-300 ml-1">Periksa pengaturan koneksi sebelum menyimpan catatan penting.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                <a
                  href="https://supabase.com/dashboard/project/ecbtnkuqbygfhoofhvut/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600/40 hover:bg-amber-600/60 border border-amber-500/50 rounded-lg text-amber-100 text-xs font-sans font-medium transition-colors"
                >
                  Buka pengaturan penyimpanan
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await checkConnection();
                    if (ok) {
                      setNotification('Koneksi Supabase berhasil tersambung penuh!');
                    }
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-xs font-sans font-medium transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Cek Ulang</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Container */}
        <main className="min-w-0 flex-1 max-w-7xl w-full mx-auto overflow-x-hidden px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          {/* REQUIREMENT: Sembunyikan data ketika log out & Setiap orang hanya bisa melihat data diri sendiri */}
          {!user ? (
            <section className="mx-auto my-8 grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(36,50,75,0.12)] sm:my-14 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative flex flex-col justify-between overflow-hidden bg-[#24324B] p-7 text-white sm:p-10 lg:p-12">
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#4268C9]/40 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-[#4268C9]/30 blur-3xl" />
                <div className="relative">
                  <div className="mb-10 inline-flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#24324B] shadow-lg">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-lg font-bold tracking-tight text-white">WiseProfit</p>
                      <p className="text-xs text-white/65">Kelola usaha dengan lebih jelas</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                    <span className="h-2 w-2 rounded-full bg-blue-300" />
                    Ruang usaha digital Anda
                  </span>
                  <h2 className="mt-5 max-w-md text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                    Semua catatan usaha, lebih tertata.
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-7 text-white/75">
                    Pantau stok, penjualan, keuntungan, dan arus kas dari satu tempat yang terhubung ke akun Anda.
                  </p>
                </div>
                <div className="relative mt-10 space-y-4">
                  {[
                    'Catatan usaha terhubung ke akun Anda',
                    'Ringkasan penjualan dan arus kas',
                    'Akses data setelah masuk dengan akun yang benar'
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-white/85">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-200" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#4268C9]">Selamat datang</span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#24324B] sm:text-4xl">
                  Masuk ke WiseProfit
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Lanjutkan mengelola bisnis Anda. Masuk menggunakan email dan kata sandi yang terdaftar, atau buat akun baru jika belum memiliki akun.
                </p>
                <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#4268C9]" />
                    <div>
                      <p className="text-sm font-semibold text-[#24324B]">Kelola usaha dengan lebih mudah</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">Akses pencatatan stok, penjualan, dan keuangan dalam satu dashboard.</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4268C9] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#3457A5] focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <LogIn className="h-5 w-5" />
                  Masuk atau buat akun
                </button>
                <p className="mt-4 text-center text-xs text-slate-400">Putih · Navy · Biru</p>
              </div>
            </section>
          ) : (
            <>
              {/* PAGE 1: KASIR & INVENTORI */}
              {activePage === 'inventory' && (
                <div className="space-y-6">
                  {/* Enterprise-style workspace heading */}
                  <section className="dashboard-hero flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Keuangan usaha Anda
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300">
                        <span className={`h-2 w-2 rounded-full ${isSavingCloud || isLoadingData ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                        {isSavingCloud || isLoadingData ? 'Menyinkronkan data' : 'Semua siap digunakan'}
                      </span>
                    </div>
                  </section>
                  {/* Rolling Cash Balance & Capital Cards Focusing on Sisa Kas */}
                  <SummaryCards
                    summary={summary}
                    modalAwal={modalAwal}
                    onUpdateModalAwal={handleUpdateModalAwal}
                    onOpenGuide={() => setIsGuideModalOpen(true)}
                    currentRealTime={currentRealTime}
                    bulanFilter={selectedMonth}
                    onOpenWithdrawalModal={() => setActivePage('withdrawals')}
                  />

                  {/* Quick Add Bar */}
                  <QuickAddBar
                    onAdd={handleAddItem}
                    globalSavePercentMonthly={globalSavePercentMonthly}
                  />

                  {/* Main Table with Numeric Sold Input, Sisa Kas & Real-Time Timestamps */}
                  <InventoryTable
                    items={items}
                    modalAwal={modalAwal}
                    saldoKasSaatIni={summary.saldoKasSaatIni}
                    onEditItem={(item) => {
                      setEditingItem(item);
                      setIsItemModalOpen(true);
                    }}
                    onDeleteItem={handleRequestDeleteItem}
                    onUpdateSoldQty={handleUpdateSoldQty}
                    onSetSoldQty={handleSetSoldQty}
                    onClearAll={handleRequestClearAll}
                    selectedMonth={selectedMonth}
                    onSelectMonth={setSelectedMonth}
                  />
                </div>
              )}

              {/* PAGE 2: LAPORAN PENJUALAN & EKUITAS (HALAMAN MANDIRI) */}
              {activePage === 'reports' && (
                <ReportsEquityPage
                  items={items}
                  modalAwal={modalAwal}
                  summary={summary}
                  selectedMonth={selectedMonth}
                  onSelectMonth={setSelectedMonth}
                  onPrintReport={handlePrint}
                  onBackToInventory={() => setActivePage('inventory')}
                />
              )}

              {/* PAGE 3: PENARIKAN UANG / KAS (HALAMAN MANDIRI) */}
              {activePage === 'withdrawals' && (
                <WithdrawalPage
                  withdrawals={withdrawals}
                  availableBalance={summary.saldoKasSaatIni}
                  isSaving={isSavingCloud}
                  onSave={async (data) => {
                    return await handleAddWithdrawal(data.nominal, data.tanggal, data.catatan);
                  }}
                  onDelete={handleDeleteWithdrawal}
                  onBackToInventory={() => setActivePage('inventory')}
                />
              )}

              {/* PAGE 4: IMPOR DATA (EXCEL / CSV / JSON) */}
              {activePage === 'import' && (
                <ImportDataPage
                  currentItemsCount={items.length}
                  currentModalAwal={modalAwal}
                  currentItems={items}
                  onImportSuccess={handleImportSuccess}
                  onNavigateToInventory={() => setActivePage('inventory')}
                />
              )}

              {activePage === 'faq' && (
                <SupportPage mode="faq" onBackToInventory={() => setActivePage('inventory')} onGoToComplaints={() => setActivePage('complaints')} />
              )}

              {activePage === 'complaints' && (
                <SupportPage mode="complaints" onBackToInventory={() => setActivePage('inventory')} onGoToComplaints={() => setActivePage('complaints')} />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="no-print mt-auto min-w-0 max-w-full overflow-hidden border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-xl py-5 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5 font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span>Kalkulator Dagang & Arus Kas Cloud Real-time</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Penyimpanan: <strong className="text-emerald-400">Supabase PostgreSQL</strong> (RLS per akun)</span>
            </div>
          </div>
        </footer>

      {user && isProfilePanelOpen && (
        <div className="pointer-events-none fixed inset-0 z-[60]">
          {window.innerWidth < 640 && <button type="button" aria-label="Tutup panel profil" onClick={() => setIsProfilePanelOpen(false)} className="pointer-events-auto absolute inset-0 bg-black/35 backdrop-blur-[1px]"/>}
          <aside
            className={`pointer-events-auto absolute left-0 top-0 flex h-full max-w-full flex-col border-r border-slate-700 bg-slate-950/98 shadow-2xl transition-[width] duration-200 ${window.innerWidth < 640 ? 'w-screen' : ''}`}
            style={{ width: window.innerWidth < 640 ? '100vw' : `${Math.min(profilePanelWidth, window.innerWidth * 0.92)}px` }}
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-800 bg-slate-950 px-3 py-3">
              <div className="min-w-0"><p className="truncate text-sm font-bold text-white">Profil & Catatan</p><p className="text-[11px] text-slate-400">Panel samping WiseProfit</p></div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => setProfilePanelWidth(Math.max(320, Math.round(window.innerWidth / 3)))} title="Lebar sepertiga layar" className="rounded-lg border border-slate-700 px-2 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-800">⅓</button>
                <button type="button" onClick={() => setProfilePanelWidth(Math.min(window.innerWidth * 0.92, Math.max(320, window.innerWidth - 24)))} title="Perbesar panel" className="rounded-lg border border-slate-700 px-2 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-800">Lebar</button>
                <button type="button" onClick={() => setProfilePanelWidth(320)} title="Perkecil panel" className="rounded-lg border border-slate-700 px-2 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-800">Kecil</button>
                <button type="button" onClick={() => setIsProfilePanelOpen(false)} title="Tutup panel" className="rounded-lg p-2 text-slate-300 hover:bg-slate-800">✕</button>
              </div>
            </div>
            <div
              role="separator"
              aria-label="Ubah lebar panel profil"
              aria-orientation="vertical"
              onPointerDown={(event) => { if (window.innerWidth >= 640) { event.currentTarget.setPointerCapture(event.pointerId); } }}
              onPointerMove={(event) => { if (event.buttons === 1 && window.innerWidth >= 640) setProfilePanelWidth(Math.min(window.innerWidth * 0.92, Math.max(320, event.clientX))); }}
              className="absolute right-0 top-0 z-10 hidden h-full w-1.5 translate-x-1/2 cursor-col-resize touch-none bg-transparent hover:bg-emerald-400/70 sm:block"
            />
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4">
              <HomePage
                user={user}
                theme={backgroundTheme}
                onThemeChange={handleThemeChange}
                accentChoice={accentChoice}
                onAccentChange={setAccentChoice}
                tableChoice={tableChoice}
                onTableChange={setTableChoice}
                textChoice={textChoice}
                onTextChange={setTextChoice}
                fontChoice={fontChoice}
                onFontChange={setFontChoice}
                wallpaper={wallpaper}
                onWallpaperChange={setWallpaper}
                onSaveName={handleSaveDisplayName}
                onLogout={async () => {
                  try { await logout(); setIsProfilePanelOpen(false); }
                  catch (error) { console.error('Logout failed:', error); setNotification('Belum berhasil keluar. Silakan coba lagi.'); }
                }}
              />
            </div>
          </aside>
        </div>
      )}

                {/* Modals */}
        <ItemModal
          isOpen={isItemModalOpen}
          onClose={() => {
            setIsItemModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSaveItem}
          editingItem={editingItem}
        />

        <CashFlowGuideModal
          isOpen={isGuideModalOpen}
          onClose={() => setIsGuideModalOpen(false)}
        />

        <DownloadModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          items={items}
          modalAwal={modalAwal}
          summary={summary}
          onRestoreData={handleRestoreData}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        {/* Dedicated Delete Confirmation Modal (Reliable, no window.confirm) */}
        <DeleteConfirmModal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          onConfirm={handleConfirmDeleteItem}
          item={itemToDelete}
          mode="single"
        />

        {/* Dedicated Clear All Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={isConfirmClearAllOpen}
          onClose={() => setIsConfirmClearAllOpen(false)}
          onConfirm={handleConfirmClearAll}
          mode="all"
        />

        {/* Withdrawal Modal (Penarikan Kasir) */}
        <WithdrawalModal
          isOpen={isWithdrawalModalOpen}
          onClose={() => setIsWithdrawalModalOpen(false)}
          withdrawals={withdrawals}
          saldoKasSaatIni={summary.saldoKasSaatIni}
          onAddWithdrawal={handleAddWithdrawal}
          onDeleteWithdrawal={handleDeleteWithdrawal}
          isSaving={isSavingCloud}
        />

        {/* Print View Component */}
        {activePage === 'reports' && isPrintReportOpen && (
          <PrintReportView
            items={filteredMonthlyItems}
            summary={summary}
            modalAwal={modalAwal}
            onBack={() => setIsPrintReportOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
