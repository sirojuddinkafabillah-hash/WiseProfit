import { InventoryItem } from '../types/inventory';
import { supabase, testSupabaseConnection } from '../lib/supabase';
import { batchUploadToCloud, clearAllUserItemsFromCloud, saveUserProfile, saveInventoryItemToCloud, deleteInventoryItemFromCloud } from './supabaseSync';

export interface SupabaseInventoryResponse { success: boolean; source?: string; items: InventoryItem[]; modalAwal?: number; globalSavePercentMonthly?: number; message?: string; }
export interface SupabaseStatus { connected: boolean; dbName: string; error: string | null; needsIpWhitelist?: boolean; uriMasked: string; }

// Backwards-compatible function names for the existing UI; all writes now target Supabase only.
export async function fetchInventoryFromSupabase(userId?: string): Promise<SupabaseInventoryResponse | null> {
  if (!userId) return { success: true, source: 'supabase', items: [], modalAwal: 50000, globalSavePercentMonthly: 50 };
  const { data, error } = await supabase.from('inventory_items').select('data').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) return { success: false, items: [], message: error.message };
  const profile = await supabase.from('profiles').select('modal_awal,global_save_percent_monthly').eq('user_id', userId).maybeSingle();
  return { success: true, source: 'supabase', items: (data || []).map((r: any) => r.data as InventoryItem), modalAwal: Number(profile.data?.modal_awal ?? 50000), globalSavePercentMonthly: Number(profile.data?.global_save_percent_monthly ?? 50) };
}
export async function saveItemToSupabase(item: InventoryItem, userId?: string): Promise<boolean> { return userId ? saveInventoryItemToCloud(userId, item) : false; }
export async function updateItemInSupabase(id: string, updates: Partial<InventoryItem>): Promise<boolean> {
  const { data, error } = await supabase.from('inventory_items').select('user_id,data').eq('id', id).maybeSingle();
  if (error || !data) return false;
  return saveInventoryItemToCloud(data.user_id, { ...data.data, ...updates, id } as InventoryItem);
}
export async function deleteItemFromSupabase(id: string): Promise<boolean> {
  const { data, error } = await supabase.from('inventory_items').select('user_id').eq('id', id).maybeSingle();
  if (error || !data) return false;
  return deleteInventoryItemFromCloud(data.user_id, id);
}
export async function clearAllItemsFromSupabase(userId?: string): Promise<boolean> { return userId ? clearAllUserItemsFromCloud(userId) : false; }
export async function saveSettingsToSupabase(modalAwal: number, globalSavePercentMonthly = 50, userId?: string): Promise<boolean> {
  return userId ? saveUserProfile(userId, { modalAwal, globalSavePercentMonthly }) : false;
}
export async function batchRestoreToSupabase(items: InventoryItem[], modalAwal = 50000, globalSavePercentMonthly = 50, userId?: string): Promise<boolean> {
  return userId ? batchUploadToCloud(userId, items, modalAwal) : false;
}
export async function checkSupabaseStatus(): Promise<SupabaseStatus | null> {
  const connected = await testSupabaseConnection();
  return { connected, dbName: 'Supabase PostgreSQL', error: connected ? null : 'Supabase belum dapat dihubungi atau tabel belum disiapkan.', needsIpWhitelist: false, uriMasked: 'Supabase project URL' };
}
export async function importItemsToSupabase(items: InventoryItem[], mode: 'append' | 'replace' = 'append', modalAwal?: number, userId?: string): Promise<{ success: boolean; message: string; count?: number; source?: string }> {
  if (!userId) return { success: false, message: 'Silakan masuk terlebih dahulu.' };
  if (mode === 'replace') {
    const cleared = await clearAllUserItemsFromCloud(userId);
    if (!cleared) return { success: false, message: 'Gagal mengosongkan data lama di Supabase.' };
  }
  const saved = await batchUploadToCloud(userId, items, modalAwal ?? 50000);
  return saved ? { success: true, message: `Berhasil menyimpan ${items.length} barang ke Supabase.`, count: items.length, source: 'supabase' } : { success: false, message: 'Gagal menyimpan data ke Supabase.' };
}
