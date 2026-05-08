import { createContext, useContext, useState, useCallback } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext()

// Supported UI languages. The picker renders this list in order.
// Adding a new language: drop a section into translations.js and add an entry here.
export const SUPPORTED_LANGUAGES = [
  { code: 'en', flag: '🇬🇧', label: 'English', name: 'English' },
  { code: 'zh', flag: '🇨🇳', label: '中文', name: 'Chinese' },
  { code: 'fr', flag: '🇫🇷', label: 'Français', name: 'French' },
  { code: 'es', flag: '🇪🇸', label: 'Español', name: 'Spanish' },
  { code: 'ja', flag: '🇯🇵', label: '日本語', name: 'Japanese' },
  { code: 'ko', flag: '🇰🇷', label: '한국어', name: 'Korean' },
]

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  // Kept for backwards compatibility with any legacy callers — flips between
  // EN ↔ ZH only (the original two-language toggle). New code should use
  // setLang(code) directly for finer control.
  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'en' ? 'zh' : 'en'))
  }, [])

  // Resolve a dotted path like "guide.editGuide" against the current language's
  // translation table. Falls back to English if the key is missing in the
  // current language (so partially-translated languages still work), and
  // ultimately to the path itself so missing keys are visible during dev.
  const t = useCallback(
    (path) => {
      const keys = path.split('.')
      const lookup = (table) => keys.reduce((acc, k) => acc?.[k], table)
      return lookup(translations[lang]) || lookup(translations.en) || path
    },
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
