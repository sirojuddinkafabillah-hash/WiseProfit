import { useEffect, useState } from 'react';
import { Bot, CircleHelp, LoaderCircle, MessageCircle, RefreshCw, Send, ShieldCheck, Ticket, MessageSquareWarning } from 'lucide-react';
import { supabase } from '../lib/supabase';

type TicketRow = { id: string; user_id: string; user_email: string | null; category: string; subject: string; detail: string; status: string; priority: string; created_at: string };
type MessageRow = { id: string; sender_id: string | null; sender_role: string; body: string; created_at: string };
type ChatMessage = { role: 'user' | 'assistant'; content: string };
const FAQ = [
  ['Bagaimana menambah barang?', 'Buka menu Barang, isi nama barang, isi per wadah, harga beli per wadah, dan harga jual per unit. Simpan untuk memasukkan barang ke inventaris.'],
  ['Bagaimana laba dihitung?', 'Laba per unit dihitung dari harga jual per unit dikurangi HPP per unit. HPP per unit adalah harga beli satu wadah dibagi jumlah isi wadah. Laba terealisasi dikalikan jumlah unit yang sudah terjual.'],
  ['Bagaimana mencatat penjualan?', 'Buka Kasir, pilih barang, masukkan jumlah unit yang terjual, lalu simpan. Model data saat ini menyimpan jumlah terjual kumulatif, belum membuat struk transaksi satu per satu.'],
  ['Bagaimana penarikan memengaruhi kas?', 'Penarikan mengurangi saldo kas dan ekuitas usaha. Nominal penarikan tidak boleh melebihi saldo kas yang tersedia.'],
  ['Bagaimana mencadangkan data?', 'Buka Ekspor & Impor, unduh file JSON, lalu simpan salinannya di tempat aman. File CSV hanya berisi data inventaris untuk spreadsheet.'],
  ['Apakah catatan tersinkron ke cloud?', 'Saat ini catatan tersimpan di browser/perangkat. Inventaris dan penarikan disimpan pada akun Supabase.'],
];
const statusLabel = (status: string) => ({ open: 'Terbuka', in_progress: 'Sedang ditangani', waiting_user: 'Menunggu pengguna', resolved: 'Selesai', closed: 'Ditutup' }[status] || status);

