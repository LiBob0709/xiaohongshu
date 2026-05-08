import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang, SUPPORTED_LANGUAGES } from '../context/LanguageContext'
import {
  Search,
  MessageCircle,
  Menu,
  User,
  MapPin,
  Compass,
  Home as HomeIcon,
  ShoppingBag,
  Plus,
  ChevronDown,
} from 'lucide-react'
import FindLocalsSplash from '../components/FindLocalsSplash'
import LanguagePicker from '../components/LanguagePicker'

// One-shot guard for the Find Locals onboarding splash. Lives at module scope
// so it survives in-app navigation (Home → FindHelp → back to Home doesn't
// re-show the splash within the same session), but gets reset on every browser
// refresh or dev-server restart — which is exactly the demo behavior we want.
let splashSeenThisSession = false

function LangButton({ onClick }) {
  const { lang } = useLang()
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0]
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 pl-1.5 pr-1 py-0.5 rounded-full border border-xhs-border text-xhs-text-secondary hover:text-xhs-red hover:border-xhs-red transition-colors shrink-0"
      aria-label={current.name}
    >
      <span className="text-sm leading-none">{current.flag}</span>
      <ChevronDown size={12} strokeWidth={2.5} />
    </button>
  )
}

const MOCK_NOTES = [
  {
    id: 1,
    gradient: 'from-orange-400 to-red-500',
    emoji: '🥟',
    titleEn: 'Best Xiaolongbao in Shanghai',
    titleZh: '上海最好吃的小笼包合集',
    authorEn: 'FoodieJane',
    authorZh: '美食家小杰',
    likes: '2.3k',
    height: 'h-52',
  },
  {
    id: 2,
    gradient: 'from-blue-400 to-purple-500',
    emoji: '🏯',
    titleEn: 'Hidden Temples in Beijing',
    titleZh: '北京隐藏的小众寺庙',
    authorEn: 'CultureTrip',
    authorZh: '文化旅行者',
    likes: '5.1k',
    height: 'h-64',
  },
  {
    id: 3,
    gradient: 'from-green-400 to-teal-500',
    emoji: '🚇',
    titleEn: 'Shanghai Metro Guide',
    titleZh: '上海地铁出行全攻略',
    authorEn: 'TravelPro',
    authorZh: '旅行达人',
    likes: '1.8k',
    height: 'h-48',
  },
  {
    id: 4,
    gradient: 'from-pink-400 to-rose-500',
    emoji: '🌸',
    titleEn: 'Cherry Blossoms in Spring',
    titleZh: '春日赏樱花攻略',
    authorEn: 'NatureLover',
    authorZh: '自然爱好者',
    likes: '3.7k',
    height: 'h-56',
  },
  {
    id: 5,
    gradient: 'from-amber-400 to-orange-500',
    emoji: '☕',
    titleEn: 'Cutest Cafés in Chengdu',
    titleZh: '成都最可爱的咖啡馆',
    authorEn: 'CaféHunter',
    authorZh: '咖啡猎人',
    likes: '4.2k',
    height: 'h-60',
  },
  {
    id: 6,
    gradient: 'from-violet-400 to-indigo-500',
    emoji: '🎭',
    titleEn: 'Night Markets You Must Visit',
    titleZh: '必去的夜市推荐',
    authorEn: 'NightOwl',
    authorZh: '夜猫子',
    likes: '6.5k',
    height: 'h-44',
  },
]

// MOCK_NOTES only carry EN/ZH copy. For other UI languages we fall back to
// the English title/author — pragmatic for a demo, real data would be
// localized server-side.
function NoteCard({ note, lang }) {
  const title = lang === 'zh' ? note.titleZh : note.titleEn
  const author = lang === 'zh' ? note.authorZh : note.authorEn
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-sm border border-xhs-border">
      <div className={`${note.height} bg-gradient-to-br ${note.gradient} flex items-center justify-center`}>
        <span className="text-5xl">{note.emoji}</span>
      </div>
      <div className="p-2.5">
        <p className="text-xs font-medium text-xhs-text leading-snug line-clamp-2">{title}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-[8px]">👤</span>
            </div>
            <span className="text-[10px] text-xhs-text-secondary">{author}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] text-xhs-text-secondary">❤️ {note.likes}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const TOP_TABS = ['following', 'explore', 'nearby']
const SUB_TABS_KEYS = ['forYou', 'video', 'live', 'series', 'fashion']

