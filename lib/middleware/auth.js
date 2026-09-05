const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

const auth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = header.split(' ')[1];

  try {
    const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_KEY
      }
    });

    if (!resp.ok) {
      return res.status(401).json({ error: 'Token invalido' });
    }

    const data = await resp.json();
    req.user = data;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalido' });
  }
};

module.exports = auth;
