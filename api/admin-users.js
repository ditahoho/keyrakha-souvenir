module.exports = async function handler(req, res) {
  const url = process.env.KEYRAKHA_SUPABASE_URL;
  const publishable = process.env.KEYRAKHA_SUPABASE_PUBLISHABLE_KEY;
  const service = process.env.KEYRAKHA_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !publishable || !service) return res.status(500).json({ error: 'Server user management belum dikonfigurasi.' });

  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Sesi tidak ditemukan.' });

  const rpc = await fetch(`${url}/rest/v1/rpc/get_admin_profile`, {
    method: 'POST',
    headers: { apikey: publishable, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{}'
  });
  const caller = await rpc.json().catch(() => null);
  if (!rpc.ok || !caller || caller.role !== 'superadmin' || caller.active !== true) {
    return res.status(403).json({ error: 'Hanya superadmin yang dapat menambah pengguna.' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method tidak didukung.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!name || !email || password.length < 8) return res.status(400).json({ error: 'Nama, email, dan password minimal 8 karakter wajib diisi.' });

  const create = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: { apikey: service, Authorization: `Bearer ${service}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { name } })
  });
  const created = await create.json().catch(() => ({}));
  if (!create.ok) return res.status(create.status).json({ error: created.msg || created.message || created.error_description || 'Gagal membuat akun.' });

  const user = created.user || created;
  const profileResp = await fetch(`${url}/rest/v1/admin_users?on_conflict=user_id`, {
    method: 'POST',
    headers: {
      apikey: service,
      Authorization: `Bearer ${service}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify([{ user_id: user.id, email, name, role: 'editor', active: true }])
  });
  const profile = await profileResp.json().catch(() => []);
  if (!profileResp.ok) {
    await fetch(`${url}/auth/v1/admin/users/${encodeURIComponent(user.id)}`, { method: 'DELETE', headers: { apikey: service, Authorization: `Bearer ${service}` } });
    return res.status(500).json({ error: profile?.message || 'Akun Auth dibuat tetapi profil akses gagal. Akun dibatalkan.' });
  }
  return res.status(201).json({ user: Array.isArray(profile) ? profile[0] : profile });
};
