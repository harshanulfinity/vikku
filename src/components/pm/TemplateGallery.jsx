import { TEMPLATES, CATEGORY_ORDER } from '../../lib/projectTemplates'

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
        return (
          <div key={cat}>
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">{cat}</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {group.map(tplBtn)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
