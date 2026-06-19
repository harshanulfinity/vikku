import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import FounderCard from './FounderCard'

const stats = [
  { value: '8+', label: 'Projects Delivered' },
  { value: '8+', label: 'Happy Clients' },
  { value: '1+',  label: 'Years Experience' },
  { value: '2',   label: 'Continents Served' },
]

const founder = {
  name:    'Harsha Vardhan Reddy Sanikommu',
  role:    'Founder & Product Lead',
  photo:   '/founder.JPG',
  bio:     "I'm an AI/ML student passionate about building products, solving business problems, and turning ideas into scalable digital solutions. Over the past few years I've worked on 8+ real-world projects across India and the USA - collaborating directly with businesses to design, develop, and launch impactful products spanning AI applications, automation, web development, and digital transformation. I love working at the intersection of technology, business, and product thinking: understanding user problems, spotting opportunities, and building solutions that create measurable value.",
  focus:   ['AI & Machine Learning', 'Product Development', 'Automation & AI Workflows', 'Web Applications', 'Digital Strategy', 'Problem Solving'],
  linkedin: 'https://www.linkedin.com/in/harsha-vardhan-reddy-sanikommu/',
  instagram: 'https://www.instagram.com/theharshasanikommu/',
  email:    'connect@vikku.in',
}

const team = [
  {
    name:    'Sai Prashanth',
    role:    'AI Engineer · DevOps · Cloud (AWS/Azure)',
    photo:   '/globe/prasanth.jpg',
    bio:     "I'm a Software Development Engineer with a deep passion for building scalable AI solutions that drive innovation and efficiency. I design and develop advanced systems, leveraging AI to solve real-world problems and optimize performance at scale. As an Azure Solutions Architect, I craft secure, cloud-based solutions that help businesses operate more effectively, and as a freelancer I take pride in delivering high-quality work tailored to each client's needs.",
    focus:   ['AI Engineering', 'DevOps', 'Cloud — AWS/Azure', 'Java & Python', 'Microservices', 'Generative AI'],
    linkedin: 'https://www.linkedin.com/in/sai-prashanth123',
    email:    'saip00519@gmail.com',
    phone:    '6281441422',
  },
]

const highlights = [
  'Full-stack across web, mobile & cloud',
  'Deep experience with AI & LLMs',
  'Agile delivery with transparent communication',
  'Post-launch support & long-term partnership',
  'Architecture-first engineering mindset',
]

export default function About() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-reveal]').forEach((el, i) => {
              setTimeout(() => {
                el.style.opacity = '1'
                el.style.transform = 'translateY(0)'
              }, i * 100)
            })
          }
        })
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" className="py-20 px-6 relative" ref={sectionRef}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10" data-reveal style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.5s ease' }}>
          <div className="section-tag">Who We Are</div>
          <h2
            className="font-display font-extrabold text-white"
            style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.4rem)' }}
          >
            Technology Is Our Craft
          </h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-10" data-reveal
             style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.5s ease 0.1s' }}>
          {stats.map(({ value, label }) => (
            <div key={label} className="glass rounded-xl p-4 text-center">
              <div className="font-display font-bold text-2xl text-white mb-1">{value}</div>
              <div className="text-[10px] text-white tracking-wide">{label}</div>
            </div>
          ))}
        </div>

        {/* Two-col */}
        <div className="grid md:grid-cols-2 gap-3" data-reveal
             style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.5s ease 0.2s' }}>
          {/* Why us */}
          <div className="glass rounded-xl p-6">
            <h3 className="font-display font-semibold text-white text-base mb-5">Why Vikku?</h3>
            <ul className="space-y-4">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs text-white leading-relaxed">
                  <Check size={12} className="text-white mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Quote */}
          <div className="glass rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="text-4xl text-white font-display font-bold leading-none mb-3">&ldquo;</div>
              <p className="text-white text-sm leading-relaxed">
                We don&apos;t just write code   we solve problems, ship products, and grow
                together with every client we work with.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-white text-xs">  The Vikku Team</p>
            </div>
          </div>
        </div>

        {/* Meet the Founder */}
        <FounderCard founder={founder} />

        {/* The Team */}
        {team.map((member) => (
          <FounderCard key={member.name} founder={member} />
        ))}
      </div>
    </section>
  )
}
