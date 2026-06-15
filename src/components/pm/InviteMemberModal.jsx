import { useState } from 'react'
import { X, UserPlus, Mail, AlertCircle, Copy, Check } from 'lucide-react'
import { joinProject } from '../../lib/pmService'
import { useAuth } from '../../contexts/AuthContext'

export default function InviteMemberModal({ projectId, projectName, onClose, onInvited }) {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleInvite = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      await joinProject(projectId, null, email, role)
      
      // Send invitation email
      try {
        const projectUrl = `${window.location.origin}/pm/projects/${projectId}`
        await fetch('/api/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            projectName: projectName || 'a project',
            projectUrl,
            inviterName: user?.email?.split('@')[0] || 'A team member',
            role
          })
        })
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr)
        // Continue anyway - member is added even if email fails
      }
      
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to invite member')
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/pm/projects/${projectId}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Invite Team Member</h2>
              <p className="text-xs text-white/40">Add someone to collaborate on this project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-white font-medium mb-2 text-center">Invitation Sent!</p>
            <p className="text-xs text-white/50 mb-4 text-center">We've emailed {email} with instructions. You can also share this link directly:</p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-3">
              <code className="text-xs text-blue-400 break-all block text-center">
                {window.location.origin}/pm/projects/{projectId}
              </code>
            </div>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold text-sm px-4 py-3 rounded-xl hover:bg-white/90 transition-colors mb-3"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
            <p className="text-[10px] text-white/30 text-center">They'll need to sign up with this email to access the project</p>
            <button
              onClick={() => {
                onInvited?.()
                onClose()
              }}
              className="w-full mt-4 text-sm text-white/50 hover:text-white transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-2 block">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs text-white/50 mb-2 block">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'admin', label: 'Admin', desc: 'Full access' },
                  { value: 'member', label: 'Member', desc: 'Can edit' },
                  { value: 'viewer', label: 'Viewer', desc: 'Read only' }
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === r.value
                        ? 'bg-white/10 border-white/20'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <p className="text-xs font-medium text-white">{r.label}</p>
                    <p className="text-[10px] text-white/40">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-white text-black font-semibold text-sm px-4 py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Member'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 text-sm text-white/50 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
