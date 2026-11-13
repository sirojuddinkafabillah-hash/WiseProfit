import { supabase } from '../lib/supabase';
import type { InventoryItem, Withdrawal } from '../types/inventory';
export function sanitizeId(raw:string|null|undefined){return raw?String(raw).replace(/[^a-zA-Z0-9_\-]/g,'_').slice(0,100):'item_'+Date.now();}
export async function getUserProfile(userId:string){const {data,error}=await supabase!.from('profiles').select('*').eq('user_id',userId).maybeSingle();if(error)throw error;return data;}
export async function saveUserProfile(userId:string,patch:Record<string,unknown>){const {error}=await supabase!.from('profiles').upsert({user_id:userId,...patch,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(error)throw error;}
export async function fetchUserItemsOnce(userId:string):Promise<InventoryItem[]>{const {data,error}=await supabase!.from('inventory_items').select('data').eq('user_id',userId).order('created_at',{ascending:false});if(error)throw error;return (data||[]).map((r:any)=>(r.data||r) as InventoryItem);}
export async function fetchUserWithdrawalsOnce(userId:string):Promise<Withdrawal[]>{const {data,error}=await supabase!.from('withdrawals').select('data').eq('user_id',userId).order('created_at',{ascending:false});if(error)throw error;return (data||[]).map((r:any)=>r.data as Withdrawal);}
export async function saveInventoryItemToCloud(userId:string,item:InventoryItem){const safe={...item,id:sanitizeId(item.id)};const {error}=await supabase!.from('inventory_items').upsert({user_id:userId,id:safe.id,data:safe,created_at:safe.createdAt||Date.now(),updated_at:safe.updatedAt||Date.now()},{onConflict:'user_id,id'});if(error)throw error;}
export async function saveWithdrawalToCloud(userId:string,item:Withdrawal){const safe={...item,id:sanitizeId(item.id),userId};const {error}=await supabase!.from('withdrawals').upsert({user_id:userId,id:safe.id,data:safe,created_at:safe.createdAt||Date.now()},{onConflict:'user_id,id'});if(error)throw error;}
export function subscribeUserItems(userId:string,callback:(items:InventoryItem[])=>void){let active=true;let request=0;const load=async()=>{const current=++request;try{const rows=await fetchUserItemsOnce(userId);if(active&&current===request)callback(rows);}catch(e){console.error('Inventory sync:',e);}};const channel=supabase!.channel('wp-next-items-'+userId).on('postgres_changes',{event:'*',schema:'public',table:'inventory_items',filter:'user_id=eq.'+userId},load).subscribe();return()=>{active=false;void supabase!.removeChannel(channel);};}
export function subscribeUserWithdrawals(userId:string,callback:(items:Withdrawal[])=>void){let active=true;let request=0;const load=async()=>{const current=++request;try{const rows=await fetchUserWithdrawalsOnce(userId);if(active&&current===request)callback(rows);}catch(e){console.error('Withdrawal sync:',e);}};const channel=supabase!.channel('wp-next-withdrawals-'+userId).on('postgres_changes',{event:'*',schema:'public',table:'withdrawals',filter:'user_id=eq.'+userId},load).subscribe();return()=>{active=false;void supabase!.removeChannel(channel);};}

export async function deleteInventoryItemFromCloud(userId:string,itemId:string){const {error}=await supabase!.from('inventory_items').delete().eq('user_id',userId).eq('id',sanitizeId(itemId));if(error)throw error;}
export async function deleteWithdrawalFromCloud(userId:string,itemId:string){const {error}=await supabase!.from('withdrawals').delete().eq('user_id',userId).eq('id',sanitizeId(itemId));if(error)throw error;}

export async function uploadProfilePhoto(userId:string,file:File):Promise<string>{
 if(file.type!=='image/jpeg')throw new Error('Foto profil harus berformat JPG/JPEG.');
 if(file.size>10*1024*1024)throw new Error('Ukuran foto maksimal 10 MB.');
 const version=Date.now()+'-'+Math.random().toString(36).slice(2,9);
 const objectPath=userId+'/avatar-'+version+'.jpg';
 const {error:uploadError}=await supabase!.storage.from('profile-photos').upload(objectPath,file,{contentType:'image/jpeg',upsert:false,cacheControl:'0'});
 if(uploadError)throw uploadError;
 const {data}=supabase!.storage.from('profile-photos').getPublicUrl(objectPath);
 const avatarUrl=data.publicUrl+'?v='+version;
 const {error:profileError}=await supabase!.from('profiles').upsert({user_id:userId,avatar_url:avatarUrl,updated_at:new Date().toISOString()},{onConflict:'user_id'});
 if(profileError){await supabase!.storage.from('profile-photos').remove([objectPath]);throw profileError;}
 return avatarUrl;
}
export async function removeProfilePhoto(userId:string,currentUrl?:string|null):Promise<void>{
 if(currentUrl){
  try{
   const parsed=new URL(currentUrl);
   const marker='/storage/v1/object/public/profile-photos/';
   const index=parsed.pathname.indexOf(marker);
   if(index>=0){const objectPath=decodeURIComponent(parsed.pathname.slice(index+marker.length));if(objectPath.startsWith(userId+'/'))await supabase!.storage.from('profile-photos').remove([objectPath]);}
  }catch{/* A stale or external avatar URL is not a managed storage object. */}
 }
 const {error}=await supabase!.from('profiles').upsert({user_id:userId,avatar_url:null,updated_at:new Date().toISOString()},{onConflict:'user_id'});
 if(error)throw error;
}