export default function Home() {
  const navigate = useNavigate()
  const { lang, t } = useLang()
  const [topTab, setTopTab] = useState('nearby')
  const [subTab, setSubTab] = useState('forYou')
  const [langPickerOpen, setLangPickerOpen] = useState(false)
  // First-time taps on Find Locals show a full-screen onboarding splash
  // highlighting the product. Closing the splash (X or CTA) is what kicks
  // off navigation. Subsequent taps skip straight to /find-help.
  const [splashOpen, setSplashOpen] = useState(false)

  const handleFindLocals = () => {
    if (!splashSeenThisSession) {
      setSplashOpen(true)
      return
    }
    navigate('/find-help')
  }

  const handleCloseSplash = () => {
    splashSeenThisSession = true
    setSplashOpen(false)
    navigate('/find-help')
  }

  return (
    <>
      {/* Top bar: chat icon | tabs | search */}
      <div className="flex items-center gap-2 px-3 py-3 bg-white shrink-0">
        <button className="p-1.5 -ml-1 text-xhs-text">
          <Menu size={24} />
        </button>
        <div className="flex-1 flex items-center justify-center gap-5">
          {TOP_TABS.map((key) => {
            const active = topTab === key
            return (
              <button
                key={key}
                onClick={() => setTopTab(key)}
                className="relative flex flex-col items-center"
              >
                <span
                  className={`text-base ${
                    active ? 'font-bold text-xhs-text' : 'text-xhs-text-secondary'
                  }`}
                >
                  {t(`home.topTabs.${key}`)}
                </span>
                {active && (
                  <span className="absolute -bottom-1 w-5 h-0.5 bg-xhs-red rounded-full" />
                )}
              </button>
            )
          })}
        </div>
        <button className="p-1.5 text-xhs-text">
          <Search size={20} />
        </button>
        <LangButton onClick={() => setLangPickerOpen(true)} />
      </div>

      {/* Sub-tabs (only on Explore — matches XHS) */}
      {topTab === 'explore' && (
        <div className="flex items-center gap-4 px-4 py-2 bg-white border-b border-xhs-border shrink-0 overflow-x-auto">
          {SUB_TABS_KEYS.map((key) => {
            const active = subTab === key
            return (
              <button
                key={key}
                onClick={() => setSubTab(key)}
                className={`text-xs whitespace-nowrap pb-1 ${
                  active
                    ? 'font-semibold text-xhs-text border-b-2 border-xhs-red'
                    : 'text-xhs-text-secondary'
                }`}
              >
                {t(`home.subTabs.${key}`)}
              </button>
            )
          })}
          <button className="text-xhs-text-secondary ml-auto shrink-0">
            <ChevronDown size={14} />
          </button>
        </div>
      )}

      {/* Nearby-only banner with Find Locals button */}
      {topTab === 'nearby' && (
        <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-xhs-red to-pink-500 rounded-xl text-white flex items-center gap-3 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} />
              <span className="text-xs font-medium truncate">{t('home.locationName')}</span>
            </div>
            <p className="text-[11px] opacity-90">{t('home.nearbyHint')}</p>
          </div>
          <button
            onClick={handleFindLocals}
            className="shrink-0 flex items-center gap-1 bg-white text-xhs-red px-3 py-2 rounded-full text-xs font-semibold shadow-md active:scale-95 transition-transform"
          >
            <Compass size={14} />
            <span>{t('home.findLocals')}</span>
          </button>
        </div>
      )}

      {/* Feed (shared across all three top tabs in this demo) */}
      <div className="page-container px-3 pt-3 pb-20 bg-xhs-bg">
        <div className="masonry-grid">
          {MOCK_NOTES.map((note) => (
            <NoteCard key={note.id} note={note} lang={lang} />
          ))}
        </div>
      </div>

      {/* Bottom Nav: 5 items, center "+" stands out */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around py-2 pb-5 bg-white border-t border-xhs-border z-10">
        <NavItem icon={<HomeIcon size={22} />} label={t('home.nav.home')} active />
        <NavItem icon={<ShoppingBag size={22} />} label={t('home.nav.market')} />
        <button className="-mt-6 w-12 h-12 rounded-2xl bg-xhs-red flex items-center justify-center text-white shadow-lg shadow-red-200 active:scale-95 transition-transform">
          <Plus size={26} strokeWidth={3} />
        </button>
        <NavItem icon={<MessageCircle size={22} />} label={t('home.nav.messages')} />
        <NavItem icon={<User size={22} />} label={t('home.nav.me')} />
      </div>

      {/* First-time onboarding splash for Find Locals */}
      {splashOpen && <FindLocalsSplash onClose={handleCloseSplash} />}

      <LanguagePicker open={langPickerOpen} onClose={() => setLangPickerOpen(false)} />
    </>
  )
}

function NavItem({ icon, label, active }) {
  return (
    <div className={`flex flex-col items-center gap-0.5 ${active ? 'text-xhs-text' : 'text-xhs-text-secondary'}`}>
      {icon}
      <span className="text-[10px]">{label}</span>
    </div>
  )
}
