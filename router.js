/* Router, tampilan menu, dan langganan data */
const V={dash:vDash,members:vMembers,absen:vAbsen,forum:vForum,peta:vPeta,import:vImport,op:vOp,pesan:vPesan};
function render(){
  const d=$('#dr');d.replaceChildren(h('p',{class:'sub',style:'padding:0 14px'},h('b',{style:'color:var(--ink)'},'KOMUNITAS ID-JP'),h('br'),'Database Anggota'),h('p',{class:'warn',style:'padding:0 14px'},'👤 '+(S.name||'')+' · '+({admin:'Admin',member:'Anggota'}[S.role]||'')),
    ...ALL.filter(x=>!x[2]||S.admin).map(x=>h('a',{class:S.view===x[0]?'on':'',onclick:()=>go(x[0])},x[1])),h('a',{onclick:logout,style:'color:#c0392b'},'🚪 Keluar'));
  if(!V[S.view]||(ALL.find(x=>x[0]===S.view)||[])[2]&&!S.admin)S.view='dash';
  $('#app').replaceChildren(...[].concat(V[S.view]()).filter(Boolean));
  const tb=$('#tb');tb.style.display=S.form?'none':'flex';$('#pet').style.display=S.form?'none':'block';
  tb.replaceChildren(...[['dash','🏠','Beranda'],['members','👥','Anggota'],['absen','📝','Absensi'],['forum','💬','Forum']].map(x=>h('a',{class:S.view===x[0]?'on':'',onclick:()=>go(x[0])},h('span',{},x[1]),x[2])));
}
function sub(name,key){S.db.collection(name).onSnapshot(s=>{S[key]=s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.at||0)-(b.at||0));render()},()=>{})}
