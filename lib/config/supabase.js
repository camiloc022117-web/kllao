const { createClient } = require('@supabase/supabase-js');

let client;

module.exports = function getSupabase() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    }
    client = createClient(url, key);
  }
  return client;
};
