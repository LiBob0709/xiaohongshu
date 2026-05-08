import { useState } from 'react'
import { useLang, SUPPORTED_LANGUAGES } from '../context/LanguageContext'
import { ChevronLeft, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LanguagePicker from './LanguagePicker'

export default function Header({ title, showBack = false, showLang = true, right = null }) {
  const { lang } = useLang()
  const navigate = useNavigate()
  const [pickerOpen, setPickerOpen] = useState(false)
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0]

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-xhs-border shrink-0 relative z-10">
        <div className="w-16 flex items-center">
          {showBack && (
            <button onClick={() => navigate(-1)} className="p-1 -ml-1">
              <ChevronLeft size={24} className="text-xhs-text" />
            </button>
          )}
        </div>
        <h1 className="text-base font-semibold text-xhs-text truncate">{title}</h1>
        <div className="w-16 flex items-center justify-end gap-1.5">
          {right}
          {showLang && (
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-1 pl-1.5 pr-1 py-0.5 rounded-full border border-xhs-border text-xhs-text-secondary hover:text-xhs-red hover:border-xhs-red transition-colors"
              aria-label={current.name}
            >
              <span className="text-sm leading-none">{current.flag}</span>
              <ChevronDown size={12} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      <LanguagePicker open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  )
}
