import { useEffect, useState } from 'react'
import { Users, Copy, Check, X, Link } from 'lucide-react'
import { getProjectMembers, removeProjectMember } from '../../lib/pmService'

export default function MembersPanel({ projectId, ownerUserId, currentUserId }) {
  const [members, setMembers] = useState([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  const isOwner = currentUserId === ownerUserId
  const joinUrl = `${window.location.origin}/pm/join/${projectId}`

  useEffect(() => {
    if (!projectId) return
    getProjectMembers(projectId)
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [projectId])

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(joinUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRemove = async (member) => {
    if (!window.confirm(`Remove ${member.email || 'this member'} from the project?`)) return
    await removeProjectMember(member.id)
    setMembers((prev) => prev.filter((m) => m.id !== member.id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-white/40 flex items-center gap-1.5">
          <Users size={11} />
          Team
        </p>
        <span className="text-[10px] text-white/20">{members.length + 1} member{members.length !== 0 ? 's' : ''}</span>
      </div>

      {/* Owner */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/60 font-medium flex-shrink-0">
          O
        </div>
        <span className="text-xs text-white/60 truncate">You (owner)</span>
      </div>

      {/* Members */}
      {!loading && members.map((m) => (
        <div key={m.id} className="flex items-center gap-2 mb-1.5 group">
          <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] text-white/40 font-medium flex-shrink-0">
            {(m.email?.[0] || 'M').toUpperCase()}
          </div>
          <span className="text-xs text-white/50 truncate flex-1">{m.email || 'Member'}</span>
          {isOwner && (
            <button
              onClick={() => handleRemove(m)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-red-400"
            >
              <X size={11} />
            </button>
          )}
        </div>
      ))}

      {/* Invite link */}
      {isOwner && (
        <button
          onClick={handleCopyLink}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 border border-white/[0.07] hover:border-white/20 rounded-lg py-2 transition-all"
        >
          {copied ? <><Check size={11} className="text-green-400" /> Copied!</> : <><Link size={11} /> Copy invite link</>}
        </button>
      )}
    </div>
  )
}
