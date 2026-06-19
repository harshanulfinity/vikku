import crypto from 'crypto'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    razorpay_subscription_id,
  } = req.body

  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) {
    return res.status(500).json({ success: false, error: 'Server misconfigured' })
  }

  if (!razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Missing required fields' })
  }

  // Subscription flow: signature = HMAC(payment_id + "|" + subscription_id)
  // One-time order flow: signature = HMAC(order_id + "|" + payment_id)
  let body
  if (razorpay_subscription_id) {
    body = `${razorpay_payment_id}|${razorpay_subscription_id}`
  } else if (razorpay_order_id) {
    body = `${razorpay_order_id}|${razorpay_payment_id}`
  } else {
    return res.status(400).json({ success: false, error: 'Missing order or subscription id' })
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  if (expectedSignature === razorpay_signature) {
    return res.status(200).json({ success: true })
  }

  return res.status(400).json({ success: false, error: 'Invalid payment signature' })
}
