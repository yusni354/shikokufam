/* Dasar aplikasi: state, helper DOM, daftar menu, navigasi */
const S={members:[],events:[],topics:[],view:'dash',admin:false,uid:null,name:'',db:null};
const $=s=>document.querySelector(s);
function h(t,p,...k){const e=document.createElement(t);for(const a in p||{}){if(a==='onclick')e.onclick=p[a];else if(a==='class')e.className=p[a];else e.setAttribute(a,p[a])}k.flat().forEach(c=>{if(c!=null&&c!==false)e.append(c)});return e}
const ALL=[['dash','🏠 Dashboard'],['members','👥 Data Anggota'],['absen','📝 Absensi'],['forum','💬 Forum'],['peta','🗺️ Peta & Wilayah'],['import','📥 Import Database',1],['op','🛡️ Operator',1],['pesan','📨 Pesan Masuk',1]];
function go(v){S.view=v;S.form=S.detail=null;document.body.classList.remove('open');render()}
$('#mn').onclick=()=>document.body.classList.add('open');
$('#ov').onclick=()=>document.body.classList.remove('open');

function wilayah(){const m={};S.members.forEach(x=>{const w=x.wilayah||'Belum diisi';(m[w]=m[w]||[]).push(x)});return m}
function guard(){return S.db?null:h('p',{class:'warn'},'Database belum aktif. Buka halaman ini dari tautan Artifact dan masuk ke akun Anda.')}
