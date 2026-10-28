import React, { useState } from 'react';
import { ArrowLeft, CircleHelp, MessageSquareWarning, ChevronDown, Send, Copy, CheckCircle2 } from 'lucide-react';

interface SupportPageProps {
  mode: 'faq' | 'complaints';
  onBackToInventory: () => void;
  onGoToComplaints: () => void;
}

const FAQS = [
  { q: 'How do I add an item?', a: 'Open Cashier & Stock, then use the item form to enter the name, quantity, purchase price, and selling price. Double-check the numbers before saving.' },
  { q: 'How is sales profit calculated?', a: 'Profit is calculated by multiplying the difference between selling price and unit cost by the number of units sold. Make sure the recorded purchase and selling prices are correct.' },
  { q: 'How do I record a cash withdrawal?', a: 'Open Withdrawals, enter the amount, date, and note. Make sure the amount does not exceed available cash before saving.' },
  { q: 'How do I export or import data?', a: 'Open Import/Export. To import, choose a supported file and review the preview before applying the data. To export, choose an available Excel, CSV, or backup option.' },
  { q: 'How do I change my profile photo?', a: 'Open the profile panel by clicking your profile photo, then select Change photo. Choose an image that meets the size limit shown in the app.' },
  { q: 'Is my data saved to my cloud account?', a: 'For connected accounts, data can sync with the app's cloud service. Make sure syncing is complete before closing the app, and export backups regularly.' },
];

export const SupportPage: React.FC<SupportPageProps> = ({ mode, onBackToInventory, onGoToComplaints }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [category, setCategory] = useState('App issue');
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
      setMessage('Feedback saved in this browser. It has not been sent to an administrator.');
    } catch {
      setMessage('Feedback could not be saved in this browser. Copy the text to avoid losing it.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(complaintText);
      setCopied(true);
      setMessage('Feedback copied. You can send it through the official support channel.');
    } catch {
      setMessage('Automatic copying is unavailable in this browser. Select and copy the feedback text manually.');
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
        <button type="button" onClick={onBackToInventory} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /> Back to Cashier</button>
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
          <div className="mb-5 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">Describe your issue or suggestion clearly. For now, this form saves feedback in this browser and does not automatically send it to an administrator.</div>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-800">Kategori
              <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-800">
                <option>App issue</option><option>Data or synchronization</option><option>Financial calculations</option><option>Data export or import</option><option>Feature suggestion</option><option>Other</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800">Judul keluhan
              <input value={subject} onChange={e => setSubject(e.target.value)} maxLength={120} placeholder="Example: Data is not saving" className="rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-800 placeholder:text-slate-400" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-800">Detail keluhan atau saran
              <textarea value={detail} onChange={e => setDetail(e.target.value)} rows={5} maxLength={3000} placeholder="Jelaskan langkah yang dilakukan dan masalah yang muncul..." className="resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal leading-6 text-slate-800 placeholder:text-slate-400" />
            </label>
            {message && <p role="status" className="text-sm text-slate-700">{message}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleSave} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"><Send className="h-4 w-4" /> Save feedback</button>
              <button type="button" onClick={handleCopy} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Copy className="h-4 w-4" /> {copied ? 'Tersalin' : 'Salin teks keluhan'}</button>
            </div>
            {copied && <p className="flex items-center gap-2 text-sm text-green-700"><CheckCircle2 className="h-4 w-4" /> Teks keluhan siap ditempel ke kanal bantuan.</p>}
          </div>
        </div>
      )}
    </section>
  );
};
