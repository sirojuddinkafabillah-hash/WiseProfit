export type Language = 'id' | 'en';

export const translations = {
  id: {
    'language.label': 'Bahasa',
    'header.cashierStock': 'Kasir & Stok',
    'header.cashier': 'Kasir',
    'header.reports': 'Laporan',
    'header.businessReports': 'Laporan Usaha',
    'header.withdrawals': 'Penarikan Uang',
    'header.withdrawCash': 'Tarik Uang',
    'header.importExport': 'Ekspor dan Impor Data',
    'header.importExportShort': 'Ekspor/Impor',
    'header.faq': 'FAQ',
    'header.chooseLanguage': 'Pilih bahasa',
    'header.avatar': 'Avatar',
    'header.account': 'Akun',
    'header.otherFeedback': 'Keluhan Lain',
    'header.financeGuide': 'Panduan Keuangan',
    'header.printReport': 'Cetak Laporan',
    'header.backupRestore': 'Simpan & Pulihkan',
    'header.signIn': 'Masuk',
    'header.add': 'Tambah',
    'header.profile': 'Profil',
    'header.openProfileHome': 'Buka profil dan beranda',
    'header.cashWithdrawalTitle': 'Catat penarikan kas (ambil tunai dari kasir)',
    'header.signInEmail': 'Masuk dengan email',
    'header.online': 'Online',
    'header.syncing': 'Menyinkronkan...',
    'app.saved': 'Tersimpan',
    'app.error': 'Terjadi kesalahan. Silakan coba lagi.',
    'app.date': 'Tanggal',
    'app.time': 'Waktu',
  },
  en: {
    'language.label': 'Language',
    'header.cashierStock': 'Cashier & Stock',
    'header.cashier': 'Cashier',
    'header.reports': 'Reports',
    'header.businessReports': 'Business Reports',
    'header.withdrawals': 'Withdrawals',
    'header.withdrawCash': 'Withdraw Cash',
    'header.importExport': 'Data Import & Export',
    'header.importExportShort': 'Import/Export',
    'header.faq': 'FAQ',
    'header.chooseLanguage': 'Choose language',
    'header.avatar': 'Avatar',
    'header.account': 'Account',
    'header.otherFeedback': 'Other Feedback',
    'header.financeGuide': 'Finance Guide',
    'header.printReport': 'Print Report',
    'header.backupRestore': 'Backup & Restore',
    'header.signIn': 'Sign in',
    'header.add': 'Add',
    'header.profile': 'Profile',
    'header.openProfileHome': 'Open profile and home',
    'header.cashWithdrawalTitle': 'Record a cash withdrawal',
    'header.signInEmail': 'Sign in with email',
    'header.online': 'Online',
    'header.syncing': 'Syncing...',
    'app.saved': 'Saved',
    'app.error': 'Something went wrong. Please try again.',
    'app.date': 'Date',
    'app.time': 'Time',
  },
} as const;

export type TranslationKey = keyof typeof translations.id;

export function t(key: TranslationKey, language: Language = getInitialLanguage()): string {
  return translations[language][key] || translations.id[key] || key;
}

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem('wp_language');
    if (saved === 'id' || saved === 'en') return saved;
  } catch {
    // Storage may be unavailable; fall back to browser language.
  }

  const browserLanguage = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : '';
  return browserLanguage.startsWith('en') ? 'en' : 'id';
}

export function formatDateTime(
  value: string | number | Date,
  language: Language,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
): string {
  const locale = language === 'en' ? 'en-US' : 'id-ID';
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

export function formatTime(
  value: string | number | Date,
  language: Language,
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' },
): string {
  const locale = language === 'en' ? 'en-US' : 'id-ID';
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}
