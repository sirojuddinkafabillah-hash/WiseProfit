import React, { useState } from 'react';
import { Bot, Send, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Props = { language: 'id' | 'en'; onCreateTicket: () => void };
type ChatMessage = { role: 'user' | 'assistant'; content: string };

export const SupportChatWidget: React.FC<Props> = ({ language, onCreateTicket }) => {
  const isId = language === 'id';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || busy) return;
    if (content.length > 1500) {
      setError(isId ? 'Pesan maksimal 1.500 karakter.' : 'Messages are limited to 1,500 characters.');
      return;
    }
    setError('');
    const next: ChatMessage[] = [...messages, { role: 'user', content }].slice(-10);
    setMessages(next);
    setInput('');
    setBusy(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error(isId ? 'Silakan masuk terlebih dahulu.' : 'Please sign in first.');
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ messages: next }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 503) throw new Error(isId ? 'Layanan chat AI belum dikonfigurasi di server. Kamu tetap bisa membuat tiket bantuan.' : 'AI chat is not configured on the server yet. You can still create a support ticket.');
        throw new Error(typeof result.error === 'string' ? result.error : (isId ? 'Layanan AI sedang bermasalah. Coba lagi.' : 'The AI service is having trouble. Please try again.'));
      }
      if (typeof result.answer !== 'string' || !result.answer.trim()) throw new Error(isId ? 'AI belum memberikan jawaban. Silakan coba lagi.' : 'The AI returned no answer. Please try again.');
      setMessages(current => [...current, { role: 'assistant', content: result.answer.trim() }].slice(-10));
    } catch (e) {
      const msg = e instanceof Error && e.name === 'AbortError'
        ? (isId ? 'Waktu tunggu habis. Coba pertanyaan yang lebih singkat.' : 'The request timed out. Try a shorter question.')
        : e instanceof Error ? e.message : (isId ? 'Bantuan AI belum tersedia.' : 'AI support is unavailable.');
      setError(msg);
    } finally {
      clearTimeout(timeout);
      setBusy(false);
    }
  };

  return <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
    <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-4 py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white"><Bot className="h-5 w-5" /></div>
      <div className="min-w-0 flex-1">
        <h2 className="font-bold text-slate-900">{isId ? 'Asisten WiseProfit' : 'WiseProfit Assistant'}</h2>
        <p className="mt-0.5 text-xs text-slate-500">{isId ? 'Tanyakan sekarang dan dapatkan jawaban otomatis.' : 'Ask a question and get an instant reply.'}</p>
      </div>
      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{isId ? 'Chat AI' : 'AI Chat'}</span>
    </div>
    <div className="space-y-3 p-4">
      {messages.length === 0 ? (
        <div className="rounded-xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          <p className="mb-1 font-semibold text-slate-800">{isId ? 'Ada yang bisa dibantu?' : 'How can I help?'}</p>
          {isId ? 'Tanyakan cara memakai WiseProfit, pencatatan penjualan, penarikan kas, atau impor dan ekspor data.' : 'Ask about using WiseProfit, sales records, cash withdrawals, or importing and exporting data.'}
        </div>
      ) : (
        <div className="max-h-80 space-y-3 overflow-y-auto pr-1" aria-live="polite">
          {messages.map((m, i) => <div key={i} className={'whitespace-pre-wrap break-words rounded-xl p-3 text-sm leading-6 ' + (m.role === 'user' ? 'ml-6 bg-blue-700 text-white' : 'mr-4 bg-slate-100 text-slate-800')}>{m.content}</div>)}
          {busy && <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />{isId ? 'AI sedang menjawab…' : 'AI is responding…'}</p>}
        </div>
      )}
      {error && <p role="alert" className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
      <form onSubmit={send} className="flex items-end gap-2">
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={2} maxLength={1500} disabled={busy} aria-label={isId ? 'Tulis pertanyaan' : 'Write a question'} placeholder={isId ? 'Tulis pertanyaan… (Enter untuk mengirim)' : 'Ask a question… (Enter to send)'} className="min-h-12 min-w-0 flex-1 resize-y rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50" />
        <button disabled={busy || !input.trim()} type="submit" className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-blue-700 px-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"><Send className="h-4 w-4" /><span>{isId ? 'Kirim' : 'Send'}</span></button>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>{isId ? 'Jawaban AI bisa keliru. Jangan kirim kata sandi atau data sensitif.' : 'AI answers can be wrong. Never send passwords or sensitive data.'}</span>
        <button type="button" onClick={onCreateTicket} className="font-semibold text-blue-700 hover:text-blue-900">{isId ? 'Buat tiket bantuan' : 'Create support ticket'}</button>
      </div>
    </div>
  </section>;
};
