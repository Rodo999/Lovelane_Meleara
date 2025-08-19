// Netlify Function: Create Stripe Checkout Session
// Requires env vars: STRIPE_SECRET_KEY, SUCCESS_URL, CANCEL_URL

const Stripe = require('stripe');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return { statusCode: 500, body: 'Missing STRIPE_SECRET_KEY' };
  }
  const stripe = Stripe(secretKey);

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!items.length) {
    return { statusCode: 400, body: 'No items provided' };
  }

  const currency = (payload.currency || 'mxn').toLowerCase();
  const success_url = process.env.SUCCESS_URL || 'success.html';
  const cancel_url = process.env.CANCEL_URL || 'cancel.html';

  // WARNING: dynamic pricing; for production secure flow, validate items against your price IDs.
  const line_items = items.map((it) => ({
    price_data: {
      currency,
      product_data: { name: String(it.name || 'Producto') },
      unit_amount: Number(it.unit_amount || 0), // in cents
    },
    quantity: Math.max(1, Number(it.quantity || 1)),
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url,
      cancel_url,
      allow_promotion_codes: false,
      // Wallets (Apple Pay/Google Pay) are automatically available on Stripe Checkout
      payment_method_types: ['card'],
      automatic_tax: { enabled: false },
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
