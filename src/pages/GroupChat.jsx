import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang } from '../context/LanguageContext'
import { getLocalResponse, translateText, LOCAL_PERSONAS } from '../api/mimo'
import { pickChatNote } from '../data/mockChatNotes'
import Header from '../components/Header'
import NoteViewer from '../components/NoteViewer'
import { normalizeChatNote } from '../data/noteShape'
import { Send, Sparkles } from 'lucide-react'

export default function GroupChat() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang, t } = useLang()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  // Per-message "show Chinese (original)" toggle. Each message renders its
  // English form by default — tap the language pill to flip to the Chinese
  // original (a local's actual reply, or the user's own translated-to-Chinese
  // version for context).
  const [chineseShown, setChineseShown] = useState(() => new Set())
  // Currently-open linked-note viewer (null when closed). Click a chat note
  // card → set; close → null.
  const [openNote, setOpenNote] = useState(null)
  const toggleChinese = (id) =>
    setChineseShown((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const bottomRef = useRef(null)

  const category = location.state?.category || 'food'
  // Stabilized to keep the sendMessage useCallback's deps from changing every
  // render (the `||` fallback creates a new array each time otherwise).
  const categories = useMemo(
    () => location.state?.categories || [category],
    [location.state?.categories, category],
  )
  const description = location.state?.description || ''
  const nationality = location.state?.nationality || 'UK'

  // Per-language welcome-message template. The user's auto-sent intro to the
  // group is composed in their selected UI language; the locals see a Chinese
  // translation in the chat-history sent to the LLM.
  const WELCOME_TPL = {
    en: {
      interest: { food: 'food', transport: 'transportation', attractions: 'attractions', shopping: 'shopping', culture: 'culture', others: 'travel tips' },
      join: { sep: ', ', last: ' and ' },
      ask: (q) => (q ? ` I want to know: ${q}.` : ' Could you give me some recommendations?'),
      build: (nat, interest, ask) => `Hi everyone! I'm from ${nat} and I'm in Shanghai right now. I'm interested in ${interest}.${ask} Thank you!`,
    },
    zh: {
      interest: { food: '美食', transport: '交通', attractions: '景点', shopping: '购物', culture: '文化', others: '旅行建议' },
      join: { sep: '、', last: '和' },
      ask: (q) => (q ? ` 我想了解：${q}。` : ' 能给我一些建议吗？'),
      build: (nat, interest, ask) => `大家好！我来自${nat}，现在在上海。我想了解${interest}。${ask} 谢谢！`,
    },
    fr: {
      interest: { food: 'la cuisine', transport: 'les transports', attractions: 'les attractions', shopping: 'le shopping', culture: 'la culture', others: 'des conseils de voyage' },
      join: { sep: ', ', last: ' et ' },
      ask: (q) => (q ? ` J'aimerais savoir : ${q}.` : " Pourriez-vous me donner quelques conseils ?"),
      build: (nat, interest, ask) => `Bonjour à tous ! Je viens de ${nat} et je suis à Shanghai en ce moment. Je m'intéresse à ${interest}.${ask} Merci !`,
    },
    es: {
      interest: { food: 'la comida', transport: 'el transporte', attractions: 'las atracciones', shopping: 'las compras', culture: 'la cultura', others: 'consejos de viaje' },
      join: { sep: ', ', last: ' y ' },
      ask: (q) => (q ? ` Quiero saber: ${q}.` : ' ¿Pueden darme algunas recomendaciones?'),
      build: (nat, interest, ask) => `¡Hola a todos! Soy de ${nat} y estoy en Shanghái ahora mismo. Me interesa ${interest}.${ask} ¡Gracias!`,
    },
    ja: {
      interest: { food: 'グルメ', transport: '交通', attractions: '観光地', shopping: 'ショッピング', culture: '文化', others: '旅行のヒント' },
      join: { sep: '、', last: 'と' },
      ask: (q) => (q ? ` 知りたいこと：${q}。` : ' おすすめを教えてもらえますか？'),
      build: (nat, interest, ask) => `皆さん、こんにちは！${nat}から来ました、今上海にいます。${interest}に興味があります。${ask} ありがとうございます！`,
    },
    ko: {
      interest: { food: '맛집', transport: '교통', attractions: '관광지', shopping: '쇼핑', culture: '문화', others: '여행 팁' },
      join: { sep: ', ', last: ' 및 ' },
      ask: (q) => (q ? ` 알고 싶은 것: ${q}.` : ' 추천 좀 해주실 수 있나요?'),
      build: (nat, interest, ask) => `안녕하세요 여러분! ${nat}에서 왔고 지금 상하이에 있어요. ${interest}에 관심이 있어요.${ask} 감사합니다!`,
    },
  }

  const buildWelcomeMessage = () => {
    const tpl = WELCOME_TPL[lang] || WELCOME_TPL.en
    const items = categories.map((c) => tpl.interest[c] || tpl.interest.others)
    const interest =
      items.length <= 1
        ? items[0] || tpl.interest.others
        : items.slice(0, -1).join(tpl.join.sep) + tpl.join.last + items[items.length - 1]
    return tpl.build(nationality, interest, tpl.ask(description.trim()))
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
        // ZH users speak Chinese natively → no need to translate either side.
        // For all other languages, we round-trip user.lang ↔ Chinese.
        const needsTranslation = lang !== 'zh'
        const translationPromise = needsTranslation
          ? translateText(text, lang, 'zh')
          : Promise.resolve(null)

        const respondingOrder = [0, 1, 2].sort(() => Math.random() - 0.5)
        const respondCount = Math.random() > 0.3 ? 2 : 3
        // Pick which response (within this turn) gets a Xiaohongshu note card
        // attached. The product spec is "at least one local response per turn
        // shares a post" — we pick exactly one at random.
        const noteAttachIdx = Math.floor(Math.random() * respondCount)

        for (let i = 0; i < respondCount; i++) {
          const personaIdx = respondingOrder[i]
          const persona = LOCAL_PERSONAS[personaIdx]

          setTypingUsers((prev) => [...prev, persona.id])

          try {
            const chatHistory = [...messages, userMsg].filter((m) => m.type !== 'system')
            const response = await getLocalResponse(personaIdx, text, chatHistory, category)
            const translation = needsTranslation
              ? await translateText(response, 'zh', lang)
              : null
            const linkedNote = i === noteAttachIdx ? pickChatNote(categories) : null

            setTypingUsers((prev) => prev.filter((id) => id !== persona.id))

            setMessages((prev) => [
              ...prev,
              {
                id: `local-${Date.now()}-${personaIdx}`,
                type: 'local',
                isUser: false,
                senderId: persona.id,
                senderName: lang === 'zh' ? persona.name : persona.nameEn,
                senderAvatar: persona.avatar,
                text: response,
                translation,
                linkedNote,
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
    [isLoading, messages, category, categories, lang]
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
      <span>{t('chat.guideButton')}</span>
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

          // For both sides: msg.text is the original-language string, msg.translation
          // is the other-language form. User typed English → text=EN, translation=ZH.
          // Local replied Chinese → text=ZH, translation=EN. We always default to
          // showing the English form, regardless of side.
          const englishText = msg.isUser ? msg.text : msg.translation
          const chineseText = msg.isUser ? msg.translation : msg.text
          const showChinese = chineseShown.has(msg.id)
          // While the locals' translation is still in flight, fall back to the
          // raw text so the bubble isn't blank.
          const display = showChinese ? chineseText : englishText || msg.text
          const hasFlip = Boolean(englishText && chineseText)
          // Label is content-relative: button shows "Translate" when the bubble
          // currently displays the message's original language (tap → translate),
          // and "See original" when displaying the translated form (tap → revert).
          const showingOriginal = msg.isUser ? !showChinese : showChinese
          const flipLabel = showingOriginal ? t('chat.translate') : t('chat.seeOriginal')

          if (msg.isUser) {
            return (
              <div key={msg.id} className="flex justify-end gap-2">
                <div className="max-w-[75%] flex flex-col items-end">
                  <div className="bg-xhs-red text-white px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed">
                    {display}
                  </div>
                  {hasFlip && (
                    <button
                      onClick={() => toggleChinese(msg.id)}
                      className="mt-1 text-[12px] text-xhs-blue active:opacity-70 transition-opacity"
                    >
                      {flipLabel}
                    </button>
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
                  {display}
                </div>
                {/* Linked Xiaohongshu note card — clickable, opens NoteViewer */}
                {msg.linkedNote && (
                  <ChatNoteCard
                    note={msg.linkedNote}
                    lang={lang}
                    onOpen={() => setOpenNote(normalizeChatNote(msg.linkedNote, lang))}
                  />
                )}
                {hasFlip && (
                  <button
                    onClick={() => toggleChinese(msg.id)}
                    className="mt-1 text-[12px] text-xhs-blue active:opacity-70 transition-opacity"
                  >
                    {flipLabel}
                  </button>
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
                  {lang === 'zh' ? persona.name : persona.nameEn}
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

      {/* Linked-note overlay (Xiaohongshu detail page mock) */}
      {openNote && <NoteViewer note={openNote} onClose={() => setOpenNote(null)} />}
    </>
  )
}

// Compact "shared post" card that hangs off a chat bubble. Layout mimics
// Xiaohongshu's "shared note" card inside DMs: square thumbnail on the left,
// 2-line title + author/likes line on the right.
function ChatNoteCard({ note, lang, onOpen }) {
  const title = lang === 'zh' ? note.title.zh : note.title.en
  const author = lang === 'zh' ? note.author.zh : note.author.en
  return (
    <button
      onClick={onOpen}
      className="mt-2 w-full max-w-[280px] flex items-stretch gap-2 p-1.5 bg-white border border-xhs-border rounded-xl text-left hover:border-xhs-red active:scale-[0.99] transition-all overflow-hidden"
    >
      <div
        className={`w-16 h-16 shrink-0 rounded-lg bg-gradient-to-br ${note.gradient} flex items-center justify-center`}
      >
        <span className="text-3xl">{note.emoji}</span>
      </div>
      <div className="flex-1 min-w-0 flex flex-col py-0.5">
        <p className="text-[12px] font-medium text-xhs-text leading-snug line-clamp-2">
          {title}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-[10px] text-xhs-text-secondary truncate">@{author}</span>
          <span className="text-[10px] text-xhs-text-secondary shrink-0">❤️ {note.likes}</span>
        </div>
      </div>
    </button>
  )
}
