import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { generateGuide } from '../api/mimo'
import Header from '../components/Header'
import { Edit3, BookmarkPlus, Home, Check, Loader2 } from 'lucide-react'

export default function Guide() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang, t } = useLang()
  // Cache guides by language so switching back to one we've already generated
  // is instant. Edits made in one language stay isolated (we mutate the
  // entry for that lang only). The textarea is uncontrolled (defaultValue +
  // key={lang}) so per-keystroke state writes don't re-render the input.
  const [guides, setGuides] = useState({})
  const [editing, setEditing] = useState(false)
  // Loading is derived: an entry is "loading" until we've written *something*
  // (success body or failure-message string) into the cache for this lang.
  const loading = guides[lang] === undefined

  const messages = location.state?.messages || []
  const category = location.state?.category || 'food'
  const categories = location.state?.categories || [category]
  const nationality = location.state?.nationality || 'UK'

  useEffect(() => {
    // Skip the API call if we already have a guide cached for this language.
    // `loading` is derived from the cache, so we don't need to flip a flag.
    if (guides[lang] !== undefined) return
    let cancelled = false
    generateGuide(messages, categories, lang, nationality)
      .then((text) => {
        if (cancelled) return
        setGuides((prev) => ({ ...prev, [lang]: text }))
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Guide generation error:', err)
        setGuides((prev) => ({ ...prev, [lang]: t('guide.failed') }))
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  const currentGuide = guides[lang] ?? ''

  // Pull the first markdown H1 as the title, and the rest as the body.
  // Falls back gracefully if the model didn't follow the format.
  const splitGuide = (text) => {
    if (!text) return { title: '', body: '' }
    const lines = text.split('\n')
    const titleIdx = lines.findIndex((l) => l.startsWith('# '))
    if (titleIdx === -1) return { title: '', body: text }
    const title = lines[titleIdx].replace(/^#\s+/, '').trim()
    const body = lines.slice(titleIdx + 1).join('\n').trim()
    return { title, body }
  }

  const handlePublish = () => {
    const { title, body } = splitGuide(currentGuide)
    navigate('/publish', {
      state: { title, body, lang, nationality, category },
    })
  }

  if (loading) {
    return (
      <>
        <Header title={t('guide.title')} showBack />
        <div className="page-container bg-white flex flex-col items-center justify-center px-8">
          <div className="relative w-20 h-20 mb-6">
            <Loader2 size={80} className="text-xhs-red animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-2xl">✨</span>
          </div>
          <p className="text-base font-semibold text-xhs-text mb-2">{t('guide.generating')}</p>
          <p className="text-xs text-xhs-text-secondary text-center">{t('guide.generatingDesc')}</p>

          <div className="w-full mt-8 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="shimmer-bg h-4 rounded-full" style={{ width: `${100 - i * 15}%` }} />
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title={t('guide.title')} showBack />

      <div className="page-container bg-xhs-bg">
        {/* Cover */}
        <div className="mx-4 mt-4 h-44 bg-gradient-to-br from-xhs-red via-pink-500 to-orange-400 rounded-2xl flex flex-col items-center justify-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <span className="text-4xl mb-2 relative z-10">🗺️</span>
          <h2 className="text-lg font-bold relative z-10">{t('guide.coverTitle')}</h2>
          <p className="text-xs opacity-80 mt-1 relative z-10">{t('guide.basedOn')}</p>
        </div>

        {/* Guide content */}
        <div className="mx-4 mt-4 bg-white rounded-2xl border border-xhs-border overflow-hidden">
          {editing ? (
            <textarea
              key={lang}
              defaultValue={currentGuide}
              onChange={(e) => {
                // Update the cached entry for this lang. The textarea is
                // uncontrolled (defaultValue + key), so per-keystroke setState
                // doesn't fight the cursor — keystrokes stay snappy.
                const next = e.target.value
                setGuides((prev) => ({ ...prev, [lang]: next }))
              }}
              className="w-full p-4 text-sm text-xhs-text leading-relaxed min-h-[400px] focus:outline-none resize-none"
            />
          ) : (
            <div className="p-4 text-sm text-xhs-text leading-relaxed whitespace-pre-wrap">
              {renderGuideContent(currentGuide)}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 mt-4 space-y-3 pb-8">
          <button
            onClick={() => setEditing(!editing)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-xhs-border rounded-full text-sm text-xhs-text active:bg-xhs-bg transition-colors"
          >
            {editing ? <Check size={16} /> : <Edit3 size={16} />}
            <span>{editing ? t('guide.done') : t('guide.editGuide')}</span>
          </button>

          <button
            onClick={handlePublish}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-xhs-red text-white rounded-full text-sm font-semibold active:scale-[0.98] transition-transform shadow-lg shadow-red-200"
          >
            <BookmarkPlus size={16} />
            <span>{t('guide.publishNote')}</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-xhs-text-secondary"
          >
            <Home size={14} />
            <span>{t('guide.backToHome')}</span>
          </button>
        </div>
      </div>
    </>
  )
}

function formatInlineText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-xhs-text">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

function renderGuideContent(text) {
  if (!text) return null

  return text.split('\n').map((line, i) => {
    if (line.startsWith('# ')) {
      return (
        <h1 key={i} className="text-lg font-bold text-xhs-text mb-3 mt-2">
          {formatInlineText(line.replace('# ', ''))}
        </h1>
      )
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={i} className="text-base font-semibold text-xhs-text mt-4 mb-2">
          {formatInlineText(line.replace('## ', ''))}
        </h2>
      )
    }
    if (line.startsWith('---')) {
      return <hr key={i} className="my-4 border-xhs-border" />
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <p key={i} className="text-sm text-xhs-text pl-2 mb-1.5 leading-relaxed">
          • {formatInlineText(line.replace(/^[-*]\s/, ''))}
        </p>
      )
    }
    if (line.trim() === '') {
      return <div key={i} className="h-2" />
    }
    return (
      <p key={i} className="text-sm text-xhs-text mb-1.5 leading-relaxed">
        {formatInlineText(line)}
      </p>
    )
  })
}
