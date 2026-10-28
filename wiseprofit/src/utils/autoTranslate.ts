/**
 * Lightweight UI translation layer for the existing Indonesian-first interface.
 * It translates visible labels and common form text without touching user-entered values.
 */
const ID_TO_EN: Record<string, string> = {
  'Modal awal usaha':'Initial business capital','Ubah Modal Awal Usaha':'Edit Initial Capital',
  'Belanja stok:':'Stock purchases:','Uang dari penjualan:':'Sales income:','Uang yang ditarik:':'Cash withdrawn:',
  'Waktu sekarang:':'Current time:','Perjalanan uang usaha:':'Business cash flow:','Modal Awal':'Initial Capital',
  'Belanja':'Purchases','Penjualan':'Sales','Penarikan Kas':'Cash Withdrawal','Sisa Kas':'Remaining Cash',
  'Catatan untuk:':'Showing:','Semua tanggal':'All dates','Bulan':'Month',
  'Catat barang yang baru dibeli':'Record a New Purchase','Catat pembelian di sini. Sisa uang dan keuntungan akan dihitung otomatis saat ada penjualan.':'Record purchases here. Remaining cash and profit are calculated automatically when a sale is recorded.',
  'Tanggal Input':'Entry Date','Nama Barang':'Product Name','Isi (Unit/Pcs)':'Units per Package','Harga Beli Wadah':'Purchase Price per Package',
  'Harga Jual Satuan':'Selling Price per Unit','Jumlah Barang':'Quantity','Harga Beli':'Purchase Price','Harga Jual':'Selling Price',
  'Misal: Air Mineral 600ml / Kopi Sachet 1 Dus':'E.g. 600ml Mineral Water / 1 Carton of Sachet Coffee',
  'Contoh: 24':'Example: 24','Simpan':'Save','Batal':'Cancel','Ubah':'Edit','Hapus':'Delete','Cari':'Search',
  'Cari barang...':'Search products...','Filter':'Filter','Urutkan':'Sort','Terbaru':'Newest','Terlama':'Oldest',
  'Semua':'All','Semua bulan':'All months','Tambah Barang':'Add Product','Tambah barang':'Add product',
  'Catat Penjualan':'Record Sale','Jumlah Terjual':'Quantity Sold','Terjual':'Sold','Stok':'Stock','Persediaan':'Inventory',
  'Kasir & Stok':'Cashier & Stock','Laporan Usaha':'Business Reports','Penarikan Uang':'Withdrawals',
  'Ekspor dan Impor Data':'Data Import & Export','Panduan Keuangan':'Finance Guide','Tarik Uang':'Withdraw Cash',
  'Cetak Laporan':'Print Report','Simpan & Pulihkan':'Backup & Restore','Masuk':'Sign in','Tambah':'Add',
  'Kasir':'Cashier','Laporan':'Reports','Ekspor/Impor':'Import/Export','Keluhan Lain':'Other Feedback',
  'Saldo kas tersedia':'Available cash balance','Sudah dikurangi riwayat penarikan yang tercatat.':'Already deducted recorded withdrawals.',
  'Nominal penarikan (Rp)':'Withdrawal amount (IDR)','Tanggal penarikan':'Withdrawal date',
  'Perkiraan saldo setelah penarikan':'Estimated balance after withdrawal','Catatan':'Notes','Catatan (opsional)':'Notes (optional)',
  'Kembali ke Kasir':'Back to Cashier','TRANSAKSI KAS KELUAR':'CASH OUTFLOW TRANSACTION',
  'Catat uang yang diambil dari kas usaha, beserta alasan dan tanggalnya.':'Record money taken from business cash, including the reason and date.',
  'Total uang yang sudah ditarik:':'Total cash withdrawn:','Uang yang tersedia:':'Available cash:',
  'Total uang fisik di laci kasir':'Total physical cash in the register','riwayat penarikan tercatat':'withdrawal records',
  'Catat Penarikan Kas Baru':'Record New Cash Withdrawal','Sisa Kas Menjadi:':'Remaining Cash:',
  'Masukkan jumlah penarikan lebih dari Rp0.':'Enter a withdrawal amount greater than IDR 0.',
  'Pilih tanggal penarikan.':'Select a withdrawal date.',
  'Penarikan berhasil disimpan ke riwayat akun Anda.':'Withdrawal saved to your account history.',
  'Penarikan belum berhasil disimpan. Periksa koneksi lalu coba lagi.':'Withdrawal could not be saved. Check your connection and try again.',
  'Terjadi kesalahan saat menyimpan data penarikan.':'An error occurred while saving the withdrawal.',
  'Penarikan berhasil dicatat':'Withdrawal recorded successfully',
  'Masalah aplikasi':'App issue','Data atau sinkronisasi':'Data or synchronization','Perhitungan keuangan':'Financial calculations',
  'Ekspor atau impor data':'Data export or import','Saran fitur':'Feature suggestion','Lainnya':'Other',
  'FAQ — Pertanyaan Umum':'FAQ — Frequently Asked Questions','Jawaban singkat untuk membantu penggunaan WiseProfit.':'Quick answers to help you use WiseProfit.',
  'Catat masalah atau saran yang ingin disampaikan tentang WiseProfit.':'Record an issue or suggestion about WiseProfit.',
  'Bagaimana cara menambahkan barang?':'How do I add a product?',
  'Bagaimana keuntungan penjualan dihitung?':'How is sales profit calculated?',
  'Bagaimana cara mencatat penarikan uang?':'How do I record a withdrawal?',
  'Bagaimana cara ekspor atau impor data?':'How do I export or import data?',
  'Bagaimana cara mengganti foto profil?':'How do I change my profile photo?',
  'Apakah data tersimpan di akun cloud?':'Is data saved to the cloud account?',
  'Punya keluhan lain?':'Have another issue?',
  'Isi keluhan atau saran dengan jelas. Untuk saat ini, formulir menyimpan catatan di browser perangkat ini; belum mengirimkannya ke admin secara otomatis.':'Describe your issue or suggestion clearly. For now, this form saves the note in this browser; it does not automatically send it to the administrator.',
  'Kategori':'Category','Judul keluhan':'Issue title','Detail keluhan atau saran':'Issue details or suggestion',
  'Simpan keluhan':'Save feedback','Salin teks keluhan':'Copy feedback text','Tersalin':'Copied',
  'Pilih file gambar untuk wallpaper.':'Choose an image file for the wallpaper.',
  'Ukuran wallpaper maksimal 3 MB.':'Wallpaper must be no larger than 3 MB.',
  'Wallpaper berhasil diterapkan di perangkat ini.':'Wallpaper applied on this device.',
  'Foto wallpaper tidak dapat dibaca.':'Could not read the wallpaper image.',
  'Pilih file foto dengan format gambar.':'Choose a valid image file.',
  'Ukuran foto maksimal 10 MB. Pilih foto yang lebih kecil.':'Photo must be no larger than 10 MB. Choose a smaller image.',
  'Pribadi':'Personal','Usaha':'Business','Nebula':'Nebula','Aurora Hijau':'Green Aurora','Biru Sapphire':'Sapphire Blue','Terang':'Light',
  'Gelap, tenang, dengan cahaya hijau dan biru':'Dark and calm, with green and blue light','Nuansa hijau yang segar':'Fresh green tones',
  'Biru sejuk dan modern':'Cool, modern blue','Latar cerah dan ringan':'Bright, light background',
  'Catatan lama':'Old note','Pilih foto':'Choose photo','Ganti foto':'Change photo','Keluar':'Log out',
  'Pengaturan tampilan':'Display settings','Warna aksen':'Accent color','Warna tabel':'Table color','Warna teks':'Text color',
  'Jenis huruf':'Font','Wallpaper':'Wallpaper','Simpan perubahan':'Save changes','Nama':'Name',
  'Email':'Email','Kata sandi':'Password','Alamat email':'Email address','Masuk ke akun':'Sign in to your account',
  'Buat akun baru':'Create a new account','Atur ulang kata sandi':'Reset password','Lanjutkan dengan Google':'Continue with Google',
  'atau masuk dengan email':'or sign in with email','PEMULIHAN AKUN':'ACCOUNT RECOVERY','MANAJEMEN USAHA':'BUSINESS MANAGEMENT',
  'Semua catatan usaha, dalam satu tempat.':'All your business records in one place.',
  'Mulai kelola usaha lebih rapi.':'Start managing your business more efficiently.',
  'Kelola stok, catat penjualan, dan pantau keuntungan usaha dalam satu tempat.':'Manage inventory, record sales, and track business profits in one place.',
  'Stok lebih teratur':'Organized inventory','Pantau barang dan persediaan usaha.':'Track products and inventory.',
  'Penjualan terpantau':'Track sales','Lihat catatan transaksi dengan lebih mudah.':'Review transaction records with ease.',
  'Keuangan lebih jelas':'Clearer finances','Pantau keuntungan dan arus kas usaha.':'Monitor profit and business cash flow.',
  'AKUN WISEPROFIT':'WISEPROFIT ACCOUNT','Masuk ke akun':'Sign in to your account',
  'Gunakan email dan kata sandi yang terdaftar.':'Use your registered email and password.',
  'Gunakan email aktif dan kata sandi yang kuat.':'Use an active email and a strong password.',
  'Masukkan email akun untuk menerima tautan pemulihan.':'Enter your account email to receive a recovery link.',
  'Masukkan alamat email Anda.':'Enter your email address.',
  'Format email belum benar. Periksa kembali alamat email Anda.':'Invalid email format. Please check your email address.',
  'Masukkan kata sandi Anda.':'Enter your password.',
  'Email atau kata sandi tidak cocok. Periksa kembali atau buat akun jika belum terdaftar.':'Email or password does not match. Check your details or create an account.',
  'Email ini sudah terdaftar. Pilih Masuk ke akun.':'This email is already registered. Choose Sign in.',
  'Email belum dikonfirmasi. Periksa kotak masuk email Anda terlebih dahulu.':'Email has not been confirmed. Check your inbox first.',
  'Tidak dapat terhubung ke layanan login. Periksa internet dan coba lagi.':'Could not connect to the sign-in service. Check your internet and try again.',
  'Online':'Online','Sync...':'Syncing...','Business Management':'Business Management',

  // Navigation, dashboard, tables, filters, and common actions
  'Ringkasan':'Overview','Ringkasan Usaha':'Business Overview','Dashboard':'Dashboard',
  'Total Penjualan':'Total Sales','Total Pembelian':'Total Purchases','Total Keuntungan':'Total Profit',
  'Keuntungan Bersih':'Net Profit','Keuntungan Kotor':'Gross Profit','Pertumbuhan Modal':'Capital Growth',
  'Arus Kas':'Cash Flow','Arus Kas Masuk':'Cash Inflow','Arus Kas Keluar':'Cash Outflow',
  'Modal Saat Ini':'Current Capital','Modal Usaha':'Business Capital','Kas Tersedia':'Available Cash',
  'Sisa Modal':'Remaining Capital','Sisa Kas Setelah Penarikan':'Cash Balance After Withdrawal',
  'Total Barang':'Total Products','Jumlah Stok':'Stock Quantity','Nilai Stok':'Inventory Value',
  'Stok Menipis':'Low Stock','Stok Habis':'Out of Stock','Belum ada data':'No data yet',
  'Tidak ada data':'No data available','Tidak ditemukan':'No results found',
  'Tampilkan':'Show','Sembunyikan':'Hide','Pilih':'Select','Pilih semua':'Select all',
  'Aksi':'Actions','Status':'Status','Tanggal':'Date','Waktu':'Time','Deskripsi':'Description',
  'Keterangan':'Details','Jumlah':'Amount','Total':'Total','Rincian':'Details',
  'Dari tanggal':'From date','Sampai tanggal':'To date','Rentang tanggal':'Date range',
  'Hari ini':'Today','Kemarin':'Yesterday','Minggu ini':'This week','Bulan ini':'This month',
  'Tahun ini':'This year','Pilih bulan':'Select month','Pilih tanggal':'Select date',
  'Terapkan':'Apply','Atur ulang':'Reset','Bersihkan filter':'Clear filters',
  'Unduh':'Download','Ekspor':'Export','Impor':'Import','Unggah':'Upload',
  'Pilih file':'Choose file','Pilih berkas':'Choose file','Simpan data':'Save data',
  'Simpan perubahan':'Save changes','Perbarui':'Update','Perbarui data':'Update data',
  'Konfirmasi':'Confirm','Ya, hapus':'Yes, delete','Tidak':'No','Ya':'Yes',
  'Tutup':'Close','Lanjut':'Continue','Lanjutkan':'Continue','Kembali':'Back',
  'Berhasil':'Successful','Gagal':'Failed','Memuat data...':'Loading data...',
  'Sedang memuat':'Loading','Sedang menyimpan':'Saving','Menyimpan...':'Saving...',
  'Data berhasil disimpan':'Data saved successfully','Data berhasil diperbarui':'Data updated successfully',
  'Data berhasil dihapus':'Data deleted successfully','Terjadi kesalahan':'An error occurred',
  'Silakan coba lagi':'Please try again','Coba lagi':'Try again',
  'Periksa koneksi internet Anda.':'Check your internet connection.',
  'Tidak ada transaksi':'No transactions','Riwayat Transaksi':'Transaction History',
  'Riwayat Penarikan':'Withdrawal History','Riwayat Penjualan':'Sales History',
  'Riwayat Pembelian':'Purchase History','Detail Transaksi':'Transaction Details',
  'Laporan Penjualan':'Sales Report','Laporan Keuangan':'Financial Report',
  'Laporan Ekuitas':'Equity Report','Laporan & Ekuitas':'Reports & Equity',
  'Cetak':'Print','Pratinjau':'Preview','Tampilan cetak':'Print Preview',
  'Nomor':'Number','No.':'No.','Nama produk':'Product Name','Nama barang':'Product Name',
  'Harga per unit':'Price per Unit','Harga satuan':'Unit Price','Harga beli per wadah':'Purchase Price per Package',
  'Jumlah wadah':'Number of Packages','Isi per wadah':'Units per Package',
  'Jumlah barang terjual':'Quantity Sold','Sisa stok':'Remaining Stock',
  'Keuntungan per unit':'Profit per Unit','Total keuntungan':'Total Profit',
  'Persentase keuntungan':'Profit Margin','Persentase laba':'Profit Percentage',
  'Simpan persentase laba':'Save Profit Percentage','Persentase laba yang disimpan':'Profit Savings Percentage',
  'Pengaturan Usaha':'Business Settings','Pengaturan Akun':'Account Settings',
  'Pengaturan':'Settings','Profil':'Profile','Profil & Catatan':'Profile & Notes',
  'Catatan usaha':'Business Notes','Nama profil':'Profile Name','Ubah nama':'Edit Name',
  'Ubah kata sandi':'Change Password','Foto profil':'Profile Photo',
  'Tema latar':'Background Theme','Warna latar':'Background Color',
  'Bahasa':'Language','Indonesia':'Indonesian','Inggris':'English',
  'Mode terang':'Light Mode','Mode gelap':'Dark Mode','Tampilan':'Appearance',
  'Panduan':'Guide','Bantuan':'Help','Pusat Bantuan':'Help Center',
  'Kirim masukan':'Send Feedback','Masukan':'Feedback','Keluhan':'Issue',
  'Keluar dari akun':'Log out','Apakah Anda yakin?':'Are you sure?',
  'Apakah Anda yakin ingin menghapus data ini?':'Are you sure you want to delete this data?',
  'Tindakan ini tidak dapat dibatalkan.':'This action cannot be undone.',
  'Hapus semua data':'Delete all data','Hapus semua':'Delete all',
  'Yakin ingin menghapus seluruh data?':'Are you sure you want to delete all data?',
  'Data tersimpan di cloud':'Data saved to the cloud','Sinkronisasi':'Synchronization',
  'Tersinkronisasi':'Synced','Belum tersinkronisasi':'Not synced','Status koneksi':'Connection status',
  'Terhubung':'Connected','Tidak terhubung':'Disconnected','Periksa koneksi':'Check connection',
  'Barang berhasil disimpan.':'Product saved successfully.',
  'Barang berhasil dihapus.':'Product deleted successfully.',
  'Perubahan berhasil disimpan.':'Changes saved successfully.',
  'Seluruh data barang Anda berhasil dikosongkan.':'All your product data has been cleared.',
  'Gagal mengosongkan seluruh data di Cloud. Silakan coba kembali.':'Failed to clear all cloud data. Please try again.',
  'Nama profil berhasil diperbarui.':'Profile name updated successfully.',
  'Nama belum berhasil disimpan. Periksa koneksi lalu coba lagi.':'The name could not be saved. Check your connection and try again.',
  'Belum berhasil keluar. Silakan coba lagi.':'Could not log out. Please try again.',
  'Data toko akun':'Account store data','barang aktif':'active products',
  'berhasil disimpan ke Cloud.':'saved to the cloud successfully.',
  'berhasil dihapus.':'deleted successfully.','tersimpan di Cloud.':'saved to the cloud.',
  'Catatan tambahan':'Additional notes','Masukkan catatan':'Enter notes',
  'Wajib diisi':'Required','Kolom ini wajib diisi':'This field is required',
  'Nilai tidak valid':'Invalid value','Jumlah harus lebih dari nol':'Amount must be greater than zero',
  'Nominal':'Amount','Nominal penarikan':'Withdrawal amount','Tanggal transaksi':'Transaction date',
  'Tanggal pembelian':'Purchase date','Tanggal penjualan':'Sale date',
  'Sisa uang':'Remaining money','Uang masuk':'Money in','Uang keluar':'Money out',
  'Pemasukan':'Income','Pengeluaran':'Expenses','Keuntungan':'Profit','Kerugian':'Loss',
  'Pembelian':'Purchases','Pembelian Barang':'Product Purchases','Barang':'Product',
  'Tambah transaksi':'Add transaction','Tambah catatan':'Add note','Edit data':'Edit data',
  'Pilih kategori':'Select category','Pilih status':'Select status','Pilih metode':'Select method',
  'Masukkan nama barang':'Enter product name','Masukkan jumlah barang':'Enter product quantity',
  'Masukkan harga beli':'Enter purchase price','Masukkan harga jual':'Enter selling price',
  'Harga tidak boleh kosong':'Price cannot be empty','Jumlah tidak boleh kosong':'Quantity cannot be empty',
  'Data belum tersedia':'Data is not available yet','Belum ada catatan':'No notes yet',
  'Belum ada riwayat penarikan.':'No withdrawal history yet.',
  'Belum ada barang yang ditambahkan.':'No products have been added yet.',
  'Tidak ada hasil yang cocok.':'No matching results.',
  'Pencarian':'Search','Cari berdasarkan nama barang':'Search by product name',
  'Urut berdasarkan':'Sort by','Urutan':'Order','Naik':'Ascending','Turun':'Descending',
  'Terakhir diperbarui':'Last updated','Dibuat pada':'Created at',
  'Semua status':'All statuses','Semua kategori':'All categories',
  'Data berhasil diimpor':'Data imported successfully','Data berhasil diekspor':'Data exported successfully',
  'Gagal mengimpor data':'Failed to import data','Gagal mengekspor data':'Failed to export data',
  'Format file tidak didukung':'Unsupported file format','File terlalu besar':'File is too large',
  'Pilih file terlebih dahulu':'Choose a file first','Unduh template':'Download template',
  'Pulihkan data':'Restore data','Cadangkan data':'Back up data','Cadangkan & Pulihkan':'Backup & Restore',
  'Penyimpanan cloud':'Cloud storage','Penyimpanan lokal':'Local storage',
  'Saldo awal':'Opening balance','Saldo akhir':'Closing balance','Saldo kas saat ini':'Current cash balance',
  'Modal awal':'Initial capital','Modal akhir':'Ending capital','Perubahan modal':'Capital change',
  'Pertumbuhan':'Growth','Persentase pertumbuhan':'Growth percentage',
  'Penjualan hari ini':'Today’s sales','Keuntungan hari ini':'Today’s profit',
  'Data akun':'Account data','Akun Anda':'Your account','Belum punya akun?':'Don’t have an account?',
  'Sudah punya akun?':'Already have an account?','Daftar':'Sign up','Daftar sekarang':'Sign up now',
  'Lupa kata sandi?':'Forgot password?','Kirim tautan pemulihan':'Send recovery link',
  'Kata sandi baru':'New password','Konfirmasi kata sandi':'Confirm password',
  'Kata sandi minimal 6 karakter':'Password must be at least 6 characters',
  'Pendaftaran berhasil':'Registration successful','Berhasil masuk':'Signed in successfully',
  'Berhasil keluar':'Signed out successfully','Tautan pemulihan telah dikirim':'Recovery link sent',
  'Terjadi kesalahan saat memuat data.':'An error occurred while loading data.',
  'Data sedang disinkronkan.':'Data is syncing.',
  'Perubahan belum disimpan':'Unsaved changes','Yakin ingin membatalkan?':'Are you sure you want to cancel?',
};

