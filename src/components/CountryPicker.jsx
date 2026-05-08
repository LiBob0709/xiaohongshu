import { useState, useMemo, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'
import { COUNTRIES } from '../data/countries'
import { Search, X, Check } from 'lucide-react'

// Bottom-sheet country picker with live search.
// `value` is a country object (or null). `onChange(country)` is called when a row is tapped.
export default function CountryPicker({ open, onClose, value, onChange }) {
  const { lang, t } = useLang()
  const [query, setQuery] = useState('')

  // Lock the page-container scroll while the sheet is up; also clear the query
  // when the sheet closes (handled here as a side-effect of unmounting visually).
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      setQuery('')
    }
  }, [open])

  // Match against EN name, ZH name, AND ISO code (case-insensitive)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.zh.includes(query.trim()) ||
        c.code.toLowerCase().includes(q),
    )
  }, [query])

  if (!open) return null

  return (
    <div className="absolute inset-0 z-40 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full bg-white rounded-t-2xl flex flex-col"
        style={{ height: '80%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle + title */}
        <div className="px-5 pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-xhs-text">
              {t('findHelp.pickCountry')}
            </h3>
            <button onClick={onClose} className="p-1 -mr-1 text-xhs-text-secondary">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pb-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 bg-xhs-bg rounded-full">
            <Search size={14} className="text-xhs-text-secondary shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('findHelp.searchCountry')}
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-xhs-text-secondary"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-xhs-text-secondary">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-6">
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center text-xs text-xhs-text-secondary">
              {t('findHelp.noCountryMatch')}
            </div>
          ) : (
            filtered.map((c) => {
              const isSelected = value?.code === c.code
              return (
                <button
                  key={c.code}
                  onClick={() => {
                    onChange(c)
                    onClose()
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                    isSelected ? 'bg-xhs-red-light' : 'hover:bg-xhs-bg'
                  }`}
                >
                  <span className="text-2xl shrink-0">{c.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-xhs-text font-medium truncate">
                      {lang === 'en' ? c.name : c.zh}
                    </div>
                    <div className="text-[11px] text-xhs-text-secondary truncate">
                      {lang === 'en' ? c.zh : c.name} · {c.code}
                    </div>
                  </div>
                  {isSelected && <Check size={16} className="text-xhs-red shrink-0" />}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
