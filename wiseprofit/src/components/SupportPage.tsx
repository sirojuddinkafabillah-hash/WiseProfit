import React, { useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SupportChatWidget } from './SupportChatWidget';
import { SupportTicketList } from './SupportTicketList';
import { ArrowLeft, CircleHelp, MessageSquareWarning, ChevronDown, Send, Copy, CheckCircle2, Download } from 'lucide-react';

interface SupportPageProps {
  language: 'id' | 'en';
  mode: 'faq' | 'complaints';
  onBackToInventory: () => void;
  onGoToComplaints: () => void;
}

type FeedbackRecord = {
  id: number;
  category: string;
  subject: string;
  detail: string;
  createdAt: string;
};

const FAQS = {
  en: [
    { q: 'How do I add an item?', a: 'Open Cashier & Stock, then enter the item name, container quantity, purchase price, and selling price. Review the values before saving.' },
    { q: 'How is sales profit calculated?', a: 'Profit is calculated from the selling price minus the unit cost, multiplied by the number of units sold. Check that purchase and selling prices are accurate.' },
    { q: 'How do I record a cash withdrawal?', a: 'Open Withdrawals, enter the amount, date, and note. A withdrawal cannot exceed the available cash balance.' },
    { q: 'How do I import or export data?', a: 'Open Import/Export. Review the preview before importing. Download a JSON backup regularly, and keep the file somewhere safe. Excel and CSV exports are useful for spreadsheets.' },
    { q: 'How do I restore a backup?', a: 'Open the backup and export window, select your JSON backup, and follow the confirmation messages. Sign in to the correct account first.' },
    { q: 'Is my data sent to the cloud?', a: 'When you are signed in and cloud storage is connected, the app can sync data to your account. Check the connection/sync status and keep a separate backup.' },
    { q: 'Does the complaint form contact an administrator?', a: 'Not automatically. The form saves a copy in this browser. Download or copy the complaint and send it through your official support channel.' },
  ],
  id: [
    { q: 'Bagaimana cara menambah barang?', a: 'Buka Kasir & Inventori, lalu isi nama barang, jumlah isi wadah, harga beli, dan harga jual. Periksa kembali nilainya sebelum menyimpan.' },
    { q: 'Bagaimana laba penjualan dihitung?', a: 'Laba dihitung dari selisih harga jual dan modal per unit, dikalikan jumlah unit yang terjual. Pastikan harga beli dan harga jual sudah benar.' },
    { q: 'Bagaimana mencatat penarikan kas?', a: 'Buka halaman Penarikan, masukkan nominal, tanggal, dan catatan. Nominal penarikan tidak boleh melebihi saldo kas yang tersedia.' },
    { q: 'Bagaimana mengimpor atau mengekspor data?', a: 'Buka Impor/Ekspor. Periksa pratinjau sebelum mengimpor. Unduh cadangan JSON secara berkala dan simpan di tempat aman. Ekspor Excel dan CSV dapat digunakan di aplikasi spreadsheet.' },
    { q: 'Bagaimana memulihkan cadangan?', a: 'Buka jendela cadangan dan ekspor, pilih file cadangan JSON, lalu ikuti pesan konfirmasi. Pastikan Anda masuk ke akun yang benar.' },
    { q: 'Apakah data tersimpan di cloud?', a: 'Jika Anda masuk dan penyimpanan cloud terhubung, data dapat disinkronkan ke akun Anda. Periksa status koneksi/sinkronisasi dan tetap simpan cadangan terpisah.' },
    { q: 'Apakah formulir keluhan langsung menghubungi admin?', a: 'Belum otomatis. Formulir menyimpan salinan di browser ini. Unduh atau salin keluhan, lalu kirim melalui kanal bantuan resmi.' },
  ],
};

const CATEGORIES = [
  { value: 'App issue', en: 'App issue', id: 'Masalah aplikasi' },
  { value: 'Data or synchronization', en: 'Data or synchronization', id: 'Data atau sinkronisasi' },
  { value: 'Financial calculations', en: 'Financial calculations', id: 'Perhitungan keuangan' },
  { value: 'Data export or import', en: 'Data export or import', id: 'Impor atau ekspor data' },
  { value: 'Feature suggestion', en: 'Feature suggestion', id: 'Saran fitur' },
  { value: 'Other', en: 'Other', id: 'Lainnya' },
];

function getSavedFeedback(): FeedbackRecord[] {
  try {
    const parsed = JSON.parse(localStorage.getItem('wiseprofit_local_feedback') || '[]');
    return Array.isArray(parsed) ? parsed.filter((entry: any) =>
      entry && typeof entry.subject === 'string' && typeof entry.detail === 'string'
    ) : [];
  } catch {
    return [];
  }
}

