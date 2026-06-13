const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hzjxcucucyifyphmbzbx.supabase.co',
  'sb_publishable_5g25NVLs632WOiYtR10yDA_tE_xrdcQ'
);

webpush.setVapidDetails(
  'mailto:skylaweather@info.com',
  'BKbTnonKJG5ijnP67eY5WGU-B9ERv6McLzp4r16dj3uvQI7jT2vEK1S4qVWQDoHYADFt3G6L37iGESjwD3EVBy0',
  process.env.VAPID_PRIVATE_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, subscription, title, body } = req.body;

  // Save subscription
  if (action === 'subscribe') {
    await supabase.from('push_subscriptions').upsert({
      endpoint: subscription.endpoint,
      subscription: JSON.stringify(subscription),
      created_at: new Date().toISOString()
    });
    return res.status(200).json({ success: true });
  }

  // Send notification to all subscribers
  if (action === 'send') {
    const { data: subs } = await supabase.from('push_subscriptions').select('subscription');
    const payload = JSON.stringify({ title, body });
    const results = await Promise.allSettled(
      subs.map(s => webpush.sendNotification(JSON.parse(s.subscription), payload))
    );
    return res.status(200).json({ sent: results.filter(r => r.status === 'fulfilled').length });
  }

  return res.status(400).json({ error: 'Invalid action' });
};
