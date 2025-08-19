// Netlify Function: Admins management with Supabase Auth
// Validates Supabase JWT (Authorization: Bearer <token>) and checks membership in public.admins
// Requires env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE

exports.handler = async (event) => {
  const method = event.httpMethod;
  const bearer = event.headers['authorization'] || event.headers['Authorization'] || '';
  const match = bearer.match(/^Bearer\s+(.+)$/i);
  if (!match) return { statusCode: 401, headers: cors(), body: 'Missing bearer token' };
  const jwt = match[1];

  const supaUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const srvKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY;
  if (!supaUrl || !anonKey || !srvKey) return { statusCode: 500, headers: cors(), body: 'Missing Supabase env vars' };

  // Get user from Auth
  const userRes = await fetch(`${supaUrl}/auth/v1/user`, {
    headers: { 'apikey': anonKey, 'Authorization': `Bearer ${jwt}` }
  });
  if (!userRes.ok) return { statusCode: 401, headers: cors(), body: 'Invalid token' };
  const user = await userRes.json();
  const email = (user && user.email || '').toLowerCase();
  if (!email) return { statusCode: 401, headers: cors(), body: 'No email in token' };

  // Check if the user is admin via RLS select (policy must allow self-select)
  const checkUrl = new URL(`${supaUrl}/rest/v1/admins`);
  checkUrl.searchParams.set('select', 'email');
  checkUrl.searchParams.set('email', `eq.${email}`);
  const chk = await fetch(checkUrl.toString(), { headers: { 'apikey': anonKey, 'Authorization': `Bearer ${jwt}` } });
  if (!chk.ok) return { statusCode: 403, headers: cors(), body: 'Not authorized' };
  const list = await chk.json();
  if (!Array.isArray(list) || list.length === 0) return { statusCode: 403, headers: cors(), body: 'Not an admin' };

  try {
    if (method === 'GET') {
      // List admins using service role
      const url = new URL(`${supaUrl}/rest/v1/admins`);
      url.searchParams.set('select', '*');
      url.searchParams.set('order', 'created_at.desc');
      const res = await fetch(url.toString(), { headers: sHeaders(srvKey) });
      const data = await res.json();
      return { statusCode: res.ok?200:res.status, headers: jcors(), body: JSON.stringify(data) };
    }
    if (method === 'POST') {
      let payload = {};
      try { payload = JSON.parse(event.body||'{}'); } catch {}
      const newEmail = String(payload.email||'').trim().toLowerCase();
      if (!newEmail || !/.+@.+\..+/.test(newEmail)) return { statusCode: 400, headers: cors(), body: 'Invalid email' };
      const res = await fetch(`${supaUrl}/rest/v1/admins`, {
        method: 'POST', headers: { ...sHeaders(srvKey), 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({ email: newEmail })
      });
      const data = await res.json().catch(()=>({}));
      return { statusCode: res.ok?200:res.status, headers: jcors(), body: JSON.stringify(data) };
    }
    if (method === 'DELETE') {
      const newEmail = (event.queryStringParameters && event.queryStringParameters.email) ? String(event.queryStringParameters.email).toLowerCase() : '';
      if (!newEmail) return { statusCode: 400, headers: cors(), body: 'Missing email' };
      const url = new URL(`${supaUrl}/rest/v1/admins`);
      url.searchParams.set('email', `eq.${newEmail}`);
      const res = await fetch(url.toString(), { method: 'DELETE', headers: sHeaders(srvKey) });
      if (!res.ok) { const txt = await res.text().catch(()=> ''); return { statusCode: res.status, headers: cors(), body: txt }; }
      return { statusCode: 200, headers: jcors(), body: JSON.stringify({ deleted: true }) };
    }
    return { statusCode: 405, headers: cors(), body: 'Method Not Allowed' };
  } catch (err) {
    return { statusCode: 500, headers: cors(), body: err.message };
  }
};

function sHeaders(key){ return { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }; }
function cors(){ return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }; }
function jcors(){ return { ...cors(), 'Content-Type': 'application/json' }; }
