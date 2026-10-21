/* Koneksi Supabase */
const sb = window.supabase && SUPABASE_CONFIGURED ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY) : null;
const blobUrl = id => sb.storage.from('media').getPublicUrl(id).data.publicUrl;

const DB = {
  collection(col) {
    return {
      async add(d) { const { error } = await sb.from('docs').insert({ col, data: d }); if (error) throw error; },
      doc(id) {
        return {
          async set(d) { const { error } = await sb.from('docs').upsert({ id, col, data: d }); if (error) throw error; },
          async update(d) {
            const { data: r, error: e0 } = await sb.from('docs').select('data').eq('id', id).single(); if (e0) throw e0;
            const { error } = await sb.from('docs').update({ data: { ...r.data, ...d } }).eq('id', id); if (error) throw error;
          },
          async delete() { const { error } = await sb.from('docs').delete().eq('id', id); if (error) throw error; }
        };
      },
      onSnapshot(cb, er) {
        const load = async () => {
          const { data, error } = await sb.from('docs').select('id,data').eq('col', col);
          if (error) { if (er) er(error); return; }
          cb({ docs: data.map(r => ({ id: r.id, data: () => r.data })) });
        };
        load();
        sb.channel('docs-' + col).on('postgres_changes', { event: '*', schema: 'public', table: 'docs', filter: 'col=eq.' + col }, load).subscribe();
      }
    };
  }
};

async function uploadMedia(f) {
  const ext = ((f.name || '').split('.').pop() || 'bin').toLowerCase(), id = crypto.randomUUID() + '.' + ext;
  const { error } = await sb.storage.from('media').upload(id, f, { contentType: f.type });
  if (error) throw error;
  return { id };
}
