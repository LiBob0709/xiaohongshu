import { useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { SUPPORTED_LANGUAGES } from '../i18n/languages'

// Bottom-sheet language picker. Listing comes from SUPPORTED_LANGUAGES so any
// new language added there shows up automatically. Tapping a row sets the lang
// and dismisses; the X (or backdrop tap) cancels without changing.
export default function LanguagePicker({ open, onClose }) {
  const { lang, setLang, t } = useLang()

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="absolute inset-0 z-40 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 animate-splash-fade" />
      <div
        className="relative w-full bg-white rounded-t-2xl px-5 pt-3 pb-7 max-h-[85%] overflow-y-auto animate-splash-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-xhs-text">
            {t('languagePicker.title')}
          </h3>
          <button onClick={onClose} className="p-1 -mr-1 text-xhs-text-secondary">
            <X size={18} />
          </button>
        </div>
        <p className="text-[11px] text-xhs-text-secondary mb-3">
          {t('languagePicker.subtitle')}
        </p>

        <div className="space-y-1">
          {SUPPORTED_LANGUAGES.map((l) => {
            const active = l.code === lang
            return (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code)
                  onClose()
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                  active ? 'bg-xhs-red-light' : 'hover:bg-xhs-bg active:bg-xhs-bg'
                }`}
              >
                <span className="text-2xl shrink-0">{l.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm truncate ${active ? 'font-semibold text-xhs-red' : 'text-xhs-text'}`}>
                    {l.label}
                  </div>
                  <div className="text-[11px] text-xhs-text-secondary">{l.name}</div>
                </div>
                {active && <Check size={16} className="text-xhs-red shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
