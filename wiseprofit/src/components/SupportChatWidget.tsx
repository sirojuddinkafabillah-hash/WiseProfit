import React, { useState } from 'react';
import { Bot, Send, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Props = { language: 'id' | 'en' };
type ChatMessage = { role: 'user' | 'assistant'; content: string };

export const SupportChatWidget: React.FC<Props> = ({ language }) => {
  const isId = language === 'id';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || busy) return;
    setError('');
    const next: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error(isId ? 'Silakan masuk terlebih dahulu.' : 'Please sign in first.');
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ messages: next }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'AI support is unavailable.');
      setMessages([...next, { role: 'assistant', content: result.answer }]);
    } catch (e: any) {
      setError(e?.message || (isId ? 'Bantuan AI belum tersedia.' : 'AI support is unavailable.'));
    } finally { setBusy(false); }
  };
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="mb-2 flex items-center gap-2 font-bold text-slate-900"><Bot className="h-5 w-5 text-blue-700" />{isId ? 'Chatbot AI WiseProfit' : 'WiseProfit AI Chatbot'}</h2>
    <p className="mb-3 text-sm text-slate-500">{isId ? 'Tanyakan hal umum tentang penggunaan WiseProfit. Jangan kirim kata sandi atau informasi keuangan rahasia.' : 'Ask general questions about WiseProfit. Do not send passwords or confidential financial information.'}</p>
    <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
      {messages.map((m, i) => <div key={i} className={'whitespace-pre-wrap rounded-lg p-3 text-sm leading-6 ' + (m.role === 'user' ? 'ml-6 bg-blue-50 text-blue-950' : 'mr-6 bg-slate-100 text-slate-800')}>{m.content}</div>)}
      {busy && <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />{isId ? 'AI sedang menjawab…' : 'AI is responding…'}</p>}
    </div>
    {error && <p role="status" className="mb-3 text-sm text-amber-700">{error}</p>}
    <form onSubmit={send} className="flex gap-2">
      <input value={input} onChange={e => setInput(e.target.value)} maxLength={2500} placeholder={isId ? 'Tulis pertanyaan…' : 'Ask a question…'} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <button disabled={busy || !input.trim()} type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Send className="h-4 w-4" /><span>{isId ? 'Kirim' : 'Send'}</span></button>
    </form>
  </section>;
};
