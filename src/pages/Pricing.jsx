import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Zap, Layers, Building2 } from 'lucide-react'
import usePageMeta from '../hooks/usePageMeta'

const plans = [
  {
    icon: Zap,
    name: 'Starter',
    tagline: 'Get online fast',
    priceRange: '₹25,000 – ₹50,000',
    timeline: '2–3 weeks',
    ideal: 'Small businesses, restaurants, local services, freelancers',
    features: [
      'Professional landing page (5–7 sections)',
      'Mobile-responsive design',
      'Contact form + WhatsApp integration',
      'Google Maps embed',
      'Basic SEO setup',
      '1 round of revisions',
      'Hosting setup guidance',
      '30 days post-launch support',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    icon: Layers,
    name: 'Professional',
    tagline: 'Full web presence',
    priceRange: '₹50,000 – ₹2,00,000',
    timeline: '4–8 weeks',
    ideal: 'Growing businesses, agencies, SaaS, e-commerce',
    features: [
      'Multi-page website (up to 10 pages)',
      'User authentication (login / signup)',
      'Database integration',
      'Admin dashboard or CMS',
      'Payment gateway (Razorpay / Stripe)',
      'Advanced SEO + analytics setup',
      '3 rounds of revisions',
      'Deployment on Vercel / AWS',
      '60 days post-launch support',
    ],
    cta: 'Get a Quote',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    icon: Building2,
    name: 'Custom / Enterprise',
    tagline: 'Complex platforms',
    priceRange: '₹2,00,000+',
    timeline: 'Scoped per project',
    ideal: 'Platforms, SaaS products, staffing tools, marketplaces',
    features: [
      'Everything in Professional',
      'Complex role-based access control',
      'Custom integrations & third-party APIs',
      'Dedicated project manager',
      'Ongoing sprints with weekly demos',
      'Performance & scalability architecture',
      'Unlimited revisions during build',
      '90 days post-launch support',
      'SLA-backed delivery',
    ],
    cta: 'Let\'s Talk',
    highlight: false,
  },
]

const faqs = [
  {
    q: 'Do prices include design and development?',
    a: 'Yes — all prices include UI/UX design, development, testing, and deployment setup. No hidden fees.',
  },
  {
    q: 'What if my project doesn\'t fit a plan?',
    a: 'Every project is unique. Use the AI Cost Estimator for a custom estimate, or contact us and we\'ll scope it for free.',
  },
  {
    q: 'Do you charge for hosting or domain?',
    a: 'We don\'t charge for hosting ourselves — we set it up on your accounts (Vercel, AWS, etc.). Hosting costs are typically ₹0–₹2,000/month depending on traffic.',
  },
  {
    q: 'Can I start with Starter and upgrade later?',
    a: 'Absolutely. We build with clean, scalable code so upgrading is straightforward. Many clients start with Starter and move to Professional within 6 months.',
  },
  {
    q: 'How do payments work?',
    a: 'We take 50% upfront and 50% on delivery. For larger projects, we split into milestone payments tied to deliverables.',
  },
]

export default function Pricing() {
  const navigate = useNavigate()

  usePageMeta({
    title: 'Pricing — Vikku | Web Development Packages',
    description: 'Transparent pricing for professional websites and web apps. From ₹25,000 landing pages to custom enterprise platforms.',
    url: 'https://vikku.in/pricing',
  })

  const goToContact = () => {
    navigate('/')
    setTimeout(() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }), 300)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 glass border-b border-white/[0.05] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span className="font-display font-bold text-lg text-white">Pricing</span>
          <button
            onClick={goToContact}
            className="text-xs bg-white text-black px-4 py-2 rounded-lg hover:bg-white/90 transition-colors font-medium"
          >
            Get a Quote
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Transparent Pricing</p>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-white mb-4">
            Simple, Honest Pricing
          </h1>
          <p className="text-white/60 text-sm max-w-xl mx-auto">
            No surprise invoices. No hourly billing confusion. Pick a package that fits your project — or get a custom estimate.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col relative ${
                  plan.highlight ? 'glass-strong border border-white/20' : 'glass'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-[10px] font-semibold bg-white text-black px-3 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mb-4">
                    <Icon size={20} className="text-white" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-white mb-1">{plan.name}</h2>
                  <p className="text-white/50 text-xs">{plan.tagline}</p>
                </div>

                <div className="mb-6">
                  <p className="text-2xl font-bold text-white">{plan.priceRange}</p>
                  <p className="text-xs text-white/50 mt-1">Timeline: {plan.timeline}</p>
                </div>

                <p className="text-xs text-white/40 mb-6 italic">Best for: {plan.ideal}</p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-white/80">
                      <Check size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="space-y-2">
                  <button
                    onClick={goToContact}
                    className={`w-full font-semibold py-3 rounded-xl transition-colors text-sm ${
                      plan.highlight
                        ? 'bg-white text-black hover:bg-white/90'
                        : 'glass text-white hover:bg-white/10'
                    }`}
                  >
                    {plan.cta}
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/cost-estimator')}
                    className="w-full text-xs text-white/40 hover:text-white/60 transition-colors py-1"
                  >
                    Or get an AI estimate →
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-white mb-8 text-center">Common Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="glass rounded-xl p-6">
                <p className="text-sm font-semibold text-white mb-2">{faq.q}</p>
                <p className="text-sm text-white/60">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="glass-strong rounded-2xl p-10 text-center mt-16">
          <h3 className="font-display font-bold text-2xl text-white mb-3">Not sure which plan fits?</h3>
          <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
            Use our free AI Cost Estimator to get a tailored estimate based on your specific requirements — in your local currency.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/dashboard/cost-estimator')}
              className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors text-sm"
            >
              Try the AI Estimator
            </button>
            <button
              onClick={goToContact}
              className="glass text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              Talk to Us
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
