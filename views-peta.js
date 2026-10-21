/* Halaman Peta & Wilayah (Google My Maps + ekspor CSV) */
function alamatJp(m,det){return [det?m.alamat_jp:'',m.kec_jp,m.kota,m.pref||m.wilayah,m.kodepos,'Japan'].filter(Boolean).join(', ')}
function mapMid(){const d=(S.pengaturan||[]).find(x=>x.id==='peta');return d&&d.mid}
function csvEsc(v){v=String(v==null?'':v);return(v.includes(',')||v.includes('"')||v.includes(String.fromCharCode(10)))?'"'+v.split('"').join('""')+'"':v}
function exportMyMaps(det) {
  const NL = String.fromCharCode(10);
  const rows = [['Nama', 'Wilayah', 'Alamat', 'Status', 'Kode']].concat(S.members.map((m, i) => [m.panggilan || m.nama, m.wilayah || m.pref || '', alamatJp(m, det), m.status || 'aktif', m.kode || 'MEM-' + String(i + 1).padStart(5, '0')]).filter(r => r[2] && r[2] !== 'Japan'));
  const blob = new Blob([String.fromCharCode(65279) + rows.map(r => r.map(csvEsc).join(',')).join(NL)], { type: 'text/csv;charset=utf-8' });
  const a = h('a', { href: URL.createObjectURL(blob), download: 'anggota-untuk-my-maps.csv' });
  document.body.append(a); a.click(); a.remove();
}
async function saveMid(inp){
  const u=inp.value.trim(),mm=(u.match(/[?&]mid=([^&#]+)/)||[])[1]||(/^[A-Za-z0-9_-]{20,}$/.test(u)?u:'');
  if(!mm){alert('Tautan tidak dikenali. Pakai tautan Google My Maps yang memuat "mid="');return}
  try{await S.db.collection('pengaturan').doc('peta').set({mid:mm,at:Date.now()});alert('Peta disimpan')}catch(e){alert('Gagal menyimpan')}}
function vPeta(){
  const mid=mapMid(),det=h('input',{type:'checkbox'}),inp=h('input',{placeholder:'Tempel tautan Google My Maps'});
  const ready=S.members.filter(m=>{const a=alamatJp(m,false);return a&&a!=='Japan'}).length;
  const map=mid?h('div',{},h('iframe',{src:'https://www.google.com/maps/d/embed?mid='+mid,style:'width:100%;height:420px;border:0;border-radius:18px;background:var(--line)',loading:'lazy',allow:'fullscreen'}),h('a',{class:'btn s',style:'display:inline-block;margin-top:10px;text-decoration:none',href:'https://www.google.com/maps/d/viewer?mid='+mid,target:'_blank'},'🗺️ Buka di Google My Maps')):h('p',{class:'warn'},'Belum ada peta. Admin bisa memasang tautan Google My Maps di bawah.');
  return [h('h1',{},'Peta & Wilayah'),h('p',{class:'sub'},ready+' dari '+S.members.length+' anggota punya alamat Jepang untuk dijadikan pin'),
    box(h('b',{},'🗺️ Peta Anggota'),map),
    S.admin&&box(h('b',{},'Pasang & perbarui peta'),
      h('p',{class:'warn'},'1) Unduh CSV. 2) Buka mymaps.google.com, buat peta baru, pilih Impor, lalu unggah CSV. 3) Pilih kolom Alamat untuk posisi pin dan kolom Nama untuk judul. 4) Bagikan peta, salin tautannya, tempel di bawah.'),
      h('label',{class:'warn',style:'display:block;margin:8px 0'},det,' Sertakan alamat jalan/gedung (lebih tepat, tetapi lebih sensitif)'),
      h('button',{class:'btn',style:'margin-bottom:10px',onclick:()=>exportMyMaps(det.checked)},'⬇️ Unduh CSV untuk My Maps ('+ready+' pin)'),
      inp,h('button',{class:'btn s',style:'margin-top:8px',onclick:()=>saveMid(inp)},'Simpan peta')),
    h('b',{style:'display:block;margin:6px 4px 10px'},'Sebaran per wilayah'),...sebaran()];
}
function sebaran(){const w=wilayah(),k=Object.keys(w);return k.length?k.map(n=>h('div',{class:'card',style:'display:block'},h('div',{class:'row'},h('b',{},'📍 '+n),h('span',{class:'tag'},w[n].length+' anggota')),h('small',{},w[n].map(x=>x.nama).join(', ')))):[h('p',{class:'warn'},'Belum ada data wilayah.')]}
