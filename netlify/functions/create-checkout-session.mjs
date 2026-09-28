import Stripe from 'stripe';

// Products and prices live here on the server so the browser can't change them.
// Cart items sent from the page are matched against this list by id.
const PRODUCTS = {
  'katzenjammer-deck': {
    name: 'Katzenjammer Card Game',
    description: 'The customizable, laugh-out-loud party card game. Reveal dares with the free companion app.',
    unitAmount: 2999, // in cents
    image: 'assets/product-cards.png',
    taxCode: 'txcd_99999999', // General - Tangible Goods
  },
};

// Stripe loads product images from the live site, since it can't reach localhost during testing.
const SITE_URL = 'https://katzenjammer-games.ca';
const CURRENCY = 'cad';
const SHIPPING_AMOUNT = 999; // flat rate, in cents
const SHIPPING_COUNTRIES = ['CA'];
const MAX_QUANTITY = 10;

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return Response.json({ error: 'STRIPE_SECRET_KEY is not configured' }, { status: 500 });
  }
  const stripe = new Stripe(secretKey);

  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body.items) ? body.items : [];
  const origin = new URL(req.url).origin;

  const lineItems = [];
  for (const item of items) {
    const product = PRODUCTS[item.id];
    const quantity = Math.floor(Number(item.quantity));
    if (!product || !(quantity >= 1 && quantity <= MAX_QUANTITY)) continue;

    lineItems.push({
      quantity,
      price_data: {
        currency: CURRENCY,
        unit_amount: product.unitAmount,
        tax_behavior: 'exclusive',
        product_data: {
          name: product.name,
          description: product.description,
          images: [SITE_URL + '/' + product.image],
          tax_code: product.taxCode,
        },
      },
    });
  }

  if (!lineItems.length) {
    return Response.json({ error: 'Your cart is empty' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: SHIPPING_COUNTRIES },
      shipping_options: [{
        shipping_rate_data: {
          type: 'fixed_amount',
          display_name: 'Flat rate shipping',
          fixed_amount: { amount: SHIPPING_AMOUNT, currency: CURRENCY },
          tax_behavior: 'exclusive',
          tax_code: 'txcd_92010001', // Shipping
        },
      }],
      billing_address_collection: 'auto',
      automatic_tax: { enabled: false },
      phone_number_collection: { enabled: false },
      custom_text: {
        shipping_address: { message: 'We ship within Canada. Flat rate shipping is $9.99.' },
      },
      success_url: origin + '/?checkout=success',
      cancel_url: origin + '/?checkout=cancelled',
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout session failed:', error.message);
    // Show Stripe's reason in the browser console when running `netlify dev`
    const detail = process.env.CONTEXT === 'dev' ? error.message : undefined;
    return Response.json({ error: 'Could not start checkout', detail }, { status: 502 });
  }
};
