import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { SupportTicketList } from './SupportTicketList';
import { SupportChatWidget } from './SupportChatWidget';
import { ArrowLeft, CircleHelp, MessageSquareWarning, ChevronDown, Send } from 'lucide-react';

interface SupportPageProps {
  language: 'id' | 'en';
  mode: 'faq' | 'complaints';
  onBackToInventory: () => void;
  onGoToComplaints?: () => void;
}

const FAQS = {
  en: [
    { q: 'How do I add an item?', a: 'Open Cashier & Stock, then enter the item name, container quantity, purchase price, and selling price. Review the values before saving.' },
    { q: 'How is sales profit calculated?', a: 'Profit is calculated from the selling price minus the unit cost, multiplied by the number of units sold. Check that purchase and selling prices are accurate.' },
    { q: 'How do I record a cash withdrawal?', a: 'Open Withdrawals, enter the amount, date, and note. A withdrawal cannot exceed the available cash balance.' },
    { q: 'How do I import or export data?', a: 'Open Import/Export. Review the preview before importing. Download a JSON backup regularly, and keep the file somewhere safe. Excel and CSV exports are useful for spreadsheets.' },
    { q: 'How do I restore a backup?', a: 'Open the backup and export window, select your JSON backup, and follow the confirmation messages. Sign in to the correct account first.' },
    { q: 'Is my data sent to the cloud?', a: 'When you are signed in and cloud storage is connected, the app can sync data to your account. Check the connection/sync status and keep a separate backup.' },
    { q: 'Does submitting feedback notify the developer?', a: 'Your feedback is saved as a support ticket. Email notifications depend on whether the notification service is configured.' },
  ],
  id: [
    { q: 'Bagaimana cara menambah barang?', a: 'Buka Kasir & Inventori, lalu isi nama barang, jumlah isi wadah, harga beli, dan harga jual. Periksa kembali nilainya sebelum menyimpan.' },
    { q: 'Bagaimana laba penjualan dihitung?', a: 'Laba dihitung dari selisih harga jual dan modal per unit, dikalikan jumlah unit yang terjual. Pastikan harga beli dan harga jual sudah benar.' },
    { q: 'Bagaimana mencatat penarikan kas?', a: 'Buka halaman Penarikan, masukkan nominal, tanggal, dan catatan. Nominal penarikan tidak boleh melebihi saldo kas yang tersedia.' },
    { q: 'Bagaimana mengimpor atau mengekspor data?', a: 'Buka Impor/Ekspor. Periksa pratinjau sebelum mengimpor. Unduh cadangan JSON secara berkala dan simpan di tempat aman. Ekspor Excel dan CSV dapat digunakan di aplikasi spreadsheet.' },
    { q: 'Bagaimana memulihkan cadangan?', a: 'Buka jendela cadangan dan ekspor, pilih file cadangan JSON, lalu ikuti pesan konfirmasi. Pastikan Anda masuk ke akun yang benar.' },
    { q: 'Apakah data tersimpan di cloud?', a: 'Jika Anda masuk dan penyimpanan cloud terhubung, data dapat disinkronkan ke akun Anda. Periksa status koneksi/sinkronisasi dan tetap simpan cadangan terpisah.' },
    { q: 'Apakah pengiriman keluhan memberi tahu developer?', a: 'Keluhan disimpan sebagai tiket bantuan. Pemberitahuan email bergantung pada konfigurasi layanan notifikasi.' },
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

export const SupportPage: React.FC<SupportPageProps> = ({ language, mode: initialMode, onBackToInventory }) => {
  const { user } = useAuth();
  const isId = language === 'id';
  const [mode, setMode] = useState<'faq' | 'complaints'>(initialMode);
  const t = (id: string, en: string) => isId ? id : en;
  const faqs = FAQS[language];
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [category, setCategory] = useState('App issue');
  const [subject, setSubject] = useState('');
  const [detail, setDetail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!subject.trim() || !detail.trim()) {
      setMessage(t('Isi judul dan detail.', 'Enter a subject and details.'));
      return;
    }
    if (!user) {
      setMessage(t('Masuk untuk mengirim feedback.', 'Sign in to send feedback.'));
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
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
      setMessage(t('Terkirim. ID tiket: ', 'Sent. Ticket ID: ') + ticket.id);
      setSubject('');
      setDetail('');
    } catch (error) {
      console.error('Could not create support ticket:', error);
      setMessage(t('Gagal mengirim. Coba lagi nanti.', 'Could not send. Try again later.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">{mode === 'faq' ? <CircleHelp className="h-5 w-5" /> : <MessageSquareWarning className="h-5 w-5" />}</div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{mode === 'faq' ? t('FAQ', 'FAQ') : t('Feedback', 'Feedback')}</h1>
            <p className="mt-1 text-sm text-slate-600">{mode === 'faq' ? t('Bantuan singkat WiseProfit.', 'Quick WiseProfit help.') : t('Kirim masalah atau saran.', 'Report an issue or suggestion.')}</p>
          </div>
        </div>
        <button type="button" onClick={onBackToInventory} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /> {t('Kembali ke Kasir', 'Back to Cashier')}</button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <button type="button" onClick={() => setMode('faq')} aria-pressed={mode === 'faq'} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${mode === 'faq' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><CircleHelp className="h-4 w-4" />{t('FAQ', 'FAQ')}</button>
        <button type="button" onClick={() => setMode('complaints')} aria-pressed={mode === 'complaints'} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${mode === 'complaints' ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><MessageSquareWarning className="h-4 w-4" />{t('Feedback', 'Feedback')}</button>
      </div>

      {mode === 'faq' ? (
        <div className="space-y-3">
          <SupportChatWidget language={language} onCreateTicket={() => setMode('complaints')} />
          {faqs.map((faq, index) => (
            <div key={faq.q} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50">
                <span>{faq.q}</span><ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === index && <p className="border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-600">{faq.a}</p>}
            </div>
          ))}
          <button type="button" onClick={() => setMode('complaints')} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"><MessageSquareWarning className="h-4 w-4" /> {t('Butuh bantuan lain?', 'Need more help?')}</button>
        </div>
      ) : (
        <div className="space-y-5">
          <SupportTicketList language={language} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-slate-800">{t('Kategori', 'Category')}
                <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-800">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c[language]}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-800">{t('Judul', 'Subject')}
                <input value={subject} onChange={e => setSubject(e.target.value)} maxLength={120} placeholder={t('Contoh: Data tidak tersimpan', 'Example: Data is not saving')} className="rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-800 placeholder:text-slate-400" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-800">{t('Detail', 'Details')}
                <textarea value={detail} onChange={e => setDetail(e.target.value)} rows={5} maxLength={3000} placeholder={t('Jelaskan langkah yang dilakukan dan masalah yang muncul...', 'Describe the steps you took and what went wrong...')} className="resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal leading-6 text-slate-800 placeholder:text-slate-400" />
              </label>
              {message && <p role="status" className="text-sm text-slate-700">{message}</p>}
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void handleSave()} disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"><Send className="h-4 w-4" /> {isSubmitting ? t('Mengirim…', 'Submitting…') : t('Kirim', 'Send')}</button>
              </div>
            </div>
          </div>

        </div>
      )}
    </section>
  );
};