export default function SupportModule({ userId, email, isAdmin, initialTab = 'faq' }: { userId: string; email: string | null; isAdmin: boolean; initialTab?: 'faq' | 'admin' }) {
  const [tab, setTab] = useState<'faq' | 'tickets' | 'admin'>(initialTab);
  const [openFaq, setOpenFaq] = useState(0);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState('');
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [selected, setSelected] = useState<TicketRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [category, setCategory] = useState('Masalah aplikasi');
  const [subject, setSubject] = useState('');
  const [detail, setDetail] = useState('');
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('open');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const loadTickets = async () => {
    if (!supabase) return;
    const query = supabase.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(100);
    const { data, error } = isAdmin && tab === 'admin' ? await query : await query.eq('user_id', userId);
    if (error) { setNotice('Tiket belum dapat dimuat. Pastikan migrasi database sudah diterapkan. ' + error.message); return; }
    setTickets((data || []) as TicketRow[]);
    if (selected) {
      const updated = (data || []).find((ticket: any) => ticket.id === selected.id);
      if (updated) setSelected(updated as TicketRow);
    }
  };
  const openTicket = async (ticket: TicketRow) => {
    if (!supabase) return;
    setSelected(ticket); setStatus(ticket.status); setMessages([]);
    const { data, error } = await supabase.from('support_messages').select('id,sender_id,sender_role,body,created_at').eq('ticket_id', ticket.id).order('created_at');
    if (error) setNotice(error.message); else setMessages((data || []) as MessageRow[]);
  };
  useEffect(() => { void loadTickets(); }, [userId, isAdmin, tab]);

  const createTicket = async (event: React.FormEvent) => {
    event.preventDefault(); if (!supabase || busy) return;
    if (!subject.trim() || !detail.trim()) { setNotice('Judul dan detail wajib diisi.'); return; }
    setBusy(true); setNotice('');
    try {
      const { data, error } = await supabase.from('support_tickets').insert({ user_id: userId, user_email: email, category, subject: subject.trim(), detail: detail.trim() }).select('*').single();
      if (error || !data) throw error || new Error('Tiket tidak berhasil dibuat.');
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (token) {
        try {
          const response = await fetch('/api/support/notify', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ ticketId: data.id }) });
          if (!response.ok) setNotice('Tiket tersimpan, tetapi notifikasi email belum berhasil dikirim. ' + (response.status === 503 ? 'Konfigurasi email server belum lengkap.' : ''));
        } catch { setNotice('Tiket tersimpan, tetapi notifikasi email tidak dapat dihubungi.'); }
      }
      setSubject(''); setDetail(''); setSelected(data as TicketRow); await loadTickets();
      setNotice(previous => previous || 'Tiket berhasil dikirim. ID: ' + data.id);
      setTab('tickets');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Gagal membuat tiket.'); }
    finally { setBusy(false); }
  };

  const sendReply = async () => {
    if (!supabase || !selected || !reply.trim() || busy) return;
    setBusy(true); setNotice('');
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error('Sesi login tidak ditemukan.');
      const senderRole = isAdmin && tab === 'admin' ? 'developer' : 'user';
      const { error } = await supabase.from('support_messages').insert({ ticket_id: selected.id, sender_id: auth.user.id, sender_role: senderRole, body: reply.trim() });
      if (error) throw error;
      if (senderRole === 'developer') {
        const { error: statusError } = await supabase.from('support_tickets').update({ status }).eq('id', selected.id);
        if (statusError) throw statusError;
      }
      setReply(''); await openTicket(selected); await loadTickets(); setNotice('Balasan berhasil dikirim.');
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Balasan gagal dikirim.'); }
    finally { setBusy(false); }
  };

  const sendChat = async (event: React.FormEvent) => {
    event.preventDefault(); const content = chatInput.trim();
    if (!content || chatBusy || content.length > 1500) return;
    setChatError(''); const next = [...chat, { role: 'user' as const, content }].slice(-10); setChat(next); setChatInput(''); setChatBusy(true);
    const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
      const { data } = await supabase.auth.getSession(); const token = data.session?.access_token;
      if (!token) throw new Error('Silakan masuk kembali.');
      const response = await fetch('/api/support/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ messages: next }), signal: controller.signal });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(response.status === 503 ? 'Chat AI belum dikonfigurasi. Kamu tetap bisa membuat tiket bantuan.' : (result.error || 'Layanan AI sedang bermasalah.'));
      if (typeof result.answer !== 'string' || !result.answer.trim()) throw new Error('AI belum memberikan jawaban.');
      setChat(current => [...current, { role: 'assistant', content: result.answer.trim() }].slice(-10));
    } catch (error) { setChatError(error instanceof Error ? error.message : 'Chat AI tidak tersedia.'); }
    finally { window.clearTimeout(timeout); setChatBusy(false); }
  };

  return <section className="module-stack">
    <div className="module-intro"><div><span className="eyebrow">PUSAT BANTUAN</span><h2>Bantuan & Keluhan</h2><p>Temukan jawaban, tanyakan kepada asisten, atau kirim tiket kepada developer.</p></div>{isAdmin && <span className="module-count"><ShieldCheck size={13}/> Developer</span>}</div>
    <div className="support-tabs"><button className={tab === 'faq' ? 'active' : ''} onClick={() => setTab('faq')}><CircleHelp size={15}/> FAQ & AI</button><button className={tab === 'tickets' ? 'active' : ''} onClick={() => setTab('tickets')}><Ticket size={15}/> Tiket saya</button>{isAdmin && <button className={tab === 'admin' ? 'active' : ''} onClick={() => setTab('admin')}><ShieldCheck size={15}/> Admin</button>}</div>
    {tab === 'faq' && <>
      <div className="glass support-chat"><div className="support-chat-heading"><Bot size={19}/><div><b>Asisten WiseProfit</b><small>Didukung Groq · jawaban otomatis</small></div></div>
        <div className="support-chat-messages">{chat.length ? chat.map((message, index) => <div key={index} className={'support-bubble ' + message.role}>{message.content}</div>) : <p className="module-footnote">Tanyakan cara memakai inventaris, kasir, penarikan, atau pencadangan data.</p>}{chatBusy && <p className="module-footnote"><LoaderCircle className="spin" size={14}/> AI sedang menjawab...</p>}</div>
        {chatError && <p className="module-error">{chatError}</p>}
        <form className="support-chat-form" onSubmit={sendChat}><input value={chatInput} onChange={e => setChatInput(e.target.value)} maxLength={1500} placeholder="Tulis pertanyaan..." disabled={chatBusy}/><button className="primary-button" disabled={chatBusy || !chatInput.trim()}><Send size={15}/> Kirim</button></form>
        <small className="module-footnote">Jangan kirim kata sandi, OTP, API key, atau informasi keuangan sensitif. Jawaban AI bisa keliru.</small>
      </div>
      <div className="glass support-faq-list">{FAQ.map(([question, answer], index) => <div className="support-faq" key={question}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)}><b>{question}</b><span>{openFaq === index ? '−' : '+'}</span></button>{openFaq === index && <p>{answer}</p>}</div>)}</div>
    </>}
    {tab === 'tickets' && <>
      <form className="glass module-form" onSubmit={createTicket}><div className="module-form-title"><MessageSquareWarning size={18}/><b>Kirim tiket bantuan</b></div><div className="form-grid"><label>Kategori<select value={category} onChange={e => setCategory(e.target.value)}><option>Masalah aplikasi</option><option>Data atau sinkronisasi</option><option>Perhitungan keuangan</option><option>Impor atau ekspor data</option><option>Saran fitur</option><option>Lainnya</option></select></label><label>Judul<input value={subject} onChange={e => setSubject(e.target.value)} maxLength={120} required placeholder="Contoh: Data tidak tersimpan"/></label><label className="form-span">Detail<textarea value={detail} onChange={e => setDetail(e.target.value)} maxLength={3000} rows={4} required placeholder="Jelaskan langkah dan masalah yang terjadi..."/></label></div><button className="primary-button" disabled={busy}>{busy?<LoaderCircle className="spin" size={15}/>:<Send size={15}/>} Kirim tiket</button></form>
      <TicketList tickets={tickets} selected={selected} onOpen={openTicket}/>
      {selected && selected.user_id === userId && <TicketConversation ticket={selected} messages={messages} reply={reply} setReply={setReply} sendReply={sendReply} busy={busy}/>}
    </>}
    {tab === 'admin' && isAdmin && <>
      <div className="glass module-table-wrap"><div className="module-table-heading"><b>Inbox tiket developer</b><button className="text-button" onClick={() => void loadTickets()}><RefreshCw size={14}/> Muat ulang</button></div><div className="support-admin-list">{tickets.map(ticket => <button key={ticket.id} className={'support-admin-ticket ' + (selected?.id === ticket.id ? 'active' : '')} onClick={() => void openTicket(ticket)}><b>{ticket.subject}</b><small>{ticket.user_email || ticket.user_id} · {ticket.category}</small><span>{statusLabel(ticket.status)} · {new Date(ticket.created_at).toLocaleString('id-ID')}</span></button>)}{!tickets.length && <p className="table-empty">Belum ada tiket.</p>}</div></div>
      {selected && <div className="glass module-form"><div className="module-form-title"><b>{selected.subject}</b><span className="module-count">{statusLabel(selected.status)}</span></div><p className="support-ticket-detail">{selected.detail}</p><TicketConversation ticket={selected} messages={messages} reply={reply} setReply={setReply} sendReply={sendReply} busy={busy}/><label className="support-status-label">Status tiket<select value={status} onChange={e => setStatus(e.target.value)}><option value="open">Open</option><option value="in_progress">In progress</option><option value="waiting_user">Waiting user</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></label></div>}
    </>}
    {notice && <p role="status" className="module-footnote">{notice}</p>}
  </section>;
}

