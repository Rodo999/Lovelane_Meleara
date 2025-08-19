// Netlify Function: Update order (status, notes)
// Security: header x-admin-token == ADMIN_DASH_TOKEN
// Body JSON: { session_id, status?, note? }

exports.handler = async function(event){
  if (event.httpMethod !== 'PATCH') {
    return { statusCode: 405, headers: cors(), body: 'Method Not Allowed' };
  }
  const token = event.headers['x-admin-token'] || event.headers['X-Admin-Token'] || '';
  const expected = process.env.ADMIN_DASH_TOKEN || '';
  if (!expected || token !== expected) {
    return { statusCode: 401, headers: cors(), body: 'Unauthorized' };
  }
  const supaUrl = process.env.SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY;
  if (!supaUrl || !supaKey) {
    return { statusCode: 500, headers: cors(), body: 'Missing Supabase env vars' };
  }
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
    headers: { 'apikey': supaKey, 'Authorization': `Bearer ${supaKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
    body: JSON.stringify(patch)
  });
  const data = await res.json().catch(()=>({}));
  return { statusCode: res.ok?200:res.status, headers: jcors(), body: JSON.stringify(data) };
}

function cors(){ return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, x-admin-token' }; }
function jcors(){ return { ...cors(), 'Content-Type': 'application/json' }; }
