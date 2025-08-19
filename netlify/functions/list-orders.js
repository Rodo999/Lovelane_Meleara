// Netlify Function: List Orders (Admin)
// Protegido por token en cabecera 'x-admin-token' que debe coincidir con ADMIN_DASH_TOKEN (env)
// Usa Supabase REST con la clave service_role. RLS se bypass.

exports.handler = async function (event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = event.headers['x-admin-token'] || event.headers['X-Admin-Token'] || '';
  const expected = process.env.ADMIN_DASH_TOKEN || '';
  if (!expected || token !== expected) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  const supaUrl = process.env.SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY;
  if (!supaUrl || !supaKey) {
    return { statusCode: 500, body: 'Missing Supabase env vars' };
  }

  const url = new URL(`${supaUrl}/rest/v1/orders`);
  // Campos seleccionados y orden
  url.searchParams.set('select', '*');
  url.searchParams.set('order', 'created_at.desc');

  // Filtros opcionales
  const qs = event.queryStringParameters || {};
  const limit = Math.min(200, Math.max(1, Number(qs.limit || 50)));
  const offset = Math.max(0, Number(qs.offset || 0));
  url.searchParams.set('limit', String(limit));
  if (offset) url.searchParams.set('offset', String(offset));

  if (qs.status) url.searchParams.set('status', `eq.${qs.status}`);
  if (qs.email) url.searchParams.set('customer_email', `eq.${qs.email}`);
  if (qs.search) url.searchParams.set('customer_email', `ilike.*${qs.search}*`);

  // Rango de fechas (ISO 8601)
  if (qs.start) url.searchParams.set('created_at', `gte.${qs.start}`);
  if (qs.end) url.searchParams.append('created_at', `lte.${qs.end}`);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'apikey': supaKey,
        'Authorization': `Bearer ${supaKey}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify(data) };
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-admin-token'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
