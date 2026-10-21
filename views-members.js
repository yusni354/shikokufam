/* Halaman Data Anggota (daftar, filter, detail) */
const PERAN=['Anggota','Pengurus'],STATUS=['aktif','nonaktif'];
function vMembers(){
  if(S.form)return [formCard()];
  const wl=[...new Set(S.members.map(m=>m.wilayah).filter(Boolean))].sort();
  const sel=(opts,key,all)=>{const s=h('select',{},h('option',{value:''},all),...opts.map(o=>h('option',{value:o},o)));s.value=S[key]||'';s.onchange=()=>{S[key]=s.value;draw()};return s};
  const q=h('input',{placeholder:'Cari nama, nomor WhatsApp, kota, wilayah'});q.value=S.q||'';q.oninput=()=>{S.q=q.value;draw()};
  const cnt=h('p',{class:'sub'}),tbl=h('div',{class:'card',style:'display:block;padding:0;overflow:hidden'}),bar=h('div');
  S.sel=S.sel||new Set();
  function draw(){
    const t=(S.q||'').toLowerCase();
    const rows=S.members.map((m,i)=>({...m,kode:m.kode||'MEM-'+String(i+1).padStart(5,'0')})).filter(m=>(!t||[m.nama,m.wa,m.kota,m.wilayah,m.kode].some(x=>(x||'').toLowerCase().includes(t)))&&(!S.fw||m.wilayah===S.fw)&&(!S.fp||(m.peran||'Anggota')===S.fp)&&(!S.fs||(m.status||'aktif')===S.fs));
    cnt.textContent=rows.length+' anggota ditampilkan';
    const all=h('input',{type:'checkbox'});all.checked=rows.length>0&&rows.every(m=>S.sel.has(m.id));all.onchange=()=>{rows.forEach(m=>all.checked?S.sel.add(m.id):S.sel.delete(m.id));draw()};
    tbl.replaceChildren(h('div',{class:'mrow hd'},S.admin&&all,h('span',{style:'flex:1'},'Anggota'),h('span',{style:'margin-right:84px'},'Status')),
      ...rows.map(m=>{const c=h('input',{type:'checkbox'});c.checked=S.sel.has(m.id);c.onchange=()=>{c.checked?S.sel.add(m.id):S.sel.delete(m.id);draw()};
        return h('div',{class:'mrow'},S.admin&&c,h('div',{class:'av'},(m.nama||'?')[0].toUpperCase()),
          h('div',{style:'flex:1;min-width:0'},h('b',{style:'text-transform:uppercase;overflow-wrap:anywhere'},m.nama),h('br'),h('small',{class:'warn'},m.kode)),
          h('span',{class:'ok'+((m.status||'aktif')==='aktif'?'':' off')},m.status||'aktif'),
          h('button',{class:'btn s',title:'Lihat',onclick:()=>{S.detail=m;S.form=null;render()}},'👁'),
          S.admin&&h('button',{class:'btn s',title:'Ubah',onclick:()=>{S.form=m;S.detail=null;render()}},'✎'))}));
    if(!rows.length)tbl.append(h('p',{class:'warn',style:'padding:16px'},'Belum ada anggota.'));
    bar.replaceChildren(...[S.admin&&S.sel.size>0&&h('button',{class:'btn',style:'margin-bottom:12px',onclick:async()=>{if(!confirm('Hapus '+S.sel.size+' anggota terpilih?'))return;for(const id of S.sel)await S.db.collection('members').doc(id).delete();S.sel.clear()}},'Hapus '+S.sel.size+' terpilih')].filter(Boolean));
  }
  draw();
  return [h('div',{class:'top'},h('div',{},h('h1',{},'Data Anggota'),cnt),S.admin&&h('button',{class:'btn',onclick:()=>{S.form={};S.detail=null;render()}},'+ Tambah Anggota')),guard(),
    S.detail&&detailCard(),
    h('div',{class:'card',style:'display:block'},q,h('div',{class:'fl'},sel(wl,'fw','Semua Wilayah'),sel(PERAN,'fp','Semua'),sel(STATUS,'fs','Semua Status'))),bar,tbl];
}
function detailCard(){const m=S.detail;return h('div',{class:'card',style:'display:block'},m.foto&&h('img',{src:blobUrl(m.foto),style:'width:80px;height:80px;border-radius:50%;object-fit:cover;display:block;margin-bottom:8px'}),h('b',{style:'text-transform:uppercase'},m.nama),h('br'),
  ...[['Panggilan',m.panggilan],['Jenis kelamin',m.kelamin],['Tanggal lahir',m.lahir],['WhatsApp',m.wa],['Email',m.email],['Wilayah',m.wilayah],['Kota',m.kota],['Prefektur',m.pref],['Stasiun',m.stasiun],['Alamat Jepang',m.alamat_jp],['Kabupaten/Kota (ID)',m.kab],['Alamat Indonesia',m.alamat_id],['Pekerjaan',m.bidang],['Perusahaan',m.perusahaan],['Status tinggal',m.tinggal],['Instagram',m.instagram],['TikTok',m.tiktok],['Facebook',m.facebook],['Catatan',m.catatan],['Status',m.status||'aktif']].map(r=>h('div',{class:'warn'},r[0]+': '+(r[1]||'-'))),
  h('button',{class:'btn s',style:'margin-top:8px',onclick:()=>{S.detail=null;render()}},'Tutup'))}
