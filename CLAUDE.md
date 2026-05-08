# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (port 5173, network-accessible)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint on all .js/.jsx files
```

No test runner is configured. Manual testing via browser or Playwright.

## Architecture

**RedExplore** is a React 19 + Vite SPA simulating a Xiaohongshu-style travel companion platform. Users describe a travel need, get matched with AI-powered local personas, chat with them in a group chat, and receive a generated travel guide.

### User Flow (Page Routing)

```
Home (/) → FindHelp (/find-help) → Matching (/matching) → GroupChat (/chat) → Guide (/guide)
```

State is passed between pages via React Router `location.state` (no global store). HashRouter is used (not BrowserRouter) to avoid server config requirements.

### Key Directories

- `src/pages/` — One component per route; each page handles its own data fetching and local state
- `src/api/mimo.js` — All AI calls go through here: persona responses, translation (EN↔ZH), and guide generation via the Mimo LLM API
- `src/context/LanguageContext.jsx` — Global EN/ZH toggle; every page uses `useLang()` to access `lang`, `toggleLang()`, and `t(path)` translation function
- `src/i18n/translations.js` — Nested EN/ZH string objects; accessed via dotted paths through `t()`
- `src/components/Header.jsx` — Shared header with back navigation and language toggle button

### AI Integration (`src/api/mimo.js`)

Three exported functions call the Mimo LLM endpoint:
- `getLocalResponse(persona, userMessage, chatHistory, category)` — Returns in-character Chinese reply from one of 3 local personas (Xiaomei, Ajie, Lisa)
- `translateText(text, fromLang, toLang)` — Auto-translation shown under chat messages
- `generateGuide(chatMessages, category, lang)` — Returns Markdown travel guide content

The `LOCAL_PERSONAS` array in `mimo.js` defines each persona's name, avatar, bio, and expertise — used in both Matching and GroupChat pages.

### Styling

Tailwind CSS 4 with a custom `@theme` block in `src/index.css`. Custom brand tokens:
- `--color-xhs-red: #FF2442` — primary accent
- `--color-xhs-bg: #FAFAFA` — page background
- Phone frame: 390×844px max-width, centered

Custom keyframe animations are defined in `src/index.css` (radar-ping, radar-sweep, fade-up, shimmer, etc.) and referenced with `animate-*` Tailwind classes.
