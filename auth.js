/* Login, pendaftaran, persetujuan admin, dan pemulaan aplikasi */
const PESAN = { 'Invalid login credentials': 'Email atau kata sandi salah', 'Email not confirmed': 'Email belum dikonfirmasi. Cek kotak masuk Anda.' };

function guestScreen(...k) {
  document.body.classList.add('guest');
  $('#auth').replaceChildren(h('div', { class: 'card auth', style: 'display:block' }, ...k));
}
async function logout() { if (sb) await sb.auth.signOut(); location.reload(); }

function showLogin() {
  let mode = 'in';
  const draw = () => {
    const em = h('input', { type: 'email', placeholder: 'Email', autocomplete: 'email' }),
      pw = h('input', { type: 'password', placeholder: 'Kata sandi (minimal 6 karakter)', autocomplete: mode === 'in' ? 'current-password' : 'new-password' }),
      nm = h('input', { placeholder: 'Nama lengkap' }), err = h('p', { class: 'err' }),
      tab = (m, t) => h('button', { class: 'btn s' + (mode === m ? ' on' : ''), onclick: () => { mode = m; draw(); } }, t),
      ok = h('button', { class: 'btn', style: 'width:100%;margin-top:8px' }, mode === 'in' ? 'Masuk' : 'Daftar');
    ok.onclick = async () => {
      err.textContent = ''; ok.disabled = true;
      try {
        if (mode === 'in') {
          const { error } = await sb.auth.signInWithPassword({ email: em.value.trim(), password: pw.value });
          if (error) throw error; location.reload();
        } else {
          if (!nm.value.trim()) throw new Error('Nama lengkap wajib diisi');
          const { data, error } = await sb.auth.signUp({ email: em.value.trim(), password: pw.value, options: { data: { nama: nm.value.trim() } } });
          if (error) throw error;
          if (data.session) location.reload(); else err.textContent = 'Pendaftaran berhasil. Cek email Anda untuk konfirmasi, lalu masuk.';
        }
      } catch (e) { err.textContent = PESAN[e.message] || e.message || 'Terjadi kesalahan'; }
      ok.disabled = false;
    };
    guestScreen(h('div', { class: 'logo big' }, '✓'), h('h1', {}, 'Komunitas ID-JP'), h('p', { class: 'sub' }, 'Database Anggota'),
      h('div', { class: 'fl' }, tab('in', 'Masuk'), tab('up', 'Daftar')), mode === 'up' && nm, em, pw, err, ok,
      mode === 'up' && h('p', { class: 'warn' }, 'Setelah mendaftar, akun Anda perlu disetujui admin sebelum bisa dipakai.'));
  };
  draw();
}

function showWait(role) {
  const no = role === 'ditolak';
  guestScreen(h('div', { style: 'font-size:44px;text-align:center' }, no ? '⛔' : '⏳'),
    h('h1', { style: 'text-align:center' }, no ? 'Pendaftaran ditolak' : 'Menunggu persetujuan'),
    h('p', { class: 'sub', style: 'text-align:center' }, no ? 'Hubungi admin komunitas jika ini keliru.' : 'Akun Anda sudah terdaftar. Admin akan menyetujuinya sebelum Anda bisa masuk.'),
    h('button', { class: 'btn', style: 'width:100%', onclick: () => location.reload() }, 'Periksa lagi'),
    h('div', { style: 'height:8px' }), h('button', { class: 'btn s', style: 'width:100%', onclick: logout }, 'Keluar'));
}

async function loadProfiles() {
  const { data } = await sb.from('profiles').select('*').order('created_at');
  S.profiles = data || []; render();
}

async function boot() {
  if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  if (!SUPABASE_CONFIGURED) {
    return guestScreen(h('h1', {}, 'Konfigurasi Supabase belum valid'), h('p', { class: 'warn' }, 'Periksa SUPABASE_URL dan SUPABASE_PUBLIC_KEY di config.js. Gunakan key publik (publishable atau anon), bukan key secret.'));
  }
  if (!sb) {
    return guestScreen(h('h1', {}, 'Supabase belum termuat'), h('p', { class: 'warn' }, 'Periksa koneksi internet atau pemuatan library Supabase, lalu muat ulang halaman.'));
  }
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return showLogin();
  const u = session.user;
  const { data: p } = await sb.from('profiles').select('*').eq('id', u.id).maybeSingle();
  S.uid = u.id; S.name = (p && p.nama) || u.email; S.role = (p && p.role) || 'pending';
  if (S.role !== 'member' && S.role !== 'admin') return showWait(S.role);
  S.admin = S.role === 'admin';
  S.assets = S.admin ? { upload: uploadMedia } : null;
  S.db = DB;
  ['members', 'events', 'topics', 'tanya', 'pengaturan'].forEach(n => sub(n, n));
  if (S.admin) loadProfiles();
  document.body.classList.remove('guest');
  render();
}
boot();
