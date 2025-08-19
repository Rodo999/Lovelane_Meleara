// Netlify Function: Admins management (list/add/remove admins)
// Security: requires header 'x-admin-token' matching ADMIN_DASH_TOKEN (env)
// Supabase REST with service_role is used (server-side only)

exports.handler = async function(event){
  const method = event.httpMethod;
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

  try {
    if (method === 'GET') {
      const url = new URL(`${supaUrl}/rest/v1/admins`);
      url.searchParams.set('select','*');
      url.searchParams.set('order','created_at.desc');
      const res = await fetch(url.toString(), { headers: sHeaders(supaKey) });
      const data = await res.json();
      return { statusCode: res.ok?200:res.status, headers: jcors(), body: JSON.stringify(data) };
    }

    if (method === 'POST') {
      let payload = {};
      try { payload = JSON.parse(event.body||'{}'); } catch {}
      const email = String(payload.email||'').trim().toLowerCase();
      if (!email || !/.+@.+\..+/.test(email)) {
        return { statusCode: 400, headers: cors(), body: 'Invalid email' };
      }
      const res = await fetch(`${supaUrl}/rest/v1/admins`, {
        method: 'POST',
        headers: { ...sHeaders(supaKey), 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(()=>({}));
      return { statusCode: res.ok?200:res.status, headers: jcors(), body: JSON.stringify(data) };
    }

    if (method === 'DELETE') {
      const email = (event.queryStringParameters && event.queryStringParameters.email) ? String(event.queryStringParameters.email).toLowerCase() : '';
      if (!email) return { statusCode: 400, headers: cors(), body: 'Missing email' };
      const url = new URL(`${supaUrl}/rest/v1/admins`);
      url.searchParams.set('email', `eq.${email}`);
      const res = await fetch(url.toString(), { method: 'DELETE', headers: sHeaders(supaKey) });
      if (!res.ok) {
        const txt = await res.text().catch(()=> '');
        return { statusCode: res.status, headers: cors(), body: txt };
      }
      return { statusCode: 200, headers: jcors(), body: JSON.stringify({ deleted: true }) };
    }

    return { statusCode: 405, headers: cors(), body: 'Method Not Allowed' };
  } catch (err) {
    return { statusCode: 500, headers: cors(), body: err.message };
  }
}

function sHeaders(key){
  return { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' };
}
function cors(){ return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, x-admin-token' }; }
function jcors(){ return { ...cors(), 'Content-Type': 'application/json' }; }
