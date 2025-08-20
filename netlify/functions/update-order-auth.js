// Netlify Function: Update order with Supabase Auth
// Authorization: Bearer <Supabase JWT>
// Body JSON: { session_id, status?, note? }
// Requires env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE

exports.handler = async (event) => {
  if (event.httpMethod !== 'PATCH') {
    return { statusCode: 405, headers: cors(), body: 'Method Not Allowed' };
  }
  const bearer = event.headers['authorization'] || event.headers['Authorization'] || '';
  const match = bearer.match(/^Bearer\s+(.+)$/i);
  if (!match) return { statusCode: 401, headers: cors(), body: 'Missing bearer token' };
  const jwt = match[1];

  const supaUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const srvKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY;
  if (!supaUrl || !anonKey || !srvKey) return { statusCode: 500, headers: cors(), body: 'Missing Supabase env vars' };

  // Validate user and admin membership
  const userRes = await fetch(`${supaUrl}/auth/v1/user`, {
    headers: { 'apikey': anonKey, 'Authorization': `Bearer ${jwt}` }
  });
  if (!userRes.ok) return { statusCode: 401, headers: cors(), body: 'Invalid token' };
  const user = await userRes.json();
  const email = (user && user.email || '').toLowerCase();
  if (!email) return { statusCode: 401, headers: cors(), body: 'No email in token' };

  const checkUrl = new URL(`${supaUrl}/rest/v1/admins`);
  checkUrl.searchParams.set('select', 'email');
  checkUrl.searchParams.set('email', `eq.${email}`);
  const chk = await fetch(checkUrl.toString(), { headers: { 'apikey': anonKey, 'Authorization': `Bearer ${jwt}` } });
  if (!chk.ok) return { statusCode: 403, headers: cors(), body: 'Not authorized' };
  const list = await chk.json();
  if (!Array.isArray(list) || list.length === 0) return { statusCode: 403, headers: cors(), body: 'Not an admin' };

  // Apply update with service role
  let payload = {};
  try { payload = JSON.parse(event.body||'{}'); } catch {}
  const session_id = String(payload.session_id||'');
  if (!session_id) return { statusCode: 400, headers: cors(), body: 'Missing session_id' };
  const patch = {};
  if (payload.status) patch.status = String(payload.status);
  if (typeof payload.note === 'string') patch.note = payload.note;

  const url = new URL(`${supaUrl}/rest/v1/orders`);
  url.searchParams.set('session_id', `eq.${session_id}`);
  const res = await fetch(url.toString(), {
    method: 'PATCH',
    headers: { 'apikey': srvKey, 'Authorization': `Bearer ${srvKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify(patch)
  });
  const data = await res.json().catch(()=>({}));
  return { statusCode: res.ok?200:res.status, headers: jcors(), body: JSON.stringify(data) };
};

function cors(){ return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' }; }
function jcors(){ return { ...cors(), 'Content-Type': 'application/json' }; }
