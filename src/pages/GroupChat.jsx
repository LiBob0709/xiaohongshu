import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { getLocalResponse, translateText, LOCAL_PERSONAS } from '../api/mimo'
import Header from '../components/Header'
import { Send, Sparkles } from 'lucide-react'

export default function GroupChat() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang, t } = useLang()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const bottomRef = useRef(null)

  const category = location.state?.category || 'food'
  const categories = location.state?.categories || [category]
  const description = location.state?.description || ''
  const nationality = location.state?.nationality || 'UK'

  // Build the auto-sent welcome message in English. With multi-select we may have
  // 1..N interests; "food" → "food", ["food","transport"] → "food and transportation",
  // ["food","transport","attractions"] → "food, transportation and attractions".
  const buildWelcomeMessage = () => {
    const interestMap = {
      food: 'food',
      transport: 'transportation',
      attractions: 'attractions',
      shopping: 'shopping',
      culture: 'culture',
      others: 'travel tips',
    }
    const items = categories.map((c) => interestMap[c] || 'travel tips')
    const interest =
      items.length <= 1
        ? items[0] || 'travel tips'
        : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
    const question = description.trim()
    const questionLine = question
      ? ` I want to know: ${question}.`
      : ` Could you give me some recommendations?`
    return `Hi everyone! I'm from ${nationality} and I'm in Shanghai right now. I'm interested in ${interest}.${questionLine} Thank you!`
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isLoading) return

      const userMsg = {
        id: `user-${Date.now()}`,
        type: 'user',
        isUser: true,
        text: text.trim(),
        translation: null,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsLoading(true)

      try {
        const translationPromise = translateText(text, 'English', 'Chinese')

        const respondingOrder = [0, 1, 2].sort(() => Math.random() - 0.5)
        const respondCount = Math.random() > 0.3 ? 2 : 3

        for (let i = 0; i < respondCount; i++) {
          const personaIdx = respondingOrder[i]
          const persona = LOCAL_PERSONAS[personaIdx]

          setTypingUsers((prev) => [...prev, persona.id])

          try {
            const chatHistory = [...messages, userMsg].filter((m) => m.type !== 'system')
            const response = await getLocalResponse(personaIdx, text, chatHistory, category)
            const translation = await translateText(response, 'Chinese', 'English')

            setTypingUsers((prev) => prev.filter((id) => id !== persona.id))

            setMessages((prev) => [
              ...prev,
              {
                id: `local-${Date.now()}-${personaIdx}`,
                type: 'local',
                isUser: false,
                senderId: persona.id,
                senderName: lang === 'en' ? persona.nameEn : persona.name,
                senderAvatar: persona.avatar,
                text: response,
                translation,
                timestamp: new Date(),
              },
            ])
          } catch (err) {
            console.error(`Error from persona ${personaIdx}:`, err)
            setTypingUsers((prev) => prev.filter((id) => id !== persona.id))
          }
        }

        try {
          const userTranslation = await translationPromise
          setMessages((prev) =>
            prev.map((m) => (m.id === userMsg.id ? { ...m, translation: userTranslation } : m))
          )
        } catch (e) {
          console.error('Translation error:', e)
        }
      } catch (err) {
        console.error('Chat error:', err)
      } finally {
        setIsLoading(false)
        setTypingUsers([])
      }
    },
    [isLoading, messages, category, lang]
  )

  // Always-fresh handle to sendMessage so the auto-welcome timer below uses
  // the latest closure (sendMessage's identity changes when `messages` changes,
  // but functional setState makes that mostly irrelevant — the ref is just for safety).
  const sendMessageRef = useRef(sendMessage)
  useEffect(() => {
    sendMessageRef.current = sendMessage
  }, [sendMessage])

  // Initial system message + auto-sent welcome.
  // Placed AFTER sendMessage so the closure can reference it.
  //
  // Why no cleanup that clears the timer: React 19 StrictMode synthetically
  // unmounts → remounts on first mount in dev. Refs are PRESERVED across that
  // remount, so a `if (ref.current) return` guard would correctly block
  // double-firing — but if we ALSO clear the timer in cleanup, the only
  // scheduled timer gets cancelled and the remount returns early, so the
  // welcome never sends. Skip cleanup; ref guard alone is sufficient.
  const welcomeFiredRef = useRef(false)
  useEffect(() => {
    if (welcomeFiredRef.current) return
    welcomeFiredRef.current = true
    setMessages([
      {
        id: 'system-1',
        type: 'system',
        text: t('chat.systemMatch'),
        timestamp: new Date(),
      },
    ])
    const welcome = buildWelcomeMessage()
    setTimeout(() => sendMessageRef.current?.(welcome), 600)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEndChat = () => {
    navigate('/guide', {
      state: {
        messages: messages.filter((m) => m.type !== 'system'),
        category,
        categories,
        nationality,
      },
    })
  }

  const QUICK_MESSAGES = {
    quickFood: 'What are some good local restaurants or street food nearby?',
    quickTransport: 'How do I get around this area? Any transport tips?',
    quickAttractions: 'What are the must-see attractions near here?',
    quickShopping: 'Where should I go shopping around here?',
    quickCulture: 'Anything culturally unique I should experience here?',
  }

  const quickActions = [
    { key: 'quickFood', label: t('chat.quickFood'), msg: QUICK_MESSAGES.quickFood },
    { key: 'quickTransport', label: t('chat.quickTransport'), msg: QUICK_MESSAGES.quickTransport },
    { key: 'quickAttractions', label: t('chat.quickAttractions'), msg: QUICK_MESSAGES.quickAttractions },
    { key: 'quickShopping', label: t('chat.quickShopping'), msg: QUICK_MESSAGES.quickShopping },
    { key: 'quickCulture', label: t('chat.quickCulture'), msg: QUICK_MESSAGES.quickCulture },
  ]

  const endButton = (
    <button
      onClick={handleEndChat}
      disabled={messages.length < 3}
      className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-full bg-xhs-red text-white disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
    >
      <Sparkles size={10} />
      <span>{lang === 'en' ? 'Guide' : '攻略'}</span>
    </button>
  )

  return (
    <>
      <Header
        title={t('chat.groupChat')}
        showBack
        right={endButton}
      />

      {/* Members bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-xhs-bg border-b border-xhs-border shrink-0">
        <div className="flex -space-x-2">
          {LOCAL_PERSONAS.map((p) => (
            <div
              key={p.id}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-200 to-red-200 flex items-center justify-center text-xs border-2 border-white"
            >
              {p.avatar}
            </div>
          ))}
          <div className="w-6 h-6 rounded-full bg-xhs-blue flex items-center justify-center text-[10px] text-white border-2 border-white">
            You
          </div>
        </div>
        <span className="text-xs text-xhs-text-secondary">
          {t('chat.members').replace('{count}', '4')}
        </span>
      </div>

      {/* Messages */}
      <div className="page-container bg-xhs-bg px-3 py-3 space-y-3">
        {messages.map((msg) => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-[11px] text-xhs-text-secondary bg-white px-3 py-1.5 rounded-full shadow-sm">
                  {msg.text}
                </span>
              </div>
            )
          }

          if (msg.isUser) {
            return (
              <div key={msg.id} className="flex justify-end gap-2">
                <div className="max-w-[75%]">
                  <div className="bg-xhs-red text-white px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed">
                    {msg.text}
                  </div>
                  {msg.translation && (
                    <div className="mt-1 px-3 py-1.5 bg-white rounded-xl text-[11px] text-xhs-text-secondary border border-xhs-border">
                      🌐 {msg.translation}
                    </div>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-xhs-blue flex items-center justify-center text-[10px] text-white shrink-0">
                  You
                </div>
              </div>
            )
          }

          return (
            <div key={msg.id} className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-red-200 flex items-center justify-center text-sm shrink-0">
                {msg.senderAvatar}
              </div>
              <div className="max-w-[75%]">
                <span className="text-[11px] text-xhs-text-secondary mb-1 block">
                  {msg.senderName}
                </span>
                <div className="bg-white px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-sm text-xhs-text leading-relaxed shadow-sm">
                  {msg.text}
                </div>
                {msg.translation && (
                  <div className="mt-1 px-3 py-1.5 bg-blue-50 rounded-xl text-[11px] text-xhs-blue border border-blue-100">
                    🌐 {msg.translation}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Typing indicators */}
        {typingUsers.map((userId) => {
          const persona = LOCAL_PERSONAS.find((p) => p.id === userId)
          if (!persona) return null
          return (
            <div key={`typing-${userId}`} className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-200 to-red-200 flex items-center justify-center text-sm shrink-0">
                {persona.avatar}
              </div>
              <div>
                <span className="text-[11px] text-xhs-text-secondary mb-1 block">
                  {lang === 'en' ? persona.nameEn : persona.name}
                </span>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-typing-dot-1" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-typing-dot-2" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-typing-dot-3" />
                </div>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* Quick actions — always visible so the user can quick-ask at any point */}
      <div className="flex gap-2 px-3 py-2 bg-white border-t border-xhs-border overflow-x-auto shrink-0">
        {quickActions.map((action) => (
          <button
            key={action.key}
            onClick={() => sendMessage(action.msg)}
            disabled={isLoading}
            className="whitespace-nowrap px-3 py-1.5 bg-xhs-bg rounded-full text-xs text-xhs-text border border-xhs-border hover:border-xhs-red hover:text-xhs-red disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 py-2 pb-5 bg-white border-t border-xhs-border shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              sendMessage(input)
            }
          }}
          placeholder={t('chat.inputPlaceholder')}
          className="flex-1 px-4 py-2.5 bg-xhs-bg rounded-full text-sm text-xhs-text placeholder:text-xhs-text-secondary focus:outline-none focus:ring-2 focus:ring-xhs-red/20"
          disabled={isLoading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="w-9 h-9 rounded-full bg-xhs-red flex items-center justify-center text-white disabled:bg-gray-300 transition-colors shrink-0 active:scale-95"
        >
          <Send size={16} />
        </button>
      </div>
    </>
  )
}
