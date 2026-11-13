import { useEffect, useMemo, useState } from 'react';
import { FileText, Folder, FolderPlus, NotebookPen, Plus, Save, Search, Trash2, ArrowLeft } from 'lucide-react';

type NoteFolder = { id: string; name: string };
type Note = { id: string; title: string; content: string; folderId: string; updatedAt: number };
const DEFAULT_FOLDERS: NoteFolder[] = [{ id: 'personal', name: 'Personal' }, { id: 'business', name: 'Business' }];
const safeParse = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
};

export default function NotesModule({ userId }: { userId: string }) {
  const [folders, setFolders] = useState<NoteFolder[]>(DEFAULT_FOLDERS);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folderId, setFolderId] = useState('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [query, setQuery] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [folderForm, setFolderForm] = useState(false);
  const [message, setMessage] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(false);
    const loadedFolders = safeParse<NoteFolder[]>(localStorage.getItem('wp_note_folders_' + userId), DEFAULT_FOLDERS);
    const loadedNotes = safeParse<Note[]>(localStorage.getItem('wp_notes_v2_' + userId), []);
    const legacy = localStorage.getItem('wp_notes_' + userId) || '';
    const migrated = loadedNotes.length || !legacy.trim() ? loadedNotes : [{ id: 'legacy-' + Date.now(), title: 'Catatan lama', content: legacy, folderId: 'personal', updatedAt: Date.now() }];
    setFolders(Array.isArray(loadedFolders) && loadedFolders.length ? loadedFolders : DEFAULT_FOLDERS);
    setNotes(Array.isArray(migrated) ? migrated : []);
    setActiveId(null); setFolderId('all'); setTitle(''); setBody('');
    setHydrated(true);
  }, [userId]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('wp_note_folders_' + userId, JSON.stringify(folders));
      localStorage.setItem('wp_notes_v2_' + userId, JSON.stringify(notes));
    } catch { setMessage('Penyimpanan browser penuh. Ekspor atau hapus beberapa catatan.'); }
  }, [userId, folders, notes]);

  const visible = useMemo(() => notes
    .filter(note => folderId === 'all' || note.folderId === folderId)
    .filter(note => (note.title + ' ' + note.content).toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt), [notes, folderId, query]);

  const createNote = () => {
    const id = 'note-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    const note: Note = { id, title: '', content: '', folderId: folderId === 'all' ? 'personal' : folderId, updatedAt: Date.now() };
    setNotes(previous => [note, ...previous]); setActiveId(id); setTitle(''); setBody('');
  };
  const openNote = (note: Note) => { setActiveId(note.id); setTitle(note.title); setBody(note.content); };
  const updateNote = (field: 'title' | 'content', value: string) => {
    if (field === 'title') setTitle(value); else setBody(value);
    if (activeId) setNotes(previous => previous.map(note => note.id === activeId ? { ...note, [field]: value, updatedAt: Date.now() } : note));
  };
  const saveNote = () => {
    if (!activeId) return;
    setNotes(previous => previous.map(note => note.id === activeId ? { ...note, title: title.trim() || 'Catatan tanpa judul', content: body, updatedAt: Date.now() } : note));
    setMessage('Catatan tersimpan otomatis di browser/perangkat ini.');
  };
  const addFolder = (event: React.FormEvent) => {
    event.preventDefault();
    const name = newFolder.trim().slice(0, 32);
    if (!name) return;
    const folder = { id: 'folder-' + Date.now(), name };
    setFolders(previous => [...previous, folder]); setFolderId(folder.id); setNewFolder(''); setFolderForm(false);
  };
  const deleteNote = () => {
    if (!activeId || !window.confirm('Hapus catatan ini?')) return;
    setNotes(previous => previous.filter(note => note.id !== activeId));
    setActiveId(null); setTitle(''); setBody(''); setMessage('Catatan dihapus.');
  };

  return <section className="module-stack">
    <div className="module-intro"><div><span className="eyebrow">RUANG KERJA</span><h2>Catatan</h2><p>Buat catatan pribadi dan usaha dalam folder terpisah.</p></div><button className="primary-button" onClick={createNote}><Plus size={16}/> Catatan baru</button></div>
    <div className="notes-layout">
      <aside className="glass notes-folders">
        <div className="notes-section-heading"><b><Folder size={16}/> Folder</b><button className="icon-button" title="Tambah folder" onClick={() => setFolderForm(value => !value)}><FolderPlus size={16}/></button></div>
        {folderForm && <form className="notes-folder-form" onSubmit={addFolder}><input value={newFolder} onChange={e => setNewFolder(e.target.value)} maxLength={32} placeholder="Nama folder" autoFocus/><button className="primary-button" type="submit">Tambah</button></form>}
        <button className={'notes-folder-button ' + (folderId === 'all' ? 'active' : '')} onClick={() => { setFolderId('all'); setActiveId(null); }}>Semua catatan <span>{notes.length}</span></button>
        {folders.map(folder => <button key={folder.id} className={'notes-folder-button ' + (folderId === folder.id ? 'active' : '')} onClick={() => { setFolderId(folder.id); setActiveId(null); }}>{folder.name}<span>{notes.filter(note => note.folderId === folder.id).length}</span></button>)}
      </aside>
      <div className="glass notes-main">
        {!activeId ? <>
          <div className="notes-search"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari catatan..."/></div>
          <div className="notes-list">{visible.length ? visible.map(note => <button key={note.id} className="notes-list-item" onClick={() => openNote(note)}><FileText size={17}/><span><b>{note.title || 'Catatan tanpa judul'}</b><small>{note.content || 'Belum ada isi catatan'}</small><small>{new Date(note.updatedAt).toLocaleString('id-ID')} · {folders.find(folder => folder.id === note.folderId)?.name || 'Folder'}</small></span></button>) : <div className="table-empty">Belum ada catatan di folder ini.</div>}</div>
        </> : <>
          <div className="notes-editor-top"><button className="text-button" onClick={() => setActiveId(null)}><ArrowLeft size={15}/> Semua catatan</button><button className="row-delete" title="Hapus catatan" onClick={deleteNote}><Trash2 size={16}/></button></div>
          <input className="notes-title-input" value={title} onChange={e => updateNote('title', e.target.value)} maxLength={120} placeholder="Judul catatan"/>
          <textarea className="notes-body-input" value={body} onChange={e => updateNote('content', e.target.value)} maxLength={20000} rows={15} placeholder="Mulai menulis..."/>
          <div className="notes-editor-bottom"><small>{body.length} karakter · Tersimpan otomatis di browser</small><button className="primary-button" onClick={saveNote}><Save size={15}/> Simpan</button></div>
        </>}
      </div>
    </div>
    <p className="module-footnote"><NotebookPen size={13}/> Catatan mengikuti akun pada browser ini, tetapi belum disinkronkan ke cloud atau perangkat lain.</p>
    {message && <p role="status" className="module-footnote">{message}</p>}
  </section>;
}
