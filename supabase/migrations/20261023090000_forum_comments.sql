begin;

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

commit;
