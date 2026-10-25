import { supabase } from '../lib/supabase';
import { InventoryItem, Withdrawal } from '../types/inventory';

export interface UserProfileData {
  userId: string;
  email?: string;
  displayName?: string;
  modalAwal: number;
  globalSavePercentMonthly?: number;
  updatedAt?: string;
}

export function sanitizeId(rawId: string | undefined | null): string {
  if (!rawId) return `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return String(rawId).replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 100) || `item_${Date.now()}`;
}

export function sanitizeItemForSupabase(userId: string, item: any): Record<string, unknown> {
  return { ...item, id: sanitizeId(item?.id), userId };
}

export async function saveUserProfile(
  userId: string,
  emailOrData?: string | number | { email?: string; modalAwal?: number; displayName?: string; globalSavePercentMonthly?: number },
  modalAwalNum?: number
): Promise<boolean> {
  try {
    let email: string | undefined;
    let displayName: string | undefined;
    let modalAwal = 50000;
    let globalSavePercentMonthly = 50;
    if (typeof emailOrData === 'object' && emailOrData) {
      email = emailOrData.email; displayName = emailOrData.displayName;
      if (typeof emailOrData.modalAwal === 'number') modalAwal = emailOrData.modalAwal;
      if (typeof emailOrData.globalSavePercentMonthly === 'number') globalSavePercentMonthly = emailOrData.globalSavePercentMonthly;
    } else if (typeof emailOrData === 'number') modalAwal = emailOrData;
    else if (typeof emailOrData === 'string') { email = emailOrData; modalAwal = modalAwalNum ?? 50000; }
    const { error } = await supabase.from('profiles').upsert({
      user_id: userId, email: email || null, display_name: displayName || null,
      modal_awal: Math.max(0, Number(modalAwal) || 0),
      global_save_percent_monthly: globalSavePercentMonthly,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) throw error;
    return true;
  } catch (error) { console.error('[Supabase] Save profile:', error); return false; }
}

export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) { console.warn('[Supabase] Get profile:', error.message); return null; }
  if (!data) return null;
  return { userId: data.user_id, email: data.email || undefined, displayName: data.display_name || undefined,
    modalAwal: Number(data.modal_awal ?? 50000), globalSavePercentMonthly: Number(data.global_save_percent_monthly ?? 50), updatedAt: data.updated_at };
}

function mapItem(row: any): InventoryItem { return (row?.data || row) as InventoryItem; }
export async function saveInventoryItemToCloud(userId: string, item: InventoryItem): Promise<boolean> {
  try {
    const safe = { ...item, id: sanitizeId(item.id) };
    const { error } = await supabase.from('inventory_items').upsert({ user_id: userId, id: safe.id, data: safe, created_at: safe.createdAt || Date.now(), updated_at: safe.updatedAt || Date.now() }, { onConflict: 'user_id,id' });
    if (error) throw error;
    return true;
  } catch (error) { console.error('[Supabase] Save item:', error); return false; }
}
export async function deleteInventoryItemFromCloud(userId: string, itemId: string): Promise<boolean> {
  const { error } = await supabase.from('inventory_items').delete().eq('user_id', userId).eq('id', sanitizeId(itemId));
  if (error) console.error('[Supabase] Delete item:', error);
  return !error;
}
export async function clearAllUserItemsFromCloud(userId: string): Promise<boolean> {
  const { error } = await supabase.from('inventory_items').delete().eq('user_id', userId);
  if (error) console.error('[Supabase] Clear items:', error);
  return !error;
}
export async function batchUploadToCloud(userId: string, arg2: string | InventoryItem[], arg3?: number | InventoryItem[], arg4?: InventoryItem[]): Promise<boolean> {
  let email = ''; let modalAwal = 50000; let items: InventoryItem[] = [];
  if (Array.isArray(arg2)) { items = arg2; modalAwal = typeof arg3 === 'number' ? arg3 : 50000; }
  else { email = arg2; modalAwal = typeof arg3 === 'number' ? arg3 : 50000; items = Array.isArray(arg4) ? arg4 : []; }
  try {
    if (!await saveUserProfile(userId, { email, modalAwal })) throw new Error('Profil gagal disimpan.');
    if (items.length) {
      const rows = items.map((item) => ({ user_id: userId, id: sanitizeId(item.id), data: { ...item, id: sanitizeId(item.id) }, created_at: item.createdAt || Date.now(), updated_at: item.updatedAt || Date.now() }));
      const { error } = await supabase.from('inventory_items').upsert(rows, { onConflict: 'user_id,id' });
      if (error) throw error;
    }
    return true;
  } catch (error) { console.error('[Supabase] Batch upload:', error); return false; }
}
export function subscribeUserItems(userId: string, onUpdate: (items: InventoryItem[]) => void, onError?: (err: unknown) => void): () => void {
  let active = true;
  const fetch = async () => {
    const { data, error } = await supabase.from('inventory_items').select('data').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) { onError?.(error); return; }
    if (active) onUpdate((data || []).map(mapItem));
  };
  fetch();
  const channel = supabase.channel(`wiseprofit-items-${userId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items', filter: `user_id=eq.${userId}` }, fetch).subscribe();
  return () => { active = false; void supabase.removeChannel(channel); };
}
export async function fetchUserItemsOnce(userId: string): Promise<InventoryItem[]> {
  const { data, error } = await supabase.from('inventory_items').select('data').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) { console.error('[Supabase] Fetch items:', error); return []; }
  return (data || []).map(mapItem);
}
export function sanitizeWithdrawalForSupabase(userId: string, withdrawal: any): Record<string, unknown> {
  return { ...withdrawal, id: sanitizeId(withdrawal.id), userId, nominal: Math.max(1, Math.round(Number(withdrawal.nominal) || 0)), tanggal: withdrawal.tanggal || new Date().toISOString().slice(0, 10) };
}
export async function saveWithdrawalToCloud(userId: string, withdrawal: Withdrawal): Promise<boolean> {
  try {
    const safe = sanitizeWithdrawalForSupabase(userId, withdrawal) as any;
    const { error } = await supabase.from('withdrawals').upsert({ user_id: userId, id: safe.id, data: safe, created_at: safe.createdAt || Date.now() }, { onConflict: 'user_id,id' });
    if (error) throw error;
    return true;
  } catch (error) { console.error('[Supabase] Save withdrawal:', error); return false; }
}
export async function deleteWithdrawalFromCloud(userId: string, withdrawalId: string): Promise<boolean> {
  const { error } = await supabase.from('withdrawals').delete().eq('user_id', userId).eq('id', sanitizeId(withdrawalId));
  if (error) console.error('[Supabase] Delete withdrawal:', error);
  return !error;
}
export function subscribeUserWithdrawals(userId: string, onUpdate: (withdrawals: Withdrawal[]) => void, onError?: (err: unknown) => void): () => void {
  let active = true;
  const fetch = async () => {
    const { data, error } = await supabase.from('withdrawals').select('data').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) { onError?.(error); return; }
    if (active) onUpdate((data || []).map((row: any) => row.data as Withdrawal));
  };
  fetch();
  const channel = supabase.channel(`wiseprofit-withdrawals-${userId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals', filter: `user_id=eq.${userId}` }, fetch).subscribe();
  return () => { active = false; void supabase.removeChannel(channel); };
}
export async function fetchUserWithdrawalsOnce(userId: string): Promise<Withdrawal[]> {
  const { data, error } = await supabase.from('withdrawals').select('data').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) { console.error('[Supabase] Fetch withdrawals:', error); return []; }
  return (data || []).map((row: any) => row.data as Withdrawal);
}
