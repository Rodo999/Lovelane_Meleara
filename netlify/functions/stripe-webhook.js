// Netlify Function: Stripe Webhook + Persistencia en Supabase
// Env vars requeridas:
// - STRIPE_SECRET_KEY
// - STRIPE_WEBHOOK_SECRET
// - SUPABASE_URL (https://xxxx.supabase.co)
// - SUPABASE_SERVICE_ROLE (clave service_role de Supabase)

const Stripe = require('stripe');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supaUrl = process.env.SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_KEY;

  if (!secretKey) return { statusCode: 500, body: 'Missing STRIPE_SECRET_KEY' };
  if (!webhookSecret) return { statusCode: 500, body: 'Missing STRIPE_WEBHOOK_SECRET' };

  const stripe = Stripe(secretKey);

  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'] || event.headers['STRIPE-SIGNATURE'];
  if (!sig) return { statusCode: 400, body: 'Missing Stripe-Signature header' };

  const rawBody = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;

  let evt;
  try {
    evt = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  async function saveOrderToSupabase(order) {
    if (!supaUrl || !supaKey) {
      console.warn('Supabase env vars not set; skipping DB persist');
      return null;
    }
    const res = await fetch(`${supaUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supaKey,
        'Authorization': `Bearer ${supaKey}`,
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(order)
    });
    if (!res.ok) {
      const txt = await res.text().catch(()=> '');
      throw new Error(`Supabase insert failed: ${res.status} ${txt}`);
    }
    return res.json();
  }

  try {
    switch (evt.type) {
      case 'checkout.session.completed': {
        const session = evt.data.object; // Checkout Session
        // Obtener line items
        let lineItems = [];
        try {
          // expand no siempre devuelve items, de ser necesario, listLineItems
          const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items'] });
          if (full && full.line_items && full.line_items.data) {
            lineItems = full.line_items.data.map(li => ({
              description: li.description,
              quantity: li.quantity,
              amount_subtotal: li.amount_subtotal,
              currency: li.currency,
            }));
          } else {
            const listed = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
            lineItems = (listed.data || []).map(li => ({
              description: li.description,
              quantity: li.quantity,
              amount_subtotal: li.amount_subtotal,
              currency: li.currency,
            }));
          }
        } catch (e) {
          console.warn('Could not retrieve line items:', e.message);
        }

        // Construir registro
        const record = {
          session_id: session.id,
          amount_total: session.amount_total,
          currency: session.currency,
          customer_email: session.customer_details && session.customer_details.email,
          status: session.payment_status || 'paid',
          items: lineItems,
          created_at: new Date().toISOString()
        };

        try {
          await saveOrderToSupabase(record);
          console.log('Order saved to Supabase:', record.session_id);
        } catch (err) {
          console.error('Failed to save order to Supabase:', err.message);
        }
        break;
      }
      case 'payment_intent.succeeded': {
        const pi = evt.data.object;
        console.log('PaymentIntent succeeded:', pi.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = evt.data.object;
        console.warn('PaymentIntent failed:', pi.id);
        // Opcional: persistir estado fallido con session_id si lo tienes referenciado
        break;
      }
      default:
        console.log('Unhandled event type:', evt.type);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Webhook handler error:', err);
    return { statusCode: 500, body: 'Server error' };
  }
};
