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
    const body = req.body;
    const message = body.message;
    if (!message) {
      return res.status(400).json({ error: 'No message' });
    }

    const data = JSON.parse(
      Buffer.from(message.data, 'base64').toString()
    );

    if (data.subscriptionNotification) {
      const notification = data.subscriptionNotification;
      const purchaseToken = notification.purchaseToken;
      const notificationType = notification.notificationType;

      if ([1, 2, 3].includes(notificationType)) {
        await supabase.from('purchase_tokens').upsert({ 
          token: purchaseToken, 
          package_name: data.packageName,
          active: true,
          updated_at: new Date().toISOString()
        });
      } else if ([6, 9, 10].includes(notificationType)) {
        await supabase.from('purchase_tokens')
          .update({ active: false, updated_at: new Date().toISOString() })
          .eq('token', purchaseToken);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
};
