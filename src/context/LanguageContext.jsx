import { createContext, useContext, useState, useCallback } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  const toggleLang = useCallback(() => {
    setLang(prev => (prev === 'en' ? 'zh' : 'en'))
  }, [])

  const t = useCallback(
    (path) => {
      const keys = path.split('.')
      let result = translations[lang]
      for (const key of keys) {
        result = result?.[key]
      }
      return result || path
    },
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
