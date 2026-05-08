// Supported UI languages. Adding a new language: drop a section into
// translations.js with the same code and add an entry here. The picker
// renders this list in display order.
//
// `code`  — short identifier used internally and as a key into translations
// `flag`  — emoji shown in the chip + picker
// `label` — language name in its own script (shown to native speakers)
// `name`  — English name (used as a fallback / aria-label)
export const SUPPORTED_LANGUAGES = [
  { code: 'en', flag: '🇬🇧', label: 'English', name: 'English' },
  { code: 'zh', flag: '🇨🇳', label: '中文', name: 'Chinese' },
  { code: 'fr', flag: '🇫🇷', label: 'Français', name: 'French' },
  { code: 'es', flag: '🇪🇸', label: 'Español', name: 'Spanish' },
  { code: 'ja', flag: '🇯🇵', label: '日本語', name: 'Japanese' },
  { code: 'ko', flag: '🇰🇷', label: '한국어', name: 'Korean' },
]
