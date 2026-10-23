-- ============================================================
-- KOMUNITAS ID-JP - skema Supabase (jalankan sekali di SQL Editor)
-- ============================================================

-- 1) Profil pengguna: setiap akun baru otomatis berstatus 'member'
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  nama text,
  role text not null default 'member' check (role in ('pending','member','admin','ditolak')),
  created_at timestamptz default now()
);

-- 2) Penyimpanan data umum (anggota, kegiatan, forum, pesan, pengaturan)
create table if not exists public.docs (
  id text primary key default gen_random_uuid()::text,
  col text not null,
  data jsonb not null default '{}'::jsonb,
  owner uuid default auth.uid(),
  created_at timestamptz default now()
);
create index if not exists docs_col_idx on public.docs (col);
alter table public.docs replica identity full;

-- 3) Fungsi bantu: peran pengguna yang sedang login
create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

-- 4) Setiap akun baru langsung menjadi anggota.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as
$$
begin
  insert into public.profiles (id, email, nama, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nama', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    'member'
  );
  return new;
end
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Aktifkan pendaftar lama yang masih menunggu persetujuan.
update public.profiles set role = 'member' where role = 'pending';

-- 5) Keamanan baris (RLS)
alter table public.profiles enable row level security;
alter table public.docs enable row level security;

drop policy if exists "profil: baca sendiri atau admin" on public.profiles;
create policy "profil: baca sendiri atau admin" on public.profiles
  for select using (id = auth.uid() or public.my_role() = 'admin');

drop policy if exists "profil: admin mengubah peran" on public.profiles;
create policy "profil: admin mengubah peran" on public.profiles
  for update using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

-- Anggota yang disetujui boleh membaca; pesan 'tanya' hanya admin dan pengirimnya
drop policy if exists "docs: baca" on public.docs;
create policy "docs: baca" on public.docs for select using (
  public.my_role() in ('member','admin')
  and (col <> 'tanya' or public.my_role() = 'admin' or owner = auth.uid())
);

-- Admin menulis apa saja; anggota membuat topik dan komentar atas nama sendiri
drop policy if exists "docs: tambah" on public.docs;
create policy "docs: tambah" on public.docs for insert with check (
  public.my_role() = 'admin'
  or (public.my_role() = 'member' and col in ('events','tanya'))
  or (public.my_role() = 'member' and col in ('topics','comments')
    and owner = auth.uid() and data->>'by' = auth.uid()::text)
);

drop policy if exists "docs: ubah" on public.docs;
create policy "docs: ubah" on public.docs for update
  using (
    public.my_role() = 'admin'
    or (public.my_role() = 'member' and col = 'events')
    or (public.my_role() = 'member' and col in ('topics','comments')
      and owner = auth.uid() and data->>'by' = auth.uid()::text)
  )
  with check (
    public.my_role() = 'admin'
    or (public.my_role() = 'member' and col = 'events')
    or (public.my_role() = 'member' and col in ('topics','comments')
      and owner = auth.uid() and data->>'by' = auth.uid()::text)
  );

drop policy if exists "docs: hapus" on public.docs;
create policy "docs: hapus" on public.docs for delete using (
  public.my_role() = 'admin'
  or (public.my_role() = 'member' and col in ('topics','comments')
    and owner = auth.uid() and data->>'by' = auth.uid()::text)
);

-- 6) Realtime (data tampil langsung di semua perangkat)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'docs'
  ) then
    alter publication supabase_realtime add table public.docs;
  end if;
end
$$;

-- 7) Penyimpanan foto dan surat (bucket 'media')
insert into storage.buckets (id, name, public) values ('media','media', true)
  on conflict (id) do nothing;
drop policy if exists "media: admin unggah" on storage.objects;
create policy "media: admin unggah" on storage.objects
  for insert with check (bucket_id = 'media' and public.my_role() = 'admin');
drop policy if exists "media: admin hapus" on storage.objects;
create policy "media: admin hapus" on storage.objects
  for delete using (bucket_id = 'media' and public.my_role() = 'admin');

-- Opsional: jadikan akun Anda admin setelah login pertama:
-- update public.profiles set role = 'admin'
-- where lower(email) = lower('EMAIL-GOOGLE-ANDA@gmail.com');
