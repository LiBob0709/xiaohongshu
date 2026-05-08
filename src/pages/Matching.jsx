import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { LOCAL_PERSONAS } from '../api/mimo'
import Header from '../components/Header'

const DISTANCES = ['0.8km', '1.2km', '2.1km']

export default function Matching() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang, t } = useLang()
  const [phase, setPhase] = useState('searching')
  const [foundUsers, setFoundUsers] = useState([])

  const category = location.state?.category || 'food'
  const categories = location.state?.categories || [category]
  const description = location.state?.description || ''
  const nationality = location.state?.nationality || 'UK'

  useEffect(() => {
    const timers = []

    timers.push(setTimeout(() => {
      setFoundUsers([0])
    }, 1500))

    timers.push(setTimeout(() => {
      setFoundUsers([0, 1])
    }, 2500))

    timers.push(setTimeout(() => {
      setFoundUsers([0, 1, 2])
      setPhase('found')
    }, 3500))

    return () => timers.forEach(clearTimeout)
  }, [])

  const handleStartChat = () => {
    navigate('/chat', {
      state: { category, categories, description, nationality, users: LOCAL_PERSONAS },
    })
  }

  return (
    <>
      <Header title={t('home.findLocals')} showBack />

      <div className="page-container bg-white flex flex-col items-center justify-center px-4">
        {/* Radar */}
        <div className="relative w-56 h-56 mb-8">
          {/* Radar rings */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border-2 border-xhs-red/20 animate-radar-ping"
              style={{ animationDelay: `${i * 0.6}s` }}
            />
          ))}

          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-xhs-red flex items-center justify-center shadow-lg shadow-red-200">
              <span className="text-white text-lg">📍</span>
            </div>
          </div>

          {/* Radar sweep */}
          {phase === 'searching' && (
            <div className="absolute inset-0 animate-radar-rotate">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, transparent 85%, rgba(255, 36, 66, 0.3) 100%)',
                }}
              />
            </div>
          )}

          {/* Found users on radar */}
          {foundUsers.includes(0) && (
            <div className="absolute top-4 right-6 animate-user-pop">
              <UserDot persona={LOCAL_PERSONAS[0]} />
            </div>
          )}
          {foundUsers.includes(1) && (
            <div className="absolute bottom-8 left-4 animate-user-pop" style={{ animationDelay: '0.1s' }}>
              <UserDot persona={LOCAL_PERSONAS[1]} />
            </div>
          )}
          {foundUsers.includes(2) && (
            <div className="absolute bottom-4 right-10 animate-user-pop" style={{ animationDelay: '0.2s' }}>
              <UserDot persona={LOCAL_PERSONAS[2]} />
            </div>
          )}
        </div>

        {/* Status text */}
        <p className="text-base font-semibold text-xhs-text mb-2">
          {phase === 'searching'
            ? t('matching.searching')
            : t('matching.found').replace('{count}', '3')}
        </p>

        {/* User cards */}
        {phase === 'found' && (
          <div className="w-full space-y-3 mt-4 animate-float-up">
            {LOCAL_PERSONAS.map((persona, idx) => (
              <div
                key={persona.id}
                className="flex items-center gap-3 p-3 bg-xhs-bg rounded-2xl border border-xhs-border"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-200 to-red-200 flex items-center justify-center text-xl shrink-0">
                  {persona.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-xhs-text">
                      {lang === 'en' ? persona.nameEn : persona.name}
                    </span>
                    <span className="text-[10px] bg-xhs-green/10 text-xhs-green px-1.5 py-0.5 rounded-full">
                      {t('matching.online')}
                    </span>
                  </div>
                  <p className="text-xs text-xhs-text-secondary mt-0.5">
                    {t('matching.expertise')}: {lang === 'en' ? persona.expertiseEn : persona.expertise}
                  </p>
                </div>
                <span className="text-[10px] text-xhs-text-secondary shrink-0">
                  {t('matching.distance').replace('{dist}', DISTANCES[idx])}
                </span>
              </div>
            ))}

            <button
              onClick={handleStartChat}
              className="w-full py-3.5 bg-xhs-red text-white rounded-full text-sm font-semibold mt-4 active:scale-[0.98] transition-transform shadow-lg shadow-red-200"
            >
              {t('matching.startChat')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function UserDot({ persona }) {
  return (
    <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-lg border-2 border-xhs-red/30">
      {persona.avatar}
    </div>
  )
}
