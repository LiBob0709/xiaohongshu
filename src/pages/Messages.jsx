import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { useChatHistory } from '../context/ChatHistoryContext'
import { LOCAL_PERSONAS } from '../api/mimo'
import Header from '../components/Header'
import { MessageCircle, Compass } from 'lucide-react'

// Inbox-style list of every chat session the user has started.
// Tapping a row resumes that conversation by routing to /chat with
// `resumeSessionId` in the router state.
export default function Messages() {
  const navigate = useNavigate()
  const { lang, t } = useLang()
  const { sessions } = useChatHistory()

  const handleOpen = (id) => {
    navigate('/chat', { state: { resumeSessionId: id } })
  }

  return (
    <>
      <Header title={t('messages.title')} showBack />

      {sessions.length === 0 ? (
        <div className="page-container bg-white flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-xhs-red-light flex items-center justify-center mb-4">
            <MessageCircle size={36} className="text-xhs-red" />
          </div>
          <p className="text-base font-semibold text-xhs-text mb-2">
            {t('messages.emptyTitle')}
          </p>
          <p className="text-xs text-xhs-text-secondary max-w-[260px] leading-relaxed mb-6">
            {t('messages.emptyDesc')}
          </p>
          <button
            onClick={() => navigate('/find-help')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-xhs-red text-white text-sm font-semibold active:scale-95 transition-transform shadow-md shadow-red-200"
          >
            <Compass size={14} />
            <span>{t('home.findLocals')}</span>
          </button>
        </div>
      ) : (
        <div className="page-container bg-white">
          {sessions.map((s) => (
            <SessionRow
              key={s.id}
              session={s}
              lang={lang}
              t={t}
              onClick={() => handleOpen(s.id)}
            />
          ))}
        </div>
      )}
    </>
  )
}

function SessionRow({ session, lang, t, onClick }) {
  const lastMsg = lastUserOrLocalMessage(session.messages)
  const preview = previewText(lastMsg, lang)
  const stamp = formatRelative(session.updatedAt, lang, t)
  const groupTitle = t('chat.groupChat')
  // Build a small chip with the categories the user picked, so it's quick to
  // tell sessions apart in the list.
  const catLabels = (session.categories || [session.category])
    .map((c) => t(`findHelp.categories.${c}`))
    .filter(Boolean)
    .join(' · ')

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 border-b border-xhs-border hover:bg-xhs-bg active:bg-xhs-bg transition-colors text-left"
    >
      {/* Avatar mosaic: 3 personas overlapped — visual signature of a group */}
      <div className="relative w-12 h-12 shrink-0">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-300 to-red-300 flex items-center justify-center text-lg">
          {LOCAL_PERSONAS[0].avatar}
        </div>
        <div className="absolute -right-1 -bottom-1 w-6 h-6 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center text-[10px] border-2 border-white">
          {LOCAL_PERSONAS[1].avatar}
        </div>
        <div className="absolute -left-1 -bottom-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-[10px] border-2 border-white">
          {LOCAL_PERSONAS[2].avatar}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-xhs-text truncate">{groupTitle}</span>
          {catLabels && (
            <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-xhs-red-light text-[10px] text-xhs-red max-w-[140px] truncate">
              {catLabels}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[12px] text-xhs-text-secondary truncate">
          {preview || t('messages.noMessagesYet')}
        </p>
      </div>
      <span className="shrink-0 text-[10px] text-xhs-text-secondary self-start mt-0.5">
        {stamp}
      </span>
    </button>
  )
}

// Pick the most recent non-system message — that's what we show in the preview.
function lastUserOrLocalMessage(messages) {
  if (!messages?.length) return null
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].type !== 'system') return messages[i]
  }
  return null
}

// For local messages prefer the translation (in user's lang) when present;
// otherwise show the raw text. User messages just show their own text.
function previewText(msg, lang) {
  if (!msg) return ''
  if (msg.isUser) {
    if (lang === 'zh' && msg.translation) return msg.translation
    return msg.text || msg.translation || ''
  }
  // Local: msg.text is Chinese, msg.translation is user's lang.
  if (lang === 'zh') return msg.text || msg.translation || ''
  return msg.translation || msg.text || ''
}

// Compact relative-time string. Falls back to the raw t() values for partial
// languages (the path string itself shows in dev which is fine).
function formatRelative(ts, lang, t) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return t('messages.now')
  if (m < 60) return t('messages.minutesAgo').replace('{n}', m)
  const h = Math.floor(m / 60)
  if (h < 24) return t('messages.hoursAgo').replace('{n}', h)
  const d = Math.floor(h / 24)
  return t('messages.daysAgo').replace('{n}', d)
}
