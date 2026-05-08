import { useEffect, useState } from 'react'
import { ChevronLeft, Heart, MessageCircle, Share2, Bookmark, Check } from 'lucide-react'

// Full-screen Xiaohongshu-style note detail viewer. Used both by:
//   - Chat-linked recommendation cards inside the group chat
//   - User-published notes shown on the Home → Nearby feed
//
// `note` is the normalized shape produced by data/noteShape.js.
// Caller passes onClose for the back button.
export default function NoteViewer({ note, onClose }) {
  // Local interaction state. Each open of the viewer starts fresh — like/save
  // counts revert when you close and reopen, which is fine for a demo.
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [following, setFollowing] = useState(false)
  // Tiny ephemeral toast surfaced when share/comment is tapped (those don't
  // have a meaningful counterpart in this demo, so we just acknowledge).
  const [toast, setToast] = useState(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 1500)
    return () => clearTimeout(timer)
  }, [toast])

  if (!note) return null

  const cover = note.cover || {}
  const tags = note.tags || []

  // Counts in the source data may be numbers (posted notes) or pretty strings
  // like "3.2k" (mock chat notes). For numbers we update on like/save; for
  // strings we keep the display constant but still flip the icon — feels
  // closer to how real apps show "you liked it" before the count refreshes.
  const formatCount = (base, delta) => {
    if (typeof base === 'number') return base + delta
    if (base === undefined || base === null) return delta > 0 ? '1' : null
    return base // string: don't try to do arithmetic
  }

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col animate-splash-fade overflow-hidden">
      {/* Top bar (transparent over the cover) */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3 pb-2">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white text-xs">
          <span className="text-base">{note.authorAvatar || '👤'}</span>
          <span className="font-medium">{note.author || 'RedExplore user'}</span>
          <button
            onClick={() => setFollowing((v) => !v)}
            className={`ml-1 inline-flex items-center justify-center min-w-[28px] h-5 px-1.5 rounded-full text-[10px] font-bold transition-colors ${
              following ? 'bg-white/30 text-white' : 'bg-xhs-red text-white'
            }`}
          >
            {following ? <Check size={12} strokeWidth={3} /> : '+'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Cover */}
        {cover.kind === 'image' ? (
          <img
            src={cover.url}
            alt=""
            className="w-full aspect-[3/4] object-cover bg-gray-100"
          />
        ) : (
          <div
            className={`w-full aspect-[3/4] bg-gradient-to-br ${cover.gradient || 'from-pink-400 to-red-500'} flex items-center justify-center`}
          >
            <span className="text-7xl">{cover.emoji || '📍'}</span>
          </div>
        )}

        {/* Body */}
        <div className="px-4 pt-4">
          <h1 className="text-lg font-bold text-xhs-text leading-snug">{note.title}</h1>
          {note.body && (
            <div className="mt-3 text-sm text-xhs-text leading-relaxed whitespace-pre-wrap">
              {note.body}
            </div>
          )}

          {tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="text-xs text-xhs-blue">
                  #{tag.replace(/^#/, '')}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 pb-2 text-[11px] text-xhs-text-secondary">
            {note.authorMeta || ''}
          </div>
        </div>
      </div>

      {/* Tiny toast (fires on Comment/Share tap) */}
      {toast && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-black/75 text-white text-xs animate-splash-fade">
          {toast}
        </div>
      )}

      {/* Bottom action bar — interactive ❤️ / 🔖 / 💬 / ↗ */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-xhs-border flex items-center gap-2 px-3 py-2 pb-5">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-xhs-bg rounded-full text-xs text-xhs-text-secondary">
          <span>Say something nice...</span>
        </div>
        <ActionIcon
          active={liked}
          activeColor="text-xhs-red"
          icon={<Heart size={22} fill={liked ? 'currentColor' : 'none'} />}
          count={formatCount(note.likes, liked ? 1 : 0)}
          onClick={() => setLiked((v) => !v)}
        />
        <ActionIcon
          active={saved}
          activeColor="text-amber-500"
          icon={<Bookmark size={22} fill={saved ? 'currentColor' : 'none'} />}
          count={formatCount(note.saves, saved ? 1 : 0)}
          onClick={() => setSaved((v) => !v)}
        />
        <ActionIcon
          icon={<MessageCircle size={22} />}
          count={note.comments}
          onClick={() => setToast('Comments coming soon 💬')}
        />
        <ActionIcon
          icon={<Share2 size={22} />}
          onClick={() => setToast('Link copied to clipboard ✓')}
        />
      </div>
    </div>
  )
}

function ActionIcon({ icon, count, onClick, active = false, activeColor = '' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-0.5 active:scale-90 transition-transform ${
        active ? activeColor : 'text-xhs-text-secondary'
      }`}
    >
      {icon}
      {count !== undefined && count !== null && count !== 0 && (
        <span className="text-[11px]">{count}</span>
      )}
    </button>
  )
}
