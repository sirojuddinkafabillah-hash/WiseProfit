import React, { useState } from 'react';
import { ArrowLeft, CircleHelp, MessageSquareWarning, ChevronDown, Send, Copy, CheckCircle2 } from 'lucide-react';

interface SupportPageProps {
  mode: 'faq' | 'complaints';
  onBackToInventory: () => void;
  onGoToComplaints: () => void;
}

const FAQS = [
  { q: 'Bagaimana cara menambahkan barang?', a: 'Buka menu Kasir & Stok, lalu gunakan formulir pencatatan barang untuk memasukkan nama, jumlah, harga beli, dan harga jual. Periksa kembali angka sebelum menyimpan.' },
  { q: 'Bagaimana keuntungan penjualan dihitung?', a: 'Keuntungan dihitung dari selisih harga jual dan biaya per unit, dikalikan jumlah barang yang terjual. Pastikan harga beli dan harga jual yang dicatat sudah benar.' },
  { q: 'Bagaimana cara mencatat penarikan uang?', a: 'Buka menu Penarikan Uang, masukkan nominal, tanggal, dan catatan. Pastikan nominal tidak melebihi kas tersedia sebelum menyimpan.' },
  { q: 'Bagaimana cara ekspor atau impor data?', a: 'Buka menu Ekspor dan Impor Data. Untuk impor, pilih berkas yang didukung dan periksa pratinjau sebelum menerapkan data. Untuk ekspor, gunakan pilihan berkas Excel, CSV, atau cadangan yang tersedia.' },
  { q: 'Bagaimana cara mengganti foto profil?', a: 'Buka panel profil dengan mengeklik foto profil, lalu pilih Ganti foto. Pilih berkas gambar yang sesuai batas ukuran yang ditampilkan aplikasi.' },
  { q: 'Apakah data tersimpan di akun cloud?', a: 'Untuk akun yang terhubung, data dapat disinkronkan dengan layanan cloud aplikasi. Pastikan indikator sinkronisasi selesai sebelum menutup aplikasi, dan lakukan ekspor cadangan secara berkala.' },
];

export const SupportPage: React.FC<SupportPageProps> = ({ mode, onBackToInventory, onGoToComplaints }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [category, setCategory] = useState('Masalah aplikasi');
  const [subject, setSubject] = useState('');
  const [detail, setDetail] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const complaintText = `Keluhan WiseProfit\nKategori: ${category}\nJudul: ${subject}\nDetail: ${detail}\nTanggal: ${new Date().toLocaleString('id-ID')}`;

  const handleSave = () => {
    if (!subject.trim() || !detail.trim()) {
      setMessage('Isi judul dan detail keluhan terlebih dahulu.');
      return;
    }
    try {
      const key = 'wiseprofit_local_feedback';
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      current.push({ id: Date.now(), category, subject: subject.trim(), detail: detail.trim(), createdAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(current));
      setMessage('Keluhan tersimpan di browser ini. Keluhan belum terkirim ke admin.');
    } catch {
      setMessage('Keluhan tidak dapat disimpan di browser. Salin teks keluhan agar tidak hilang.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(complaintText);
      setCopied(true);
      setMessage('Teks keluhan berhasil disalin. Anda dapat mengirimkannya melalui kanal bantuan resmi.');
    } catch {
      setMessage('Penyalinan otomatis tidak tersedia di browser ini. Pilih dan salin teks keluhan secara manual.');
    }
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">{mode === 'faq' ? <CircleHelp className="h-5 w-5" /> : <MessageSquareWarning className="h-5 w-5" />}</div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{mode === 'faq' ? 'FAQ — Pertanyaan Umum' : 'Keluhan Lain'}</h1>
            <p className="mt-1 text-sm text-slate-600">{mode === 'faq' ? 'Jawaban singkat untuk membantu penggunaan WiseProfit.' : 'Catat masalah atau saran yang ingin disampaikan tentang WiseProfit.'}</p>
          </div>
        </div>
        <button type="button" onClick={onBackToInventory} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /> Kembali ke Kasir</button>
      </div>

      {mode === 'faq' ? (
        <div className="space-y-3">
          {FAQS.map((faq, index) => (
            <div key={faq.q} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50">
                <span>{faq.q}</span><ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === index && <p className="border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-600">{faq.a}</p>}
            </div>
          ))}
          <button type="button" onClick={onGoToComplaints} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"><MessageSquareWarning className="h-4 w-4" /> Punya keluhan lain?</button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">Isi keluhan atau saran dengan jelas. Untuk saat ini, formulir menyimpan catatan di browser perangkat ini; belum mengirimkannya ke admin secara otomatis.</div>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-800">Kategori
              <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-800">
                <option>Masalah aplikasi</option><option>Data atau sinkronisasi</option><option>Perhitungan keuangan</option><option>Ekspor atau impor data</option><option>Saran fitur</option><option>Lainnya</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800">Judul keluhan
              <input value={subject} onChange={e => setSubject(e.target.value)} maxLength={120} placeholder="Contoh: Data tidak tersimpan" className="rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-800 placeholder:text-slate-400" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800">Detail keluhan atau saran
              <textarea value={detail} onChange={e => setDetail(e.target.value)} rows={5} maxLength={3000} placeholder="Jelaskan langkah yang dilakukan dan masalah yang muncul..." className="resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal leading-6 text-slate-800 placeholder:text-slate-400" />
            </label>
            {message && <p role="status" className="text-sm text-slate-700">{message}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleSave} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"><Send className="h-4 w-4" /> Simpan keluhan</button>
              <button type="button" onClick={handleCopy} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Copy className="h-4 w-4" /> {copied ? 'Tersalin' : 'Salin teks keluhan'}</button>
            </div>
            {copied && <p className="flex items-center gap-2 text-sm text-green-700"><CheckCircle2 className="h-4 w-4" /> Teks keluhan siap ditempel ke kanal bantuan.</p>}
          </div>
        </div>
      )}
    </section>
  );
};
