import { useLang } from '../context/LanguageContext'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Header({ title, showBack = false, showLang = true, right = null }) {
  const { lang, toggleLang, t } = useLang()
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-xhs-border shrink-0 relative z-10">
      <div className="w-16 flex items-center">
        {showBack && (
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ChevronLeft size={24} className="text-xhs-text" />
          </button>
        )}
      </div>
      <h1 className="text-base font-semibold text-xhs-text truncate">{title}</h1>
      <div className="w-16 flex items-center justify-end">
        {right}
        {showLang && (
          <button
            onClick={toggleLang}
            className="ml-2 px-2 py-1 text-xs font-medium rounded-full border border-xhs-border text-xhs-text-secondary hover:bg-xhs-bg transition-colors"
          >
            {t('lang.switchTo')}
          </button>
        )}
      </div>
    </div>
  )
}
