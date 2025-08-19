// Cliente: inicia Stripe Checkout vía Netlify Function
(async function(){
  async function createCheckout(items){
    const res = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currency: 'mxn',
        items: items.map(i => ({ name: i.name, unit_amount: Math.round(i.price * 100), quantity: i.qty }))
      })
    });
    if (!res.ok) throw new Error('Fallo al crear sesión de pago');
    const data = await res.json();
    if (!data.url) throw new Error('Respuesta inválida del servidor');
    window.location.href = data.url;
  }

  window.checkoutWithStripe = async function(){
    const cart = (window.getCartItems ? window.getCartItems() : []);
    if (!cart || !cart.length) { alert('Tu carrito está vacío'); return; }
    try {
      await createCheckout(cart);
    } catch (e) {
      alert(e.message || 'No se pudo iniciar el pago');
    }
  }
})();
