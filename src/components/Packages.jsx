import { Check, ArrowRight } from 'lucide-react'

// Fixed-price productized offers. Edit prices/scope freely — they're just data.
const PACKAGES = [
  {
    name: 'Business Website',
    price: '₹40,000',
    timeline: '2 weeks',
    tagline: 'Get online fast with a site that converts.',
    features: ['Up to 6 custom-designed pages', 'Mobile-first, fast & SEO-ready', 'Contact form + WhatsApp integration', 'Launch in 2 weeks'],
    highlight: false,
  },
  {
    name: 'MVP / Web App',
    price: '₹1,50,000',
    timeline: '4–6 weeks',
    tagline: 'Validate your idea with a real product.',
    features: ['User accounts & dashboard', 'Core features built end-to-end', 'Payments / integrations', 'Deployed & production-ready'],
    highlight: true,
  },
  {
    name: 'Custom Platform',
    price: '₹3,00,000+',
    timeline: 'Scoped to you',
    tagline: 'Staffing, marketplace, SaaS or internal tools.',
    features: ['Full discovery & architecture', 'Complex workflows & roles', 'Scalable, secure, documented', 'Ongoing support available'],
    highlight: false,
  },
]

function scrollToContact() {
  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
}

export default function Packages() {
  return (
    <section id="packages" className="py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <div className="section-tag">Fixed-Price Packages</div>
          <h2 className="font-display font-extrabold text-white mb-3 leading-[1.05]" style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)' }}>
            Know exactly what you'll pay
          </h2>
          <p className="text-white/70 text-sm max-w-xl leading-relaxed">
            No vague quotes or surprise invoices. Pick a package, book a free scoping call,
            and we'll get your project moving — fast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PACKAGES.map((p) => (
            <div
              key={p.name}
              className={`relative glass rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                p.highlight ? 'border-violet-500/40 bg-violet-500/[0.04]' : 'hover:border-white/[0.14]'
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-2.5 left-6 bg-violet-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Most popular
                </span>
              )}
              <h3 className="font-display font-bold text-white text-lg">{p.name}</h3>
              <p className="text-xs text-white/50 mt-1 mb-4">{p.tagline}</p>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-display font-extrabold text-2xl text-white">{p.price}</span>
              </div>
              <p className="text-[11px] text-white/40 mb-5">Delivered in {p.timeline}</p>

              <ul className="space-y-2.5 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                    <Check size={14} className={`flex-shrink-0 mt-0.5 ${p.highlight ? 'text-violet-400' : 'text-white/40'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={scrollToContact}
                className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-colors ${
                  p.highlight ? 'bg-white text-black hover:bg-white/90' : 'glass text-white hover:bg-white/[0.08]'
                }`}
              >
                Book a free scoping call <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          Not sure which fits? <button onClick={scrollToContact} className="text-white/60 hover:text-white underline underline-offset-2">Tell us about your project</button> and we'll recommend one.
        </p>
      </div>
    </section>
  )
}
