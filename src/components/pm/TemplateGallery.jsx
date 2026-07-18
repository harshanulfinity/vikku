import { TEMPLATES, CATEGORY_ORDER, CATEGORY_META } from '../../lib/projectTemplates'

// Categorized template picker, shared by the New Project page and the
// dashboard "Start from Template" popup.
export default function TemplateGallery({ selectedKey, onPick, includeBlank = true }) {
  const tplBtn = (t) => (
    <button
      key={t.key}
      type="button"
      onClick={() => onPick(t.key)}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
        selectedKey === t.key
          ? 'border-white bg-white/10'
          : 'border-white/[0.08] hover:border-white/25 hover:bg-white/[0.04]'
      }`}
    >
      <t.Icon size={16} className={selectedKey === t.key ? 'text-white' : 'text-white/50'} />
      <span className="text-[10px] text-white/70 leading-tight">{t.name}</span>
    </button>
  )

  return (
    <div className="space-y-5">
      {includeBlank && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {TEMPLATES.filter((t) => !t.category).map(tplBtn)}
        </div>
      )}
      {CATEGORY_ORDER.map((cat) => {
        const group = TEMPLATES.filter((t) => t.category === cat)
        if (group.length === 0) return null
        const meta = CATEGORY_META[cat] || {}
        return (
          <div key={cat}>
            <div className={`rounded-xl overflow-hidden mb-3 bg-gradient-to-r ${meta.gradient || 'from-white/10 to-white/5'}`}>
              <div className="px-4 py-3 bg-black/10">
                <h3 className="font-display font-bold text-sm text-white">{cat}</h3>
                {meta.desc && <p className="text-[11px] text-white/80 mt-0.5">{meta.desc}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {group.map(tplBtn)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
