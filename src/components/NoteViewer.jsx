import { useEffect } from 'react'
import { ChevronLeft, Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'

// Full-screen Xiaohongshu-style note detail viewer. Used both by:
//   - Chat-linked recommendation cards inside the group chat
//   - User-published notes shown on the Home → Nearby feed
//
// `note` is the normalized shape produced by helpers/normalizeNote in this file.
// Caller passes onClose for the back button + backdrop tap.
export default function NoteViewer({ note, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!note) return null

  const cover = note.cover || {}
  const tags = note.tags || []

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
          <button className="ml-1 px-2 py-0.5 rounded-full bg-xhs-red text-[10px] font-bold">
            +
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
                <span
                  key={tag}
                  className="text-xs text-xhs-blue"
                >
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

      {/* Bottom action bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-xhs-border flex items-center gap-2 px-3 py-2 pb-5">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-xhs-bg rounded-full text-xs text-xhs-text-secondary">
          <span>{'Say something nice...'}</span>
        </div>
        <ActionIcon icon={<Heart size={20} />} count={note.likes} />
        <ActionIcon icon={<Bookmark size={20} />} count={note.saves} />
        <ActionIcon icon={<MessageCircle size={20} />} count={note.comments} />
        <ActionIcon icon={<Share2 size={20} />} />
      </div>
    </div>
  )
}

function ActionIcon({ icon, count }) {
  return (
    <button className="flex items-center gap-0.5 text-xhs-text-secondary active:scale-95">
      {icon}
      {count !== undefined && count !== null && (
        <span className="text-[11px]">{count}</span>
      )}
    </button>
  )
}

