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

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: planConfig.amount,
    currency: planConfig.currency,
    name: 'Vikku PM',
    description: planConfig.description,
    image: '/logo.png',
    prefill: {
      email: user?.email || '',
    },
    theme: { color: '#ffffff' },
    handler: async (response) => {
      // Payment successful — save to Supabase
      try {
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
      ondismiss: () => {
        // User closed modal without paying
      },
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
