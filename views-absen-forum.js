/* Halaman Absensi dan Forum */
function vAbsen(){
  const t=h('input',{placeholder:'Nama kegiatan'});
  const list=S.events.map(e=>{const a=e.hadir||[],ya=a.includes(S.uid);
    return h('div',{class:'card'},h('span',{style:'flex:1'},h('b',{},e.judul),h('small',{},a.length+' hadir')),
      h('button',{class:'btn s',onclick:()=>S.db.collection('events').doc(e.id).update({hadir:ya?a.filter(x=>x!==S.uid):[...a,S.uid]}).catch(()=>alert('Tidak bisa menyimpan'))},ya?'Batal hadir':'Hadir'),
      S.admin&&h('button',{class:'btn s',onclick:()=>{if(confirm('Hapus kegiatan?'))S.db.collection('events').doc(e.id).delete()}},'✕'))});
  return [h('h1',{},'Absensi'),h('p',{class:'sub'},'Kegiatan & kehadiran'),guard(),
    S.admin&&h('div',{class:'card',style:'display:block'},t,h('button',{class:'btn',onclick:async()=>{if(!t.value.trim())return;await S.db.collection('events').add({judul:t.value.trim(),hadir:[],at:Date.now()});t.value=''}},'Buat kegiatan')),
    list.length?list:h('p',{class:'warn'},'Belum ada kegiatan.')];
}
function vForum(){
  const t=h('input',{placeholder:'Judul topik'}),b=h('textarea',{placeholder:'Isi diskusi',rows:3});
  const list=S.topics.map(x=>h('div',{class:'card',style:'display:block'},h('b',{},x.judul),h('p',{class:'warn'},x.isi||''),
    S.admin&&h('button',{class:'btn s',onclick:()=>S.db.collection('topics').doc(x.id).delete()},'Hapus')));
  return [h('h1',{},'Forum'),h('p',{class:'sub'},'Diskusi anggota'),guard(),
    h('div',{class:'card',style:'display:block'},t,b,h('button',{class:'btn',onclick:async()=>{if(!t.value.trim()||!S.db)return;await S.db.collection('topics').add({judul:t.value.trim(),isi:b.value.trim(),by:S.uid,at:Date.now()});t.value='';b.value=''}},'Kirim')),
    list.length?list:h('p',{class:'warn'},'Belum ada topik.')];
}
