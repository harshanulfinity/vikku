import Razorpay from 'razorpay';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscription_id } = req.body || {};
    if (!subscription_id) {
      return res.status(400).json({ error: 'Missing subscription_id' });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: 'Razorpay credentials not configured' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // cancel_at_cycle_end = 1 → user keeps access until the current period ends.
    const result = await razorpay.subscriptions.cancel(subscription_id, true);

    return res.status(200).json({ success: true, status: result?.status });
  } catch (error) {
    console.error('Error cancelling Razorpay subscription:', error);
    return res.status(500).json({
      error: 'Failed to cancel subscription',
      message: error.message,
    });
  }
}
