// Netlify Function: public-env
// Expone variables públicas necesarias en el cliente, evitando hardcodearlas en el repo.
// Requiere en Netlify: SUPABASE_URL, SUPABASE_ANON_KEY

exports.handler = async function(){
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ supabaseUrl, supabaseAnonKey })
  };
};
