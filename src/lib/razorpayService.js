import { supabase } from './supabaseClient'

const PLANS = {
  pro: {
    name: 'Vikku PM Pro',
    amount: 1000, // ₹10 in paise
    currency: 'INR',
    description: 'Unlimited projects, AI planning, client share links',
  },
  team: {
    name: 'Vikku PM Team',
    amount: 249900, // ₹2,499 in paise
    currency: 'INR',
    description: 'Everything in Pro + team members + role-based access',
  },
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export async function openRazorpayCheckout({ plan, user, onSuccess, onFailure }) {
  const loaded = await loadRazorpayScript()
  if (!loaded) {
    onFailure?.('Failed to load payment gateway. Please try again.')
    return
  }

  const planConfig = PLANS[plan]
  if (!planConfig) { onFailure?.('Invalid plan'); return }

  // Create a server-side order first (required for UPI/QR payment callback to fire)
  let orderId = null
  try {
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: planConfig.amount,
        currency: planConfig.currency,
        receipt: `sub_${plan}_${Date.now()}`,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      orderId = data.order_id
    }
  } catch {
    // Fall through without order_id — card payments still work
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: planConfig.amount,
    currency: planConfig.currency,
    name: 'Vikku PM',
    description: planConfig.description,
    image: '/logo.png',
    ...(orderId ? { order_id: orderId } : {}),
    prefill: {
      email: user?.email || '',
    },
    theme: { color: '#ffffff' },
    handler: async (response) => {
      try {
        // Verify signature if we have an order (UPI/QR flow)
        if (orderId) {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })
          const verifyData = await verifyRes.json()
          if (!verifyData.success) {
            throw new Error(verifyData.error || 'Payment verification failed')
          }
        }

        await saveSubscription({
          userId: user.id,
          plan,
          paymentId: response.razorpay_payment_id,
        })
        onSuccess?.(response)
      } catch (err) {
        onFailure?.(err.message)
      }
    },
    modal: {
      ondismiss: () => {},
    },
  }

  const rzp = new window.Razorpay(options)
  rzp.on('payment.failed', (response) => {
    onFailure?.(response.error?.description || 'Payment failed')
  })
  rzp.open()
}

async function saveSubscription({ userId, plan, paymentId }) {
  if (!supabase) throw new Error('Database not configured')
  
  const periodEnd = new Date()
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan,
      razorpay_payment_id: paymentId,
      status: 'active',
      current_period_end: periodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) throw error
}

export async function getSubscription(userId) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching subscription:', error)
      return { plan: 'free' }
    }
    return data || { plan: 'free' }
  } catch (err) {
    console.error('Failed to fetch subscription:', err)
    return { plan: 'free' }
  }
}

export async function cancelSubscription(userId) {
  if (!supabase) throw new Error('Database not configured')
  
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ plan: 'free', status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('user_id', userId)
  if (error) throw error
}
