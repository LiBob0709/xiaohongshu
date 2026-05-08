// Shape adapters for the NoteViewer component. Lives separate from the
// component so React Fast Refresh stays happy (it complains when a file
// exports both a component and non-component values).
//
// NoteViewer expects a normalized object:
//   { cover: { kind, gradient/emoji or url }, title, body, author, ...metadata }
//
// Two callers feed it different raw shapes — chat-linked mock notes vs.
// user-published notes from /publish — and these helpers reshape them.

// Pull a localized field; fall back through current lang → en → zh → first.
const pickLocalized = (field, lang) => {
  if (typeof field === 'string') return field
  if (!field) return ''
  return field[lang] ?? field.en ?? field.zh ?? Object.values(field)[0] ?? ''
}

// Convert a chat-linked note (from CHAT_LINKED_NOTES in mockChatNotes) into the
// shape NoteViewer expects.
export function normalizeChatNote(rawNote, lang) {
  if (!rawNote) return null
  return {
    cover: { kind: 'gradient', gradient: rawNote.gradient, emoji: rawNote.emoji },
    title: pickLocalized(rawNote.title, lang),
    body: pickLocalized(rawNote.body, lang),
    author: pickLocalized(rawNote.author, lang),
    authorAvatar: rawNote.authorAvatar || '👤',
    likes: rawNote.likes,
    saves: rawNote.saves,
    comments: rawNote.comments,
    tags: rawNote.tags?.[lang] || rawNote.tags?.en || [],
    authorMeta: rawNote.authorMeta,
  }
}

// Convert a user-posted note (from PostedNotesContext) into the viewer shape.
// Posted notes already store final flat strings (the user typed them), so this
// is mostly a re-shape.
export function normalizePostedNote(posted) {
  if (!posted) return null
  return {
    cover: { kind: 'image', url: posted.coverDataUrl },
    title: posted.title,
    body: posted.body,
    author: 'You',
    authorAvatar: '😎',
    likes: 0,
    saves: 0,
    comments: 0,
    tags: posted.tags || [],
    authorMeta: posted.createdLabel,
  }
}
