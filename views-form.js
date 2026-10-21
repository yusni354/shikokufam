/* Formulir Tambah/Ubah Anggota (5 langkah) */
const PREF=['Ehime','Kagawa','Kochi','Tokushima','Hokkaido','Aomori','Iwate','Miyagi','Akita','Yamagata','Fukushima','Ibaraki','Tochigi','Gunma','Saitama','Chiba','Tokyo','Kanagawa','Niigata','Toyama','Ishikawa','Fukui','Yamanashi','Nagano','Gifu','Shizuoka','Aichi','Mie','Shiga','Kyoto','Osaka','Hyogo','Nara','Wakayama','Tottori','Shimane','Okayama','Hiroshima','Yamaguchi','Fukuoka','Saga','Nagasaki','Kumamoto','Oita','Miyazaki','Kagoshima','Okinawa'];
const PROV=['Aceh','Sumatera Utara','Sumatera Barat','Riau','Kepulauan Riau','Jambi','Sumatera Selatan','Bangka Belitung','Bengkulu','Lampung','DKI Jakarta','Banten','Jawa Barat','Jawa Tengah','DI Yogyakarta','Jawa Timur','Bali','Nusa Tenggara Barat','Nusa Tenggara Timur','Kalimantan Barat','Kalimantan Tengah','Kalimantan Selatan','Kalimantan Timur','Kalimantan Utara','Sulawesi Utara','Gorontalo','Sulawesi Tengah','Sulawesi Barat','Sulawesi Selatan','Sulawesi Tenggara','Maluku','Maluku Utara','Papua','Papua Barat','Papua Barat Daya','Papua Selatan','Papua Tengah','Papua Pegunungan'];
const BLN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const TGL=['Technical Intern (Ginou Jisshu)','Specified Skilled Worker (Tokutei Ginou)','Engineer/Specialist','Pelajar','Permanent Resident','Dependent/Keluarga','Lainnya'];
function fld(l,k,o){o=o||{};const f=S.form;let e;
  if(o.opts)e=h('select',{},h('option',{value:''},o.ph||'Pilih'),...o.opts.map(x=>h('option',{value:x},x)));
  else if(o.area)e=h('textarea',{rows:3,placeholder:o.ph||''});
  else e=h('input',{placeholder:o.ph||'',type:o.type||'text'});
  if(o.opts&&f[k]&&!o.opts.includes(f[k]))e.append(h('option',{value:f[k]},f[k]));e.value=f[k]||'';e.oninput=e.onchange=()=>{f[k]=e.value};
  return h('label',{class:'lb'},l,e)}
const box=(...k)=>h('div',{class:'card',style:'display:block'},...k);
async function up(file,key,multi){
  if(!file)return;if(!S.assets){alert('Unggah foto hanya tersedia untuk admin');return}
  try{const r=await S.assets.upload(file);S.form[key]=multi?[...(S.form[key]||[]),r.id]:r.id;render()}catch(e){alert('Gagal mengunggah')}}
function pick(label,acc,cap,cb){const i=h('input',{type:'file',accept:acc,style:'display:none'});if(cap)i.setAttribute('capture','environment');i.onchange=()=>cb(i.files[0]);return h('button',{class:'btn s',onclick:()=>i.click()},label)}
async function saveForm(){
  const f=S.form;
  if(!f.wilayah){S.step=0;alert('Wilayah wajib diisi');return render()}
  if(!(f.nama||'').trim()){S.step=0;alert('Nama lengkap wajib diisi');return render()}
  const d={...f};delete d.id;d.peran=d.peran||'Anggota';d.status=d.status||'aktif';
  try{if(f.id)await S.db.collection('members').doc(f.id).set(d);else await S.db.collection('members').add({...d,at:Date.now()});S.form=null;render()}catch(e){alert('Tidak bisa menyimpan')}}
