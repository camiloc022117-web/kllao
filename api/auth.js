const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'POST': {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ error: 'Email y password requeridos' });
        }

        const resp = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY
          },
          body: JSON.stringify({ email, password })
        });

        const data = await resp.json();

        if (!resp.ok) {
          return res.status(401).json({ error: data.msg || 'Credenciales invalidas' });
        }

        return res.status(200).json({
          user: { id: data.user.id, email: data.user.email },
          session: { access_token: data.access_token, refresh_token: data.refresh_token }
        });
      }

      case 'GET': {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Token requerido' });
        }

        const token = authHeader.split(' ')[1];

        const resp = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': SUPABASE_KEY
          }
        });

        const data = await resp.json();

        if (!resp.ok) {
          return res.status(401).json({ error: 'Token invalido' });
        }

        return res.status(200).json({
          user: { id: data.id, email: data.email }
        });
      }

      default:
        return res.status(405).json({ error: 'Metodo no permitido' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
