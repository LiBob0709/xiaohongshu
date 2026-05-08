import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { MapPin, Globe, ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import CountryPicker from '../components/CountryPicker'
import { DEFAULT_COUNTRY } from '../data/countries'

// `others` last per the design; multi-select is supported.
const CATEGORIES = [
  { key: 'food', emoji: '🍜', color: 'from-orange-100 to-red-100', border: 'border-orange-200' },
  { key: 'transport', emoji: '🚇', color: 'from-blue-100 to-cyan-100', border: 'border-blue-200' },
  { key: 'attractions', emoji: '🏛️', color: 'from-purple-100 to-pink-100', border: 'border-purple-200' },
  { key: 'shopping', emoji: '🛍️', color: 'from-pink-100 to-rose-100', border: 'border-pink-200' },
  { key: 'culture', emoji: '🎭', color: 'from-amber-100 to-yellow-100', border: 'border-amber-200' },
  { key: 'others', emoji: '✨', color: 'from-slate-100 to-gray-100', border: 'border-gray-200' },
]

export default function FindHelp() {
  const navigate = useNavigate()
  const { lang, t } = useLang()
  const [selected, setSelected] = useState([])  // multi-select
  const [desc, setDesc] = useState('')
  const [country, setCountry] = useState(DEFAULT_COUNTRY)
  const [pickerOpen, setPickerOpen] = useState(false)

  const toggleCategory = (key) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )

  const handleStart = () => {
    if (selected.length === 0) return
    navigate('/matching', {
      state: {
        categories: selected,
        // First selected category is treated as "primary" downstream where a single
        // value is needed (e.g. legacy persona prompt focus, guide cover styling).
        category: selected[0],
        description: desc,
        // Country name (e.g. "UK", "Japan", "China") — used by Guide/Publish prompts
        // and the welcome message ("I'm from <name>").
        nationality: country.name,
        country,
      },
    })
  }

  return (
    <>
      <Header title={t('home.findLocals')} showBack />

      <div className="page-container bg-xhs-bg">
        {/* Location */}
        <div className="mx-4 mt-4 p-4 bg-white rounded-2xl border border-xhs-border">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={16} className="text-xhs-red" />
            <span className="text-sm font-medium text-xhs-text">{t('findHelp.location')}</span>
          </div>
          <p className="text-sm text-xhs-text-secondary ml-6">
            {lang === 'en' ? 'Shanghai · Nanjing West Road' : '上海 · 南京西路'}
          </p>
        </div>

        {/* Nationality — tappable, opens picker */}
        <button
          onClick={() => setPickerOpen(true)}
          className="w-full text-left mx-0 mt-3 px-4"
        >
          <div className="p-4 bg-white rounded-2xl border border-xhs-border flex items-center gap-3 active:bg-xhs-bg transition-colors">
            <Globe size={16} className="text-xhs-red shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-xhs-text">
                {t('findHelp.nationality')}
              </div>
              <div className="text-xs text-xhs-text-secondary mt-0.5 flex items-center gap-1.5">
                <span className="text-base">{country.flag}</span>
                <span className="truncate">
                  {lang === 'en' ? country.name : country.zh}
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-xhs-text-secondary shrink-0" />
          </div>
        </button>

        {/* Title */}
        <div className="px-4 mt-6">
          <h2 className="text-lg font-bold text-xhs-text">{t('findHelp.title')}</h2>
          <p className="text-xs text-xhs-text-secondary mt-1">
            {t('findHelp.multiSelectHint')}
          </p>
        </div>

        {/* Categories — multi-select grid */}
        <div className="grid grid-cols-3 gap-3 px-4 mt-4">
          {CATEGORIES.map((cat) => {
            const active = selected.includes(cat.key)
            return (
              <button
                key={cat.key}
                onClick={() => toggleCategory(cat.key)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  active
                    ? 'border-xhs-red bg-xhs-red-light scale-[1.03]'
                    : `${cat.border} bg-gradient-to-br ${cat.color}`
                }`}
              >
                {active && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-xhs-red text-white text-[10px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                )}
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-xs font-medium text-xhs-text">
                  {t(`findHelp.categories.${cat.key}`)}
                </span>
              </button>
            )
          })}
        </div>

        {/* Description */}
        <div className="px-4 mt-5">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={t('findHelp.describe')}
            className="w-full p-3 bg-white border border-xhs-border rounded-xl text-sm text-xhs-text placeholder:text-xhs-text-secondary resize-none h-20 focus:outline-none focus:border-xhs-red transition-colors"
          />
        </div>

        {/* Start button */}
        <div className="px-4 mt-6 pb-8">
          <button
            onClick={handleStart}
            disabled={selected.length === 0}
            className={`w-full py-3.5 rounded-full text-sm font-semibold transition-all ${
              selected.length > 0
                ? 'bg-xhs-red text-white active:scale-[0.98] shadow-lg shadow-red-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {t('findHelp.startMatching')}
            {selected.length > 1 && (
              <span className="ml-1.5 text-xs opacity-90">· {selected.length}</span>
            )}
          </button>
        </div>
      </div>

      <CountryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={country}
        onChange={setCountry}
      />
    </>
  )
}
