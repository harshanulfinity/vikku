import { supabase } from './supabaseClient'

// India GST on SaaS subscriptions
export const GST_RATE = 0.18

// Base (pre-GST) prices in rupees
export const PLAN_PRICING = {
  pro:  { monthly: 299, annual: 2999 },
  team: { monthly: 999, annual: 9999 },
}

const PLAN_META = {
  pro:  { name: 'Vikku PM Pro',  description: 'Unlimited projects, AI planning, client share links' },
  team: { name: 'Vikku PM Team', description: 'Everything in Pro + unlimited team members' },
}

/**
 * GST-inclusive price breakdown for a plan + billing cycle.
 * All rupee values; `totalPaise` is what we actually charge.
 */
export function priceBreakdown(plan, billingCycle = 'monthly') {
  const cycle = billingCycle === 'annual' ? 'annual' : 'monthly'
  const basePaise = (PLAN_PRICING[plan]?.[cycle] ?? 0) * 100
  const gstPaise = Math.round(basePaise * GST_RATE)
  const totalPaise = basePaise + gstPaise
  return {
    base: basePaise / 100,
    gst: gstPaise / 100,
    total: totalPaise / 100,
    totalPaise,
  }
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

export async function openRazorpayCheckout({ plan, billingCycle = 'monthly', user, onSuccess, onFailure, onDismiss }) {
  const loaded = await loadRazorpayScript()
  if (!loaded) {
    onFailure?.('Failed to load payment gateway. Please try again.')
    return
  }

  const meta = PLAN_META[plan]
  if (!meta) { onFailure?.('Invalid plan'); return }

  const cycle = billingCycle === 'annual' ? 'annual' : 'monthly'
  const { totalPaise } = priceBreakdown(plan, cycle)

  // ── Try an auto-renewing subscription first ──────────────────────────────
  // Needs Razorpay Plan IDs configured server-side. If not configured, the
  // endpoint returns { configured: false } and we fall back to a one-time order.
  let subscriptionId = null
  try {
    const res = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, billingCycle: cycle, email: user?.email || '' }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.configured && data.subscription_id) subscriptionId = data.subscription_id
    }
  } catch {
    // ignore — fall back to one-time order
  }

  // ── Fallback: one-time order (GST-inclusive) ─────────────────────────────
  let orderId = null
  if (!subscriptionId) {
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPaise,
          currency: 'INR',
          receipt: `sub_${plan}_${cycle}_${Date.now()}`,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        orderId = data.order_id
      }
    } catch {
      // card payments still work without an order_id
    }
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    name: 'Vikku PM',
    description: `${meta.description} (incl. 18% GST)`,
    image: '/logo.png',
    prefill: { email: user?.email || '' },
    theme: { color: '#ffffff' },
    ...(subscriptionId
      ? { subscription_id: subscriptionId }
      : { amount: totalPaise, currency: 'INR', ...(orderId ? { order_id: orderId } : {}) }),
    handler: async (response) => {
      try {
        if (subscriptionId) {
          // Verify subscription signature: payment_id | subscription_id
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })
          const verifyData = await verifyRes.json()
          if (!verifyData.success) throw new Error(verifyData.error || 'Payment verification failed')

          await saveSubscription({
            userId: user.id,
            plan,
            billingCycle: cycle,
            paymentId: response.razorpay_payment_id,
            subscriptionId: response.razorpay_subscription_id,
          })
        } else {
          // Verify one-time order signature: order_id | payment_id
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
            if (!verifyData.success) throw new Error(verifyData.error || 'Payment verification failed')
          }

          await saveSubscription({
            userId: user.id,
            plan,
            billingCycle: cycle,
            paymentId: response.razorpay_payment_id,
          })
        }
        onSuccess?.(response)
      } catch (err) {
        onFailure?.(err.message)
      }
    },
    modal: { ondismiss: () => { onDismiss?.() } },
  }

  const rzp = new window.Razorpay(options)
  rzp.on('payment.failed', (response) => {
    onFailure?.(response.error?.description || 'Payment failed')
  })
  rzp.open()
}

async function saveSubscription({ userId, plan, billingCycle = 'monthly', paymentId, subscriptionId = null }) {
  if (!supabase) throw new Error('Database not configured')

  const periodEnd = new Date()
  if (billingCycle === 'annual') {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  }

  const row = {
    user_id: userId,
    plan,
    billing_cycle: billingCycle,
    razorpay_payment_id: paymentId,
    status: 'active',
    current_period_end: periodEnd.toISOString(),
    updated_at: new Date().toISOString(),
  }
  // Only set when we have an auto-renewing subscription
  if (subscriptionId) row.razorpay_subscription_id = subscriptionId

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert(row, { onConflict: 'user_id' })

  if (error) throw error
}

export async function getSubscription(userId) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) return { plan: 'free' }

    // Immediately cancelled — no access
    if (data.status === 'cancelled') return { ...data, plan: 'free' }

    // Period has ended — auto-downgrade in DB and return free
    if (data.current_period_end && new Date(data.current_period_end) < new Date()) {
      await supabase
        .from('user_subscriptions')
        .update({ plan: 'free', status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
      return { plan: 'free' }
    }

    // Cancelling but still within paid period — keep access
    return data
  } catch (err) {
    console.error('Failed to fetch subscription:', err)
    return { plan: 'free' }
  }
}

// Sets status to 'cancelling' — user keeps Pro access until current_period_end
export async function cancelSubscription(userId) {
  if (!supabase) throw new Error('Database not configured')

  const { data: sub, error: fetchErr } = await supabase
    .from('user_subscriptions')
    .select('current_period_end, razorpay_subscription_id')
    .eq('user_id', userId)
    .single()

  if (fetchErr) throw fetchErr

  // Stop auto-renewal at Razorpay (keeps access until period end). Best-effort:
  // if the endpoint isn't deployed yet we still mark it cancelling locally.
  if (sub?.razorpay_subscription_id) {
    try {
      await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_id: sub.razorpay_subscription_id }),
      })
    } catch {
      // ignore — webhook / period_end will still downgrade
    }
  }

  const { error } = await supabase
    .from('user_subscriptions')
    .update({ status: 'cancelling', updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (error) throw error
  return { accessUntil: sub?.current_period_end }
}
