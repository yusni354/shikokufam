/* Halaman Absensi dan Forum */
function vAbsen(){
  const t=h('input',{placeholder:'Nama kegiatan'}),
    date=h('input',{type:'date'}),
    time=h('input',{type:'time'}),
    location=h('input',{placeholder:'Lokasi (opsional)'});
  const downloadAttendance=async e=>{
    const ids=[...new Set((e.hadir||[]).filter(id=>typeof id==='string'&&id))];
    let profiles=[];
    if(ids.length){
      const {data,error}=await sb.from('profiles').select('id,nama,email').in('id',ids);
      if(error){alert('Gagal memuat data anggota: '+error.message);return}
      profiles=data||[];
    }
    const byId=new Map(profiles.map(p=>[p.id,p]));
    const csvValue=value=>{
      let text=String(value??'');
      if(/^[\t\r=+\-@]/.test(text))text="'"+text;
      return '"'+text.replaceAll('"','""')+'"';
    };
    const lines=[
      ['Nama kegiatan',e.judul],
      ['Tanggal',e.tanggal||''],
      ['Waktu',e.waktu||''],
      ['Lokasi',e.lokasi||''],
      [],
      ['Nama anggota','Email','ID pengguna'],
      ...ids.map(id=>{const p=byId.get(id);return[p?.nama||'Anggota',p?.email||'',id]})
    ].map(row=>row.map(csvValue).join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF',lines],{type:'text/csv;charset=utf-8'}));
    const a=h('a',{href:url,download:'absensi-'+(e.judul||'kegiatan').replace(/[^a-z0-9_-]+/gi,'-')+'.csv'});
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const list=S.events.map(e=>{const a=e.hadir||[],ya=a.includes(S.uid);
    const detail=[e.tanggal&&new Date(e.tanggal+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}),e.waktu,e.lokasi].filter(Boolean).join(' · ');
    return h('div',{class:'card'},h('span',{style:'flex:1'},h('b',{},e.judul),detail&&h('small',{},detail),h('small',{},a.length+' hadir')),
      h('button',{class:'btn s',onclick:()=>S.db.collection('events').doc(e.id).update({hadir:ya?a.filter(x=>x!==S.uid):[...a,S.uid]}).catch(()=>alert('Tidak bisa menyimpan'))},ya?'Batal hadir':'Hadir'),
      S.admin&&h('button',{class:'btn s',onclick:()=>downloadAttendance(e).catch(err=>alert('Gagal mengekspor absensi: '+err.message))},'Ekspor CSV'),
      S.admin&&h('button',{class:'btn s',onclick:()=>{if(confirm('Hapus kegiatan?'))S.db.collection('events').doc(e.id).delete()}},'✕'))});
  return [h('h1',{},'Absensi'),h('p',{class:'sub'},'Kegiatan & kehadiran'),guard(),
    S.admin&&h('div',{class:'card',style:'display:block'},t,date,time,location,h('button',{class:'btn',onclick:async()=>{if(!t.value.trim()){alert('Nama kegiatan wajib diisi');return}try{await S.db.collection('events').add({judul:t.value.trim(),tanggal:date.value,waktu:time.value,lokasi:location.value.trim(),hadir:[],at:Date.now()});t.value=date.value=time.value=location.value=''}catch(e){alert('Gagal membuat kegiatan: '+e.message)}}},'Buat kegiatan')),
    list.length?list:h('p',{class:'warn'},'Belum ada kegiatan.')];
}
function vForum(){
  const t=h('input',{placeholder:'Judul topik',maxlength:'120'}),
    b=h('textarea',{placeholder:'Isi diskusi',rows:3,maxlength:'4000'}),
    createError=h('p',{class:'err'});
  const list=[...S.topics].sort((a,b)=>(b.at||0)-(a.at||0)).map(topic=>{
    const topicComments=(S.comments||[]).filter(comment=>comment.topic_id===topic.id).sort((a,b)=>(a.at||0)-(b.at||0));
    const commentInput=h('textarea',{placeholder:'Tulis komentar...',rows:2,maxlength:'1500'}),
      commentError=h('p',{class:'err'});
    const comments=topicComments.map(comment=>{
      const editing=S.commentEdit?.id===comment.id;
      const editInput=editing?h('textarea',{rows:2,maxlength:'1500'}):null;
      if(editInput)editInput.value=S.commentEdit.isi;
      return h('div',{class:'forum-comment'},
        h('div',{class:'row'},h('b',{},comment.nama||'Anggota'),h('small',{},comment.edited_at?'Diedit':' ')),
        editing?editInput:h('p',{style:'white-space:pre-wrap;margin:6px 0'},comment.isi||''),
        h('div',{class:'fl'},
          editing&&h('button',{class:'btn s',onclick:async()=>{
            const isi=editInput.value.trim();
            if(!isi){alert('Komentar tidak boleh kosong');return}
            try{await S.db.collection('comments').doc(comment.id).update({isi,edited_at:Date.now()});S.commentEdit=null;render()}
            catch(e){alert('Gagal mengubah komentar: '+e.message)}
          }},'Simpan'),
          editing&&h('button',{class:'btn s',onclick:()=>{S.commentEdit=null;render()}},'Batal'),
          !editing&&comment.by===S.uid&&h('button',{class:'btn s',onclick:()=>{S.commentEdit={id:comment.id,isi:comment.isi||''};render()}},'Ubah'),
          !editing&&(S.admin||comment.by===S.uid)&&h('button',{class:'btn s',onclick:async()=>{
            if(!confirm('Hapus komentar ini?'))return;
            try{await S.db.collection('comments').doc(comment.id).delete()}
            catch(e){alert('Gagal menghapus komentar: '+e.message)}
          }},'Hapus')));
    });
    return h('article',{class:'card forum-topic',style:'display:block'},
      h('div',{class:'row'},h('b',{},topic.judul),S.admin&&h('button',{class:'btn s',onclick:async()=>{
        if(!confirm('Hapus topik dan seluruh komentarnya?'))return;
        try{
          for(const comment of topicComments)await S.db.collection('comments').doc(comment.id).delete();
          await S.db.collection('topics').doc(topic.id).delete();
        }catch(e){alert('Gagal memoderasi topik: '+e.message)}
      }},'Hapus topik')),
      h('small',{class:'warn'},(topic.nama||'Anggota')+(topic.at?' · '+new Date(topic.at).toLocaleString('id-ID'):'')),
      h('p',{style:'white-space:pre-wrap'},topic.isi||''),
      h('div',{class:'forum-comments'},...comments),
      h('label',{class:'lb'},'Komentar',commentInput),commentError,
      h('button',{class:'btn s',onclick:async()=>{
        const isi=commentInput.value.trim();
        if(!isi){commentError.textContent='Tulis komentar terlebih dahulu';return}
        try{
          await S.db.collection('comments').add({topic_id:topic.id,isi,by:S.uid,nama:S.name||'Anggota',at:Date.now()});
          commentInput.value='';commentError.textContent='';
        }catch(e){commentError.textContent='Gagal mengirim komentar: '+e.message}
      }},'Kirim komentar'));
  });
  return [h('h1',{},'Forum'),h('p',{class:'sub'},'Diskusi anggota'),guard(),
    h('div',{class:'card',style:'display:block'},t,b,createError,h('button',{class:'btn',onclick:async()=>{
      const judul=t.value.trim(),isi=b.value.trim();
      if(!judul||!isi){createError.textContent='Judul dan isi diskusi wajib diisi';return}
      try{await S.db.collection('topics').add({judul,isi,by:S.uid,nama:S.name||'Anggota',at:Date.now()});t.value='';b.value='';createError.textContent=''}
      catch(e){createError.textContent='Gagal membuat topik: '+e.message}
    }},'Buat topik')),
    list.length?list:h('p',{class:'warn'},'Belum ada topik.')];
}
