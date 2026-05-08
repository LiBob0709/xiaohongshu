import { useEffect } from 'react'
import { X, Users, Languages, Sparkles, ArrowRight } from 'lucide-react'
import { useLang } from '../context/LanguageContext'

// Full-screen "cold start" splash shown the first time the user taps
// "Find Locals". Highlights the three core product capabilities. Dismissed
// via the close button (X) at the top-right OR the bottom CTA — both call
// onClose, which is what kicks off the actual navigation in the parent.
export default function FindLocalsSplash({ onClose }) {
  const { t } = useLang()

  // Lock background scroll while open.
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const features = [
    {
      icon: Users,
      titleKey: 'splash.feature1Title',
      descKey: 'splash.feature1Desc',
      bg: 'bg-white/15',
    },
    {
      icon: Languages,
      titleKey: 'splash.feature2Title',
      descKey: 'splash.feature2Desc',
      bg: 'bg-white/15',
    },
    {
      icon: Sparkles,
      titleKey: 'splash.feature3Title',
      descKey: 'splash.feature3Desc',
      bg: 'bg-white/15',
    },
  ]

  return (
    <div className="absolute inset-0 z-50 flex flex-col text-white animate-splash-fade overflow-hidden">
      {/* Layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-xhs-red via-pink-500 to-orange-400" />
      {/* Soft floating blobs to add depth */}
      <span className="absolute -top-16 -left-10 w-48 h-48 rounded-full bg-white/15 blur-2xl" />
      <span className="absolute top-1/3 -right-12 w-44 h-44 rounded-full bg-yellow-200/25 blur-2xl" />
      <span className="absolute bottom-20 -left-8 w-40 h-40 rounded-full bg-pink-200/30 blur-2xl" />

      {/* Top bar with close */}
      <div className="relative shrink-0 flex items-center justify-end px-4 pt-5">
        <button
          onClick={onClose}
          aria-label={t('splash.close')}
          className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center active:scale-90 transition-transform"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Hero */}
      <div className="relative shrink-0 px-6 pt-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-[10px] font-semibold tracking-wide uppercase">
          <Sparkles size={11} />
          <span>{t('splash.badge')}</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight whitespace-pre-line animate-splash-rise">
          {t('splash.heroTitle')}
        </h1>
        <p className="mt-2 text-sm text-white/85 leading-relaxed animate-splash-rise" style={{ animationDelay: '80ms' }}>
          {t('splash.heroSubtitle')}
        </p>
      </div>

      {/* Feature cards */}
      <div className="relative flex-1 px-6 mt-7 space-y-3 overflow-y-auto pb-2">
        {features.map((f, i) => {
          const Icon = f.icon
          return (
            <div
              key={f.titleKey}
              className={`${f.bg} backdrop-blur rounded-2xl p-4 flex items-start gap-3 animate-splash-rise`}
              style={{ animationDelay: `${160 + i * 100}ms` }}
            >
              <div className="shrink-0 w-10 h-10 rounded-xl bg-white text-xhs-red flex items-center justify-center shadow-lg shadow-black/10">
                <Icon size={20} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold">{t(f.titleKey)}</h3>
                <p className="mt-0.5 text-[12px] text-white/85 leading-relaxed">
                  {t(f.descKey)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom CTA */}
      <div className="relative shrink-0 px-6 pb-8 pt-4">
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-1.5 py-3.5 rounded-full bg-white text-xhs-red text-sm font-bold shadow-lg shadow-black/15 active:scale-[0.98] transition-transform animate-splash-rise"
          style={{ animationDelay: '480ms' }}
        >
          <span>{t('splash.cta')}</span>
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
        <p className="mt-2 text-center text-[10px] text-white/70">
          {t('splash.tapClose')}
        </p>
      </div>
    </div>
  )
}
