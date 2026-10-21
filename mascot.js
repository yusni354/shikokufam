/* Maskot: bisa digeser, ketuk untuk tanya admin */
/* ===== maskot: gambar diam, bisa digeser, ketuk untuk tanya admin ===== */
const ADMIN_WA=''; /* isi nomor WhatsApp admin, contoh: 6281234567890 */
const pet=$('#pet');let drag=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function closeMenu(){const m=$('#pm');if(m)m.remove()}
function askForm(){
  closeMenu();
  const ta=h('textarea',{rows:4,placeholder:'Tulis pertanyaan untuk admin...'});
  const m=h('div',{id:'qm'},h('div',{class:'card',style:'display:block;max-width:420px'},h('b',{},'💬 Tanya Admin'),ta,
    h('div',{class:'row',style:'justify-content:flex-start;margin-top:8px'},
      h('button',{class:'btn',onclick:async()=>{if(!ta.value.trim())return;if(!S.db){alert('Database belum aktif');return}
        try{await S.db.collection('tanya').add({teks:ta.value.trim(),by:S.uid,nama:S.name||'Anggota',at:Date.now()});m.remove();alert('Terkirim. Admin akan membaca pertanyaan Anda.')}catch(e){alert('Gagal mengirim')}}},'Kirim'),
      h('button',{class:'btn s',onclick:()=>m.remove()},'Batal'))));
  document.body.append(m);ta.focus()}
function openMenu(){
  if($('#pm'))return closeMenu();
  document.body.append(h('div',{id:'pm'},h('b',{},'Mau tanya apa? 😊'),
    h('button',{class:'btn',onclick:askForm},'✍️ Tulis pertanyaan ke Admin'),
    ADMIN_WA&&h('a',{class:'btn s',href:'https://wa.me/'+ADMIN_WA+'?text='+encodeURIComponent('Halo Admin, saya mau bertanya...'),target:'_blank'},'📲 Chat WhatsApp Admin'),
    h('button',{class:'btn s',onclick:closeMenu},'Tutup')))}
pet.addEventListener('pointerdown',e=>{const r=pet.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,l:r.left,t:r.top,m:false};try{pet.setPointerCapture(e.pointerId)}catch(_){}});
pet.addEventListener('pointermove',e=>{
  if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.m){if(Math.hypot(dx,dy)<8)return;drag.m=true;closeMenu();pet.style.right=pet.style.bottom='auto'}
  pet.style.left=clamp(drag.l+dx,0,innerWidth-pet.offsetWidth)+'px';pet.style.top=clamp(drag.t+dy,60,innerHeight-pet.offsetHeight-4)+'px'});
pet.addEventListener('pointerup',()=>{if(!drag)return;const moved=drag.m;drag=null;if(!moved)openMenu()});
pet.addEventListener('pointercancel',()=>{drag=null});
addEventListener('resize',()=>{if(pet.style.left){pet.style.left=clamp(pet.offsetLeft,0,innerWidth-pet.offsetWidth)+'px';pet.style.top=clamp(pet.offsetTop,60,innerHeight-pet.offsetHeight-4)+'px'}});