const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const ATTRS = ['placeholder', 'title', 'aria-label'];

function translateText(node: Text, english: boolean) {
  const current = node.nodeValue ?? '';
  const original = originalText.get(node);
  if (!english) {
    if (original !== undefined && current !== original) node.nodeValue = original;
    return;
  }
  if (original !== undefined && current === ID_TO_EN[original]) return;
  const clean = current.trim();
  // Translate exact labels first, then known phrases inside dynamic messages
  // such as "Penarikan kas Rp 10.000 berhasil disimpan ke Cloud.".
  let translated = ID_TO_EN[clean];
  if (!translated) {
    translated = clean;
    const phrases = Object.keys(ID_TO_EN).sort((a, b) => b.length - a.length);
    for (const phrase of phrases) {
      if (translated.includes(phrase)) translated = translated.split(phrase).join(ID_TO_EN[phrase]);
    }
  }
  if (translated !== clean) {
    if (original === undefined) originalText.set(node, current);
    node.nodeValue = current.replace(clean, translated);
  }
}

function translateElement(element: Element, english: boolean) {
  const map = originalAttributes.get(element) ?? new Map<string, string>();
  for (const attr of ATTRS) {
    const value = element.getAttribute(attr);
    if (value == null) continue;
    const original = map.get(attr);
    if (!english) {
      if (original !== undefined && value !== original) element.setAttribute(attr, original);
      continue;
    }
    const source = original ?? value;
    const translated = ID_TO_EN[source];
    if (translated && value !== translated) {
      if (original === undefined) map.set(attr, value);
      element.setAttribute(attr, translated);
    }
  }
  if (map.size) originalAttributes.set(element, map);
}

export function installAutoTranslation(language: 'id' | 'en') {
  const root = document.getElementById('root');
  if (!root) return () => {};
  const process = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) translateText(node as Text, language === 'en');
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      translateElement(el, language === 'en');
      el.childNodes.forEach(process);
    }
  };
  process(root);
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'characterData') process(record.target);
      record.addedNodes.forEach(process);
      if (record.type === 'attributes' && record.target instanceof Element) translateElement(record.target, language === 'en');
    }
  });
  observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  return () => observer.disconnect();
}
