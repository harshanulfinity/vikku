import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, subscription_id } = req.body || {};
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    const admin = createClient(supabaseUrl, serviceKey);

    // Stop auto-renewal at Razorpay (best-effort; access stays until period end)
    if (subscription_id && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        await razorpay.subscriptions.cancel(subscription_id, true); // cancel at cycle end
      } catch (err) {
        console.error('Razorpay cancel failed (continuing):', err?.message);
      }
    }

    // Mark cancelling — user keeps access until current_period_end
    const { data, error } = await admin
      .from('user_subscriptions')
      .update({ status: 'cancelling', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select('current_period_end')
      .single();

    if (error) {
      console.error('cancel update failed:', error);
      return res.status(500).json({ error: 'Failed to cancel subscription' });
    }

    return res.status(200).json({ success: true, accessUntil: data?.current_period_end });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return res.status(500).json({ error: 'Failed to cancel subscription', message: error.message });
  }
}