function TicketList({ tickets, selected, onOpen }: { tickets: TicketRow[]; selected: TicketRow | null; onOpen: (ticket: TicketRow) => void }) {
  return <div className="glass module-table-wrap"><div className="module-table-heading"><b>Riwayat tiket</b><span>{tickets.length} tiket</span></div><div className="support-admin-list">{tickets.map(ticket => <button key={ticket.id} className={'support-admin-ticket ' + (selected?.id === ticket.id ? 'active' : '')} onClick={() => onOpen(ticket)}><b>{ticket.subject}</b><small>{ticket.category}</small><span>{statusLabel(ticket.status)} · {new Date(ticket.created_at).toLocaleString('id-ID')}</span></button>)}{!tickets.length && <p className="table-empty">Belum ada tiket yang dikirim.</p>}</div></div>;
}
function TicketConversation({ ticket, messages, reply, setReply, sendReply, busy }: { ticket: TicketRow; messages: MessageRow[]; reply: string; setReply: (value: string) => void; sendReply: () => void; busy: boolean }) {
  return <div className="support-conversation"><p className="support-ticket-detail">{ticket.detail}</p><div className="support-message-list">{messages.map(message => <div key={message.id} className={'support-message ' + (message.sender_role === 'developer' ? 'developer' : '')}><small>{message.sender_role === 'developer' ? 'Developer' : message.sender_role === 'ai' ? 'AI' : 'Pengguna'} · {new Date(message.created_at).toLocaleString('id-ID')}</small><p>{message.body}</p></div>)}{!messages.length && <p className="module-footnote">Belum ada balasan.</p>}</div><form className="support-reply-form" onSubmit={event => { event.preventDefault(); sendReply(); }}><textarea value={reply} onChange={event => setReply(event.target.value)} maxLength={5000} rows={3} placeholder="Tulis balasan..." required/><button className="primary-button" disabled={busy || !reply.trim()}><Send size={15}/> Kirim balasan</button></form></div>;
}
