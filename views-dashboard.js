/* Halaman Dashboard */
function vDash(){
  const c=(e,t,d,n,v)=>h('button',{class:'card',onclick:()=>go(v)},h('span',{class:'e'},e),h('span',{style:'flex:1'},h('b',{},t),h('small',{},d),h('br'),h('b',{style:'font-size:15px'},n)),'›');
  return [h('h1',{},'Selamat datang'+(S.name?', '+S.name.split(' ')[0]:'')+' 👋'),
    h('p',{class:'sub'},new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})),
    S.admin&&(S.profiles||[]).some(p=>p.role==='pending')&&h('button',{class:'card',onclick:()=>go('op')},h('span',{class:'e'},'🔔'),h('span',{style:'flex:1'},h('b',{},(S.profiles||[]).filter(p=>p.role==='pending').length+' pendaftar menunggu persetujuan'),h('small',{},'Ketuk untuk meninjau')),'›'),
    h('div',{class:'stats'},...[['Anggota',S.members.length],['Kegiatan',S.events.length],['Wilayah',Object.keys(wilayah()).length]].map(x=>h('div',{},h('small',{},x[0]),h('b',{},String(x[1]))))),
    c('🗄️','Database','Kelola data anggota komunitas',S.members.length+' anggota','members'),
    c('📋','Absensi','Kegiatan & kehadiran anggota',S.events.length+' kegiatan','absen'),
    c('💬','Forum','Diskusi & komentar anggota',S.topics.length+' topik','forum'),
    c('🗺️','Peta & Wilayah','Sebaran anggota di Jepang',Object.keys(wilayah()).length+' wilayah','peta')];
}
