import { Linkedin, Mail, Instagram } from 'lucide-react'

export default function FounderCard({ founder }) {
  return (
    <div
      className="glass rounded-xl p-6 md:p-8 mt-3 flex flex-col sm:flex-row gap-6 items-stretch"
      data-reveal
      style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.5s ease 0.3s' }}
    >
      {/* Photo */}
      <div className="relative w-full sm:w-1/2 h-64 sm:h-auto sm:self-stretch rounded-xl overflow-hidden flex-shrink-0 bg-black">
        <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-4xl text-white/80">
          {founder.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </span>
        <img
          src={founder.photo}
          alt={founder.name}
          className="relative w-full h-full object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      </div>

      {/* Bio */}
      <div className="w-full sm:w-1/2">
        <h3 className="font-display font-semibold text-white text-base mb-3">{founder.name}</h3>
        <p className="text-white/90 text-sm leading-relaxed mb-4">{founder.bio}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {founder.focus.map((f) => (
            <span key={f} className="glass rounded-md px-2.5 py-1 text-[10px] text-white/80 tracking-wide">
              {f}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={founder.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-[11px] text-white hover:border-white/20 transition-colors"
          >
            <Linkedin size={12} /> LinkedIn
          </a>
          <a
            href={founder.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-[11px] text-white hover:border-white/20 transition-colors"
          >
            <Instagram size={12} /> Instagram
          </a>
          <a
            href={`mailto:${founder.email}`}
            className="inline-flex items-center gap-1.5 glass rounded-lg px-3 py-1.5 text-[11px] text-white hover:border-white/20 transition-colors"
          >
            <Mail size={12} /> {founder.email}
          </a>
        </div>
      </div>
    </div>
  )
}
