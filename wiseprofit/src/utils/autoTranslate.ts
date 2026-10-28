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
  const translated = ID_TO_EN[clean];
  if (translated) {
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
