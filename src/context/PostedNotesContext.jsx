import { createContext, useContext, useState, useCallback } from 'react'

// Holds the in-memory list of notes the user has published from /publish.
// The Home → Nearby feed prepends these above the mock notes, and tapping any
// of them opens the NoteViewer modal. Lives only for the current session
// (cleared on browser refresh) — same trade-off as the splash flag.
const PostedNotesContext = createContext()

export function PostedNotesProvider({ children }) {
  const [notes, setNotes] = useState([])

  const addNote = useCallback((note) => {
    // Stamp an id + creation timestamp so consumers can stable-key + display.
    const stamped = {
      id: `posted-${Date.now()}`,
      createdAt: Date.now(),
      ...note,
    }
    setNotes((prev) => [stamped, ...prev])
    return stamped
  }, [])

  return (
    <PostedNotesContext.Provider value={{ notes, addNote }}>
      {children}
    </PostedNotesContext.Provider>
  )
}

export const usePostedNotes = () => useContext(PostedNotesContext)
