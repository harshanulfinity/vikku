import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        error: 'Missing required fields: order_id, payment_id, or signature' 
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      return res.status(200).json({ 
        success: true,
        message: 'Payment verified successfully',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id
      });
    } else {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid signature. Payment verification failed.' 
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ 
      error: 'Failed to verify payment',
      message: error.message 
    });
  }
}