export const SupportPage: React.FC<SupportPageProps> = ({ language, mode, onBackToInventory, onGoToComplaints }) => {
  const { user } = useAuth();
  const isId = language === 'id';
  const t = (id: string, en: string) => isId ? id : en;
  const faqs = FAQS[language];
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [category, setCategory] = useState('App issue');
  const [subject, setSubject] = useState('');
  const [detail, setDetail] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [feedbackVersion, setFeedbackVersion] = useState(0);
  const savedFeedback = useMemo(() => getSavedFeedback(), [feedbackVersion]);

  const complaintText = [
    t('Keluhan WiseProfit', 'WiseProfit feedback'),
    `${t('Kategori', 'Category')}: ${CATEGORIES.find(c => c.value === category)?.[language] || category}`,
    `${t('Judul', 'Subject')}: ${subject.trim()}`,
    `${t('Detail', 'Details')}: ${detail.trim()}`,
    `${t('Tanggal', 'Date')}: ${new Date().toLocaleString(language === 'id' ? 'id-ID' : 'en-US')}`,
  ].join('\\n');

  const handleSave = async () => {
    if (!subject.trim() || !detail.trim()) {
      setMessage(t('Isi judul dan detail keluhan terlebih dahulu.', 'Please enter both a subject and details.'));
      return;
    }
    if (!user) {
      setMessage(t('Silakan masuk ke akun WiseProfit sebelum mengirim keluhan.', 'Please sign in to WiseProfit before submitting a ticket.'));
      return;
    }
    try {
      const { data: ticket, error } = await supabase.from('support_tickets').insert({
        user_id: user.uid, user_email: user.email, category,
        subject: subject.trim(), detail: detail.trim(),
      }).select('id').single();
      if (error || !ticket) throw error || new Error('Ticket was not created.');
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (token) {
        try {
          await fetch('/api/support/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({ ticketId: ticket.id }),
          });
        } catch (notifyError) { console.warn('Ticket saved but email notification failed:', notifyError); }
      }
      setMessage(t('Keluhan berhasil dikirim. Nomor tiket: ', 'Ticket submitted. Ticket ID: ') + ticket.id);
      setSubject('');
      setDetail('');
    } catch (error) {
      console.error('Could not create support ticket:', error);
      setMessage(t('Keluhan belum terkirim. Pastikan migrasi Supabase sudah dijalankan, lalu coba lagi.', 'Ticket was not submitted. Ensure the Supabase migration is applied, then try again.'));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(complaintText);
      setCopied(true);
      setMessage(t('Teks keluhan berhasil disalin. Kirim melalui kanal bantuan resmi.', 'Feedback copied. Send it through your official support channel.'));
    } catch {
      setMessage(t('Penyalinan otomatis tidak tersedia. Pilih lalu salin teks keluhan secara manual.', 'Automatic copying is unavailable. Select and copy the feedback text manually.'));
    }
  };

  const handleDownload = () => {
    const blob = new Blob([complaintText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `wiseprofit-feedback-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    setMessage(t('File keluhan diunduh. Anda dapat mengirimkannya secara manual.', 'Feedback file downloaded. You can send it manually.'));
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">{mode === 'faq' ? <CircleHelp className="h-5 w-5" /> : <MessageSquareWarning className="h-5 w-5" />}</div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{mode === 'faq' ? t('FAQ — Pertanyaan Umum', 'FAQ — Frequently Asked Questions') : t('Keluhan dan Saran', 'Complaints & Suggestions')}</h1>
            <p className="mt-1 text-sm text-slate-600">{mode === 'faq' ? t('Jawaban singkat untuk membantu penggunaan WiseProfit.', 'Quick answers to help you use WiseProfit.') : t('Catat masalah atau saran tentang WiseProfit.', 'Record an issue or suggestion about WiseProfit.')}</p>
          </div>
        </div>
        <button type="button" onClick={onBackToInventory} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /> {t('Kembali ke Kasir', 'Back to Cashier')}</button>
      </div>

      {mode === 'faq' ? (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={faq.q} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50">
                <span>{faq.q}</span><ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === index && <p className="border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-600">{faq.a}</p>}
            </div>
          ))}
          <button type="button" onClick={onGoToComplaints} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"><MessageSquareWarning className="h-4 w-4" /> {t('Punya keluhan lain?', 'Have another issue?')}</button>
        </div>
      ) : (
        <div className="space-y-5">
          <SupportChatWidget language={language} />
          <SupportTicketList language={language} />
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
            {t('Keluhan dikirim ke sistem tiket jika database Supabase sudah dikonfigurasi. Jika email belum aktif, tiket tetap tersimpan.', 'Feedback is sent to the support ticket system when Supabase is configured. If email is not configured, the ticket is still saved.')}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-slate-800">{t('Kategori', 'Category')}
                <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-800">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c[language]}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-800">{t('Judul keluhan', 'Subject')}
                <input value={subject} onChange={e => setSubject(e.target.value)} maxLength={120} placeholder={t('Contoh: Data tidak tersimpan', 'Example: Data is not saving')} className="rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-800 placeholder:text-slate-400" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-800">{t('Detail keluhan atau saran', 'Complaint or suggestion details')}
                <textarea value={detail} onChange={e => setDetail(e.target.value)} rows={5} maxLength={3000} placeholder={t('Jelaskan langkah yang dilakukan dan masalah yang muncul...', 'Describe the steps you took and what went wrong...')} className="resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal leading-6 text-slate-800 placeholder:text-slate-400" />
              </label>
              {message && <p role="status" className="text-sm text-slate-700">{message}</p>}
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void handleSave()} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"><Send className="h-4 w-4" /> {t('Kirim ke developer', 'Submit ticket')}</button>
                <button type="button" onClick={handleCopy} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Copy className="h-4 w-4" /> {copied ? t('Tersalin', 'Copied') : t('Salin teks', 'Copy text')}</button>
                <button type="button" onClick={handleDownload} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" /> {t('Unduh sebagai TXT', 'Download as TXT')}</button>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-900">{t('Keluhan tersimpan di browser ini', 'Feedback saved in this browser')}</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{savedFeedback.length}</span>
            </div>
            {savedFeedback.length === 0 ? (
              <p className="text-sm text-slate-500">{t('Belum ada keluhan tersimpan.', 'No saved feedback yet.')}</p>
            ) : (
              <ul className="space-y-3">
                {[...savedFeedback].reverse().map(entry => (
                  <li key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">{entry.subject}</p>
                      <span className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString(isId ? 'id-ID' : 'en-US')}</span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-blue-700">{CATEGORIES.find(c => c.value === entry.category)?.[language] || entry.category}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{entry.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
