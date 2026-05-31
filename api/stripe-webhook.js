const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hzjxcucucyifyphmbzbx.supabase.co',
  'sb_publishable_5g25NVLs632WOiYtR10yDA_tE_xrdcQ'
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;

    // Handle subscription created or updated
    if (event.type === 'customer.subscription.created' || 
        event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Get customer email from Stripe
      const stripeRes = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
        }
      });
      const customer = await stripeRes.json();
      const email = customer.email;

      if (email && subscription.status === 'active') {
        // Add to Supabase premium_users
        await supabase.from('premium_users').upsert({
          email: email.toLowerCase(),
          active: true,
          updated_at: new Date().toISOString()
        });
        console.log('Premium activated for:', email);
      }
    }

    // Handle subscription cancelled
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const stripeRes = await fetch(`https://api.stripe.com/v1/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
        }
      });
      const customer = await stripeRes.json();
      const email = customer.email;

      if (email) {
        await supabase.from('premium_users')
          .update({ active: false, updated_at: new Date().toISOString() })
          .eq('email', email.toLowerCase());
        console.log('Premium deactivated for:', email);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
};
