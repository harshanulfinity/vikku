import { useState } from 'react'
import { X, Users, Copy, Check, Link } from 'lucide-react'

export default function InviteMemberModal({ projectId, projectName, onClose }) {
  const [copied, setCopied] = useState(false)

  const joinUrl = `${window.location.origin}/pm/join/${projectId}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Invite to {projectName || 'Project'}</h2>
              <p className="text-xs text-white/40">Share a link — anyone with it can join</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
            <p className="text-[11px] text-white/40 mb-2 flex items-center gap-1.5">
              <Link size={10} /> Invite link
            </p>
            <p className="text-xs text-white/70 font-mono break-all leading-relaxed">{joinUrl}</p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold text-sm px-4 py-3 rounded-xl hover:bg-white/90 transition-colors"
          >
            {copied ? (
              <><Check className="w-4 h-4 text-green-600" /> Copied!</>
            ) : (
              <><Copy className="w-4 h-4" /> Copy invite link</>
            )}
          </button>

          <p className="text-[11px] text-white/30 text-center">
            Teammates must be logged in to join. Each person visits the link once to get access.
          </p>

          <button onClick={onClose} className="w-full text-sm text-white/40 hover:text-white transition-colors py-1">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
