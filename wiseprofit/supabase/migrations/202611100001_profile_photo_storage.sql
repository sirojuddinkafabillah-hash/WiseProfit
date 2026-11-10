-- WiseProfit profile photo cloud sync
alter table public.profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-photos', 'profile-photos', true, 10485760, array['image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 10485760, allowed_mime_types = array['image/jpeg'];

drop policy if exists "Users can upload own profile photo" on storage.objects;
create policy "Users can upload own profile photo" on storage.objects
for insert to authenticated with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can update own profile photo" on storage.objects;
create policy "Users can update own profile photo" on storage.objects
for update to authenticated using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can delete own profile photo" on storage.objects;
create policy "Users can delete own profile photo" on storage.objects
for delete to authenticated using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Public can view profile photos" on storage.objects;
create policy "Public can view profile photos" on storage.objects
for select to public using (bucket_id = 'profile-photos');
