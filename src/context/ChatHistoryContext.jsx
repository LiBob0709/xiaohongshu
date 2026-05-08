import { createContext, useContext, useState, useCallback, useRef } from 'react'

// Holds every chat session the user has started in the current run.
// Sessions are keyed by id and rendered in reverse-chronological order on the
// Messages page. Tapping one navigates back to /chat with a `resumeSessionId`
// in the router state, which causes GroupChat to seed its messages array
// from the saved record (instead of running the new-chat welcome flow).
//
// Lifetime: in-memory only — clears on browser refresh, mirroring how the
// rest of the demo treats persistence (splash flag, posted notes).
const ChatHistoryContext = createContext()

export function ChatHistoryProvider({ children }) {
  const [sessions, setSessions] = useState({})
  // Stable order separate from the dictionary so list iteration is O(n) without
  // sorting on every render. Newest first.
  const [order, setOrder] = useState([])
  // Latest snapshot for synchronous lookups inside callbacks (avoids stale-state
  // closures when the same callback fires multiple state updates in a row).
  const sessionsRef = useRef({})

  const startSession = useCallback((seed) => {
    const id = `chat-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    const now = Date.now()
    const session = {
      id,
      createdAt: now,
      updatedAt: now,
      messages: [],
      // seed: { category, categories, nationality, description }
      ...seed,
    }
    sessionsRef.current = { ...sessionsRef.current, [id]: session }
    setSessions(sessionsRef.current)
    setOrder((prev) => [id, ...prev.filter((x) => x !== id)])
    return id
  }, [])

  // Patch a session — merges `patch` into the existing record and bumps
  // updatedAt. Bumps the session to the top of `order` so the list stays
  // recency-sorted.
  const updateSession = useCallback((id, patch) => {
    const existing = sessionsRef.current[id]
    if (!existing) return
    const next = { ...existing, ...patch, updatedAt: Date.now() }
    sessionsRef.current = { ...sessionsRef.current, [id]: next }
    setSessions(sessionsRef.current)
    setOrder((prev) => [id, ...prev.filter((x) => x !== id)])
  }, [])

  const getSession = useCallback((id) => sessionsRef.current[id] || null, [])

  // Materialized list — sessions in `order`, with empty/system-only ones
  // hidden. The chat page seeds a session at mount, but if the user bounces
  // immediately we don't want a ghost row.
  const sessionList = order
    .map((id) => sessions[id])
    .filter((s) => s && s.messages?.some((m) => m.type !== 'system'))

  return (
    <ChatHistoryContext.Provider
      value={{ sessions: sessionList, startSession, updateSession, getSession }}
    >
      {children}
    </ChatHistoryContext.Provider>
  )
}

export const useChatHistory = () => useContext(ChatHistoryContext)
