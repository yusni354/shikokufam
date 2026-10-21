// Isi dengan data dari Supabase: Project Settings > API
const SUPABASE_URL = 'https://lmpclkiaabxpmmfazukj.supabase.co';
const SUPABASE_PUBLIC_KEY = 'sb_publishable_xBhgsypsu21yAYM7Q8HNtw_57MhED1d';
const SUPABASE_CONFIGURED = (() => {
	try {
		const url = new URL(SUPABASE_URL);
		const key = SUPABASE_PUBLIC_KEY.trim();
		return ['https:', 'http:'].includes(url.protocol)
			&& Boolean(url.host)
			&& !/GANTI|YOUR_/i.test(SUPABASE_URL)
			&& key.length > 0
			&& !/GANTI|YOUR_/i.test(key)
			&& !key.toLowerCase().startsWith('sb_secret_');
	} catch {
		return false;
	}
})();
