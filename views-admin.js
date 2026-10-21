/* Halaman khusus admin: Import, Operator, Pesan Masuk */
function vImport(){
  const ta=h('textarea',{rows:8,placeholder:'Satu baris satu anggota:\nnama,wilayah\nBudi,Ehime\nSiti,Kagawa'});
  return [h('h1',{},'Import Database'),h('p',{class:'sub'},'Tempel data CSV (nama,wilayah)'),
    h('div',{class:'card',style:'display:block'},ta,h('button',{class:'btn',onclick:async()=>{
      const rows=ta.value.split('\n').map(r=>r.split(',').map(x=>x.trim())).filter(r=>r[0]);
      for(const r of rows)await S.db.collection('members').add({nama:r[0],wilayah:r[1]||'',at:Date.now()});
      ta.value='';alert(rows.length+' anggota diimpor');go('members')}},'Import'))];
}

function vOp() {
  const P = S.profiles || [], lb = { pending: 'Menunggu', member: 'Anggota', admin: 'Admin', ditolak: 'Ditolak' };
  const set = async (id, role) => { const { error } = await sb.from('profiles').update({ role }).eq('id', id); if (error) alert('Gagal: ' + error.message); loadProfiles(); };
  const btn = (t, id, r) => h('button', { class: 'btn s', onclick: () => set(id, r) }, t);
  return [h('h1', {}, 'Operator'), h('p', { class: 'sub' }, 'Setujui pendaftar dan atur admin'),
    ...P.map(p => h('div', { class: 'card', style: 'display:block' }, h('div', { class: 'row' }, h('b', {}, p.nama || p.email), h('span', { class: 'tag' }, lb[p.role] || p.role)), h('small', {}, p.email),
      p.id !== S.uid && h('div', { class: 'fl' }, p.role !== 'member' && btn('✓ Setujui', p.id, 'member'), p.role !== 'admin' && btn('★ Jadikan admin', p.id, 'admin'), p.role !== 'ditolak' && btn('✕ Tolak', p.id, 'ditolak')))),
    P.length ? null : h('p', { class: 'warn' }, 'Belum ada pendaftar.')];
}

function vPesan(){const L=[...(S.tanya||[])].reverse();return [h('h1',{},'Pesan Masuk'),h('p',{class:'sub'},L.length+' pertanyaan untuk admin'),
  L.length?L.map(x=>h('div',{class:'card',style:'display:block'},h('b',{},x.nama||'Anggota'),h('small',{class:'warn'},' \u00b7 '+new Date(x.at||0).toLocaleString('id-ID')),h('p',{style:'white-space:pre-wrap;margin:8px 0'},x.teks),h('button',{class:'btn s',onclick:()=>{if(confirm('Hapus pesan ini?'))S.db.collection('tanya').doc(x.id).delete()}},'Hapus'))):h('p',{class:'warn'},'Belum ada pertanyaan.')]}