function formCard(){
  const f=S.form;
  if(S._fr!==f){S._fr=f;S.step=0;if(!f.id&&!f.kode){const n=Math.max(S.members.length,...S.members.map(m=>parseInt(String(m.kode||'').split('-').pop())||0))+1;f.kode='IJCCS-'+String(n).padStart(4,'0')}}
  const yr=Array.from({length:12},(_,i)=>String(new Date().getFullYear()-i));
  const fotoBox=()=>box(h('b',{},'Foto Diri'),h('br'),f.foto&&h('img',{src:blobUrl(f.foto),style:'width:80px;height:80px;border-radius:50%;object-fit:cover;margin:8px 0;display:block'}),pick('Ambil Foto','image/jpeg,image/png,image/webp',1,x=>up(x,'foto')),' ',pick('Pilih dari Galeri','image/jpeg,image/png,image/webp',0,x=>up(x,'foto')),h('p',{class:'warn'},'Format JPG, JPEG, PNG, WEBP.'));
  const suratBox=()=>box(h('b',{},'Surat Sambung'),h('br'),...(f.surat||[]).map((id,i)=>h('div',{class:'row',style:'margin:6px 0'},h('a',{href:blobUrl(id),target:'_blank'},'Lampiran '+(i+1)),h('button',{class:'btn s',onclick:()=>{f.surat=f.surat.filter(x=>x!==id);render()}},'✕'))),pick('Ambil Foto','image/*,application/pdf',1,x=>up(x,'surat',1)),' ',pick('Pilih dari Galeri','image/*,application/pdf',0,x=>up(x,'surat',1)),h('p',{class:'warn'},'Foto, scan, atau PDF. Boleh beberapa file.'));
  const T=[
   ['Identitas',()=>[box(h('b',{},'Identitas'),fld('Wilayah *','wilayah',{opts:PREF,ph:'Pilih wilayah'}),fld('Nomor Anggota','kode'),fld('Nama Lengkap *','nama'),fld('Nama Panggilan','panggilan'),fld('Jenis Kelamin','kelamin',{opts:['Laki-laki','Perempuan']}),fld('Tanggal Lahir','lahir',{type:'date'}),fld('Status','status',{opts:STATUS}),fld('Peran','peran',{opts:PERAN}),fld('Pernikahan','nikah',{opts:['Belum menikah','Menikah','Cerai']}),fld('MT','mt'),fld('Nama Orang Tua','ortu'),fld('No. HP Orang Tua','hp_ortu',{ph:'+62xxxxxxxxxx'}),h('div',{class:'fl'},fld('Bulan Kedatangan','bln',{opts:BLN}),fld('Tahun','thn',{opts:yr})))]],
   ['Alamat Indonesia',()=>[box(h('b',{},'Alamat Indonesia'),fld('Provinsi','prov',{opts:PROV,ph:'Pilih provinsi'}),fld('Kabupaten/Kota','kab'),fld('Kecamatan','kec'),fld('Desa/Kelurahan','desa'),fld('Kelompok','kelompok'),fld('Daerah','daerah'),fld('Alamat Lengkap Indonesia (nama jalan, nomor rumah, gedung, RT/RW)','alamat_id',{area:1,ph:'Contoh: Jl. Kebon Sirih No. 10, RT 3/RW 5'}),fld('Nama Pengurus Daerah','pengurus'),fld('No. HP Pengurus Daerah','hp_pengurus',{ph:'+81xxxxxxxxxx'}))]],
   ['Alamat Jepang',()=>[box(h('b',{},'Alamat Jepang'),fld('Kode Pos','kodepos',{ph:'7 digit, misal 1600022'}),fld('Prefektur','pref',{opts:PREF,ph:'Pilih prefektur'}),fld('Kota','kota'),fld('Kecamatan (romaji)','kec_jp'),fld('Stasiun Terdekat','stasiun'),fld('Alamat Jalan / Gedung Jepang','alamat_jp',{area:1,ph:'Nama jalan, nomor blok, gedung, dsb. (romaji)'}))]],
   ['Pekerjaan & Kontak',()=>[box(h('b',{},'Bidang Pekerjaan'),fld('Bidang Pekerjaan','bidang'),fld('Nama Perusahaan','perusahaan'),fld('Status Tinggal di Jepang','tinggal',{opts:TGL,ph:'Pilih status tinggal'})),box(h('b',{},'Kontak & Media Sosial'),fld('Nomor HP / WA','wa',{ph:'+81xxxxxxxxxx'}),fld('Email','email',{type:'email'}),fld('Instagram','instagram',{ph:'@username'}),fld('TikTok','tiktok',{ph:'@username'}),fld('Facebook','facebook'))]],
   ['Foto, Surat & Catatan',()=>[fotoBox(),suratBox(),box(h('b',{},'Catatan'),fld('','catatan',{area:1,ph:'Catatan tambahan...'}))]]
  ];
  const last=S.step===T.length-1;
  return h('div',{},h('div',{class:'row',style:'justify-content:flex-start;gap:12px;margin:8px 0'},h('button',{class:'ic',onclick:()=>{S.form=null;render()}},'←'),h('h1',{style:'margin:0;font-size:24px'},f.id?'Ubah Anggota':'Tambah Anggota')),
    h('p',{class:'sub',style:'margin-bottom:6px'},'Langkah '+(S.step+1)+' dari '+T.length+': '+T[S.step][0]),
    h('div',{class:'dots'},...T.map((_,i)=>h('span',{class:i<=S.step?'on':''}))),
    ...T[S.step][1](),
    h('div',{class:'nav'},S.step>0&&h('button',{class:'btn s',onclick:()=>{S.step--;render();scrollTo(0,0)}},'Kembali'),
      h('button',{class:'btn',onclick:()=>{if(last)saveForm();else{S.step++;render();scrollTo(0,0)}}},last?'Simpan':'Lanjut')))}
